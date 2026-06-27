"use client";

import { useState } from "react";
import { QuizQuestion } from "@/lib/types";
import { CheckCircle2, XCircle } from "lucide-react";

export default function QuizView({ questions, onComplete }: { questions: QuizQuestion[]; onComplete?: () => void }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [finished, setFinished] = useState(false);

  function selectMc(q: QuizQuestion, option: string) {
    if (answers[q.id]) return;
    setAnswers((a) => ({ ...a, [q.id]: option }));
    checkAllDone({ ...answers, [q.id]: option });
  }

  function revealTranslate(q: QuizQuestion) {
    setRevealed((r) => ({ ...r, [q.id]: true }));
    setAnswers((a) => ({ ...a, [q.id]: "revealed" }));
    checkAllDone({ ...answers, [q.id]: "revealed" });
  }

  function checkAllDone(updated: Record<string, string>) {
    const allDone = questions.every((q) => updated[q.id]);
    if (allDone && !finished) {
      setFinished(true);
      onComplete?.();
    }
  }

  const correctCount = questions.filter((q) => q.type === "mc" && answers[q.id] === q.answer).length;
  const mcCount = questions.filter((q) => q.type === "mc").length;

  return (
    <div className="space-y-4">
      {questions.map((q, idx) => (
        <div key={q.id} className="card">
          <p className="text-sm text-ink/50 mb-1">第 {idx + 1} 題</p>
          <p className="font-semibold mb-3">{q.question}</p>

          {q.type === "mc" && q.options && (
            <div className="space-y-2">
              {q.options.map((opt) => {
                const chosen = answers[q.id] === opt;
                const isCorrect = opt === q.answer;
                const showState = !!answers[q.id];
                let style = "border-line bg-white";
                if (showState && chosen && isCorrect) style = "border-status-mastered bg-status-mastered/10";
                if (showState && chosen && !isCorrect) style = "border-red-400 bg-red-50";
                if (showState && !chosen && isCorrect) style = "border-status-mastered bg-status-mastered/5";
                return (
                  <button
                    key={opt}
                    onClick={() => selectMc(q, opt)}
                    disabled={!!answers[q.id]}
                    className={`w-full text-left px-3 py-2.5 rounded-xl border text-sm flex items-center justify-between ${style}`}
                  >
                    <span>{opt}</span>
                    {showState && isCorrect && <CheckCircle2 size={16} className="text-status-mastered" />}
                    {showState && chosen && !isCorrect && <XCircle size={16} className="text-red-500" />}
                  </button>
                );
              })}
            </div>
          )}

          {q.type === "translate" && (
            <div>
              {!revealed[q.id] ? (
                <button onClick={() => revealTranslate(q)} className="btn-secondary text-sm w-full">
                  看參考答案
                </button>
              ) : (
                <div className="bg-teal-light text-teal rounded-xl px-3 py-2.5 text-sm font-medium">
                  {q.answer}
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {finished && mcCount > 0 && (
        <div className="card bg-accent-light border-accent text-center">
          <p className="font-semibold text-accent-dark">
            答對 {correctCount} / {mcCount} 題選擇題 🎉
          </p>
        </div>
      )}
    </div>
  );
}
