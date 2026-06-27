"use client";

import { ChecklistItem, Sentence } from "@/lib/types";
import { Wrench } from "lucide-react";

export default function ChecklistView({
  checklist,
  sentences,
}: {
  checklist: ChecklistItem[];
  sentences: Sentence[];
}) {
  return (
    <div className="space-y-4">
      <div className="card">
        <p className="section-label mb-2 flex items-center gap-1">
          <Wrench size={12} /> Tools Checklist
        </p>
        <div className="grid grid-cols-2 gap-2">
          {checklist.map((c) => (
            <div key={c.item} className="bg-paper rounded-lg px-3 py-2 border border-line">
              <p className="text-sm font-medium">{c.item}</p>
              <p className="text-xs text-ink/50">{c.zh}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <p className="section-label mb-2">On-site Sentences</p>
        <div className="space-y-2">
          {sentences.map((s) => (
            <div key={s.id} className="border-b border-line last:border-0 pb-2 last:pb-0">
              <p className="text-sm font-medium">{s.en}</p>
              <p className="text-xs text-ink/50">{s.zh}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
