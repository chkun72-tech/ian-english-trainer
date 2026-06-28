"use client";

import { useState } from "react";
import { Dialogue } from "@/lib/types";
import SpeechTools from "./SpeechTools";

const SPEAKER_LABEL: Record<string, string> = {
  customer: "客戶 Customer",
  you: "你 You",
  friend: "朋友 Friend",
  colleague: "同事 Colleague",
};

export default function DialogueView({ dialogue }: { dialogue: Dialogue }) {
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});

  function toggle(i: number) {
    setRevealed((r) => ({ ...r, [i]: !r[i] }));
  }

  return (
    <div className="space-y-3">
      <p className="font-semibold text-ink">{dialogue.title}</p>
      {dialogue.lines.map((line, i) => {
        const isYou = line.speaker === "you";
        const isOpen = revealed[i] || !isYou;
        return (
          <div key={i} className={`flex ${isYou ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                isYou ? "bg-accent text-white" : "bg-white border border-line"
              }`}
            >
              <p className={`text-[10px] mb-1 ${isYou ? "text-white/70" : "text-ink/40"}`}>
                {SPEAKER_LABEL[line.speaker]}
              </p>
              {isOpen ? (
                <>
                  <p className="text-sm leading-snug">{line.en}</p>
                  <SpeechTools text={line.en} compact inverted={isYou} />
                </>
              ) : (
                <button onClick={() => toggle(i)} className="text-sm leading-snug underline">
                  {line.zhHint}（點我看英文）
                </button>
              )}
              {isYou && isOpen && <p className="text-[11px] text-white/70 mt-1">{line.zhHint}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
