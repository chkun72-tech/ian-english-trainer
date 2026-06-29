"use client";

import { VocabWord, MasteryStatus } from "@/lib/types";
import MasteryBadge from "./MasteryBadge";
import SpeechTools from "./SpeechTools";

export default function VocabCard({
  word,
  status,
  onCycleMastery,
}: {
  word: VocabWord;
  status: MasteryStatus;
  onCycleMastery: () => void;
}) {
  return (
    <div className="card">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-lg font-bold text-ink">{word.word}</p>
          <p className="text-accent-dark font-medium">{word.zh}</p>
        </div>
        <MasteryBadge status={status} onClick={onCycleMastery} />
      </div>
      <p className="text-xs text-ink/40 mt-2">場景：{word.context}</p>
      <p className="text-sm text-ink/80 mt-1 italic">&ldquo;{word.example}&rdquo;</p>
      <SpeechTools text={word.word} meaning={word.zh} compact />
      <SpeechTools text={word.example} compact />
    </div>
  );
}
