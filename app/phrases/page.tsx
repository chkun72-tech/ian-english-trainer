"use client";

import { useState } from "react";
import { phraseCategories } from "@/lib/data";
import SpeechTools from "@/components/SpeechTools";

export default function PhrasesPage() {
  const [activeId, setActiveId] = useState(phraseCategories[0].id);
  const active = phraseCategories.find((c) => c.id === activeId)!;

  return (
    <div className="space-y-4">
      <div>
        <p className="section-label">Phrase Library</p>
        <h1 className="page-title">我的句庫</h1>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
        {phraseCategories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveId(c.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
              activeId === c.id ? "bg-accent text-white" : "bg-white border border-line text-ink/60"
            }`}
          >
            {c.nameZh}
          </button>
        ))}
      </div>

      <div className="space-y-2.5">
        {active.phrases.map((p) => (
          <div key={p.id} className="card">
            <p className="font-semibold">{p.en}</p>
            <p className="text-sm text-ink/50 mt-1">{p.zh}</p>
            <SpeechTools text={p.en} meaning={p.zh} />
          </div>
        ))}
      </div>
    </div>
  );
}
