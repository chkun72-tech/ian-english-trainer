"use client";

import { useEffect, useState, useCallback } from "react";
import { scenarios, phraseCategories } from "@/lib/data";
import { Shuffle } from "lucide-react";

interface PracticeItem {
  id: string;
  en: string;
  zh: string;
  source: string;
}

function buildPool(): PracticeItem[] {
  const fromScenarios: PracticeItem[] = scenarios.flatMap((s) =>
    s.sentences.map((sent) => ({ id: sent.id, en: sent.en, zh: sent.zh, source: s.nameZh }))
  );
  const fromPhrases: PracticeItem[] = phraseCategories.flatMap((c) =>
    c.phrases
      .filter((p) => !p.en.includes("___"))
      .map((p) => ({ id: p.id, en: p.en, zh: p.zh, source: c.nameZh }))
  );
  return [...fromScenarios, ...fromPhrases];
}

export default function PracticePage() {
  const [pool, setPool] = useState<PracticeItem[]>([]);
  const [current, setCurrent] = useState<PracticeItem | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const p = buildPool();
    setPool(p);
    setCurrent(p[Math.floor(Math.random() * p.length)]);
  }, []);

  const nextQuestion = useCallback(
    (currentPool: PracticeItem[]) => {
      if (currentPool.length === 0) return;
      const next = currentPool[Math.floor(Math.random() * currentPool.length)];
      setCurrent(next);
      setUserAnswer("");
      setRevealed(false);
    },
    []
  );

  if (!current) return null;

  return (
    <div className="space-y-5">
      <div>
        <p className="section-label">Practice</p>
        <h1 className="page-title">中文 → 英文</h1>
      </div>

      <div className="card">
        <p className="text-xs text-ink/40 mb-2">{current.source}</p>
        <p className="text-lg font-semibold leading-snug">{current.zh}</p>
      </div>

      <div>
        <p className="section-label mb-2">你的英文回答</p>
        <textarea
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Type your answer in English..."
          rows={3}
          className="w-full rounded-xl border border-line p-3 text-base focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      {!revealed ? (
        <button onClick={() => setRevealed(true)} className="btn-primary w-full">
          看參考答案
        </button>
      ) : (
        <div className="bg-teal-light rounded-xl p-4">
          <p className="text-xs text-teal/70 font-semibold mb-1">參考答案</p>
          <p className="text-teal font-semibold text-lg">{current.en}</p>
        </div>
      )}

      <button
        onClick={() => nextQuestion(pool)}
        className="btn-secondary w-full flex items-center justify-center gap-2"
      >
        <Shuffle size={16} /> 換下一句
      </button>
    </div>
  );
}
