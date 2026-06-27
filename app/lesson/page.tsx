"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { scenarios, getScenario, pickTodayWords, pickTodaySentences } from "@/lib/data";
import {
  getTodayScenarioId,
  getSettings,
  getMasteryMap,
  getMastery,
  setMastery,
  cycleMastery,
  markStepDone,
  getTodayProgress,
} from "@/lib/storage";
import { MasteryStatus } from "@/lib/types";
import VocabCard from "@/components/VocabCard";
import DialogueView from "@/components/DialogueView";
import QuizView from "@/components/QuizView";
import ChecklistView from "@/components/ChecklistView";

type Tab = "vocab" | "sentences" | "dialogue" | "quiz" | "checklist";

const TABS: { id: Tab; label: string }[] = [
  { id: "vocab", label: "單字" },
  { id: "sentences", label: "句子" },
  { id: "dialogue", label: "對話" },
  { id: "quiz", label: "測驗" },
  { id: "checklist", label: "Checklist" },
];

export default function LessonPage() {
  const [scenarioId, setScenarioId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("vocab");
  const [masteryVersion, setMasteryVersion] = useState(0);
  const [stepsDone, setStepsDone] = useState({ vocabDone: false, sentencesDone: false, dialogueDone: false, quizDone: false });

  useEffect(() => {
    setScenarioId(getTodayScenarioId());
    const p = getTodayProgress();
    setStepsDone({
      vocabDone: p.vocabDone,
      sentencesDone: p.sentencesDone,
      dialogueDone: p.dialogueDone,
      quizDone: p.quizDone,
    });
  }, []);

  const scenario = scenarioId ? getScenario(scenarioId) : undefined;
  const settings = useMemo(() => getSettings(), []);

  const masteryMap = useMemo(() => getMasteryMap(), [masteryVersion]);
  const todayWords = useMemo(
    () => (scenario ? pickTodayWords(scenario, settings.wordsPerDay, masteryMap) : []),
    [scenario, settings.wordsPerDay, masteryMap]
  );
  const todaySentences = useMemo(
    () => (scenario ? pickTodaySentences(scenario, settings.sentencesPerDay) : []),
    [scenario, settings.sentencesPerDay]
  );

  function handleCycle(wordId: string, current: MasteryStatus) {
    const next = cycleMastery(current);
    setMastery(wordId, next);
    setMasteryVersion((v) => v + 1);
    markStepDone("vocabDone");
    setStepsDone((s) => ({ ...s, vocabDone: true }));
  }

  function markSentencesDone() {
    markStepDone("sentencesDone");
    setStepsDone((s) => ({ ...s, sentencesDone: true }));
  }

  function markDialogueDone() {
    markStepDone("dialogueDone");
    setStepsDone((s) => ({ ...s, dialogueDone: true }));
  }

  function markQuizDone() {
    markStepDone("quizDone");
    setStepsDone((s) => ({ ...s, quizDone: true }));
  }

  if (!scenarioId || !scenario) {
    return (
      <div className="space-y-4 text-center pt-10">
        <p className="text-ink/60">你還沒有選擇今天的場景。</p>
        <Link href="/" className="btn-primary inline-block">
          去選擇場景
        </Link>
      </div>
    );
  }

  const doneCount = Object.values(stepsDone).filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="section-label">Today Lesson</p>
          <h1 className="page-title">
            {scenario.emoji} {scenario.name}
          </h1>
        </div>
        <Link href="/" className="text-xs text-accent font-medium">
          換場景
        </Link>
      </div>

      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i < doneCount ? "bg-accent" : "bg-line"}`}
          />
        ))}
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
              tab === t.id ? "bg-accent text-white" : "bg-white border border-line text-ink/60"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "vocab" && (
        <div className="space-y-3">
          <p className="text-xs text-ink/50">今天 {todayWords.length} 個單字（優先複習 Learning / Familiar）。點右上角標籤可切換掌握程度。</p>
          {todayWords.map((w) => (
            <VocabCard
              key={w.id}
              word={w}
              status={getMastery(w.id)}
              onCycleMastery={() => handleCycle(w.id, getMastery(w.id))}
            />
          ))}
        </div>
      )}

      {tab === "sentences" && (
        <div className="space-y-3">
          <p className="text-xs text-ink/50">今天 {todaySentences.length} 句實用句子。</p>
          {todaySentences.map((s) => (
            <div key={s.id} className="card">
              <p className="font-semibold">{s.en}</p>
              <p className="text-sm text-ink/50 mt-1">{s.zh}</p>
            </div>
          ))}
          {!stepsDone.sentencesDone ? (
            <button onClick={markSentencesDone} className="btn-primary w-full">
              我已經讀完這些句子
            </button>
          ) : (
            <p className="text-center text-sm text-status-mastered font-medium">已完成 ✓</p>
          )}
        </div>
      )}

      {tab === "dialogue" && (
        <div className="space-y-4">
          <DialogueView dialogue={scenario.dialogue} />
          {!stepsDone.dialogueDone ? (
            <button onClick={markDialogueDone} className="btn-primary w-full">
              我已經練習完對話
            </button>
          ) : (
            <p className="text-center text-sm text-status-mastered font-medium">已完成 ✓</p>
          )}
        </div>
      )}

      {tab === "quiz" && <QuizView questions={scenario.quiz} onComplete={markQuizDone} />}

      {tab === "checklist" && (
        <ChecklistView checklist={scenario.checklist} sentences={scenario.checklistSentences} />
      )}
    </div>
  );
}
