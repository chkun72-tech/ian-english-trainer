"use client";

import { useEffect, useMemo, useState } from "react";
import { scenarios, getAllVocabulary } from "@/lib/data";
import { getMasteryMap, setMastery, cycleMastery } from "@/lib/storage";
import { MasteryStatus } from "@/lib/types";
import VocabCard from "@/components/VocabCard";

export default function VocabularyPage() {
  const [filter, setFilter] = useState<string>("all");
  const [version, setVersion] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const masteryMap = useMemo(() => getMasteryMap(), [version]);
  const allWords = useMemo(() => getAllVocabulary(), []);

  const words = useMemo(
    () => (filter === "all" ? allWords : allWords.filter((w) => w.scenarioId === filter)),
    [allWords, filter]
  );

  function handleCycle(wordId: string, current: MasteryStatus) {
    setMastery(wordId, cycleMastery(current));
    setVersion((v) => v + 1);
  }

  if (!mounted) return null;

  return (
    <div className="space-y-4">
      <div>
        <p className="section-label">Vocabulary</p>
        <h1 className="page-title">所有單字</h1>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
            filter === "all" ? "bg-accent text-white" : "bg-white border border-line text-ink/60"
          }`}
        >
          全部
        </button>
        {scenarios.map((s) => (
          <button
            key={s.id}
            onClick={() => setFilter(s.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
              filter === s.id ? "bg-accent text-white" : "bg-white border border-line text-ink/60"
            }`}
          >
            {s.emoji} {s.nameZh}
          </button>
        ))}
      </div>

      <p className="text-xs text-ink/40">{words.length} 個單字</p>

      <div className="space-y-3">
        {words.map((w) => (
          <VocabCard
            key={w.id}
            word={w}
            status={masteryMap[w.id] || "new"}
            onCycleMastery={() => handleCycle(w.id, masteryMap[w.id] || "new")}
          />
        ))}
      </div>
    </div>
  );
}
