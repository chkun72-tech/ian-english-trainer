"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { scenarios } from "@/lib/data";
import {
  getTodayScenarioId,
  setTodayScenarioId,
  getTodayProgress,
  getMasteryMap,
  TodayProgress,
} from "@/lib/storage";
import { overallStats } from "@/lib/data";

export default function HomePage() {
  const router = useRouter();
  const [todayId, setTodayId] = useState<string | null>(null);
  const [progress, setProgress] = useState<TodayProgress | null>(null);
  const [stats, setStats] = useState({ total: 0, new: 0, learning: 0, familiar: 0, mastered: 0 });

  useEffect(() => {
    setTodayId(getTodayScenarioId());
    setProgress(getTodayProgress());
    setStats(overallStats(getMasteryMap()));
  }, []);

  function pickScenario(id: string) {
    setTodayScenarioId(id);
    setTodayId(id);
    router.push("/lesson");
  }

  const stepsDone = progress
    ? [progress.vocabDone, progress.sentencesDone, progress.dialogueDone, progress.quizDone].filter(Boolean).length
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <p className="section-label">Ian English Trainer</p>
        <h1 className="page-title">今天想練哪個場景？</h1>
        <p className="text-ink/60 text-sm mt-1">選一個場景，開始今天 10–20 分鐘的英文練習</p>
      </div>

      {todayId && progress && (
        <div className="card flex items-center justify-between">
          <div>
            <p className="text-sm text-ink/60">今日進度</p>
            <p className="font-semibold">
              {scenarios.find((s) => s.id === todayId)?.emoji}{" "}
              {scenarios.find((s) => s.id === todayId)?.name}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-accent">{stepsDone}/4</p>
            <p className="text-xs text-ink/50">已完成步驟</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {scenarios.map((s) => (
          <button
            key={s.id}
            onClick={() => pickScenario(s.id)}
            className={`card text-left active:scale-[0.98] transition-transform ${
              todayId === s.id ? "border-accent ring-1 ring-accent" : ""
            }`}
          >
            <div className="text-3xl mb-1">{s.emoji}</div>
            <div className="font-semibold text-sm leading-tight">{s.name}</div>
            <div className="text-xs text-ink/50">{s.nameZh}</div>
          </button>
        ))}
      </div>

      <div className="card">
        <p className="section-label mb-3">單字總覽 ({stats.total} 個)</p>
        <div className="grid grid-cols-4 gap-2 text-center">
          <Stat label="New" value={stats.new} color="text-status-new" />
          <Stat label="Learning" value={stats.learning} color="text-status-learning" />
          <Stat label="Familiar" value={stats.familiar} color="text-status-familiar" />
          <Stat label="Mastered" value={stats.mastered} color="text-status-mastered" />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-[10px] text-ink/50">{label}</p>
    </div>
  );
}
