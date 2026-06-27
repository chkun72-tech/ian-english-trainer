"use client";

import { useEffect, useState } from "react";
import { getSettings, setSettings as saveSettings } from "@/lib/storage";

export default function SettingsPage() {
  const [wordsPerDay, setWordsPerDay] = useState(6);
  const [sentencesPerDay, setSentencesPerDay] = useState(5);
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const s = getSettings();
    setWordsPerDay(s.wordsPerDay);
    setSentencesPerDay(s.sentencesPerDay);
    setMounted(true);
  }, []);

  function handleSave() {
    saveSettings({ wordsPerDay, sentencesPerDay });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <div>
        <p className="section-label">Settings</p>
        <h1 className="page-title">學習設定</h1>
      </div>

      <div className="card space-y-4">
        <div>
          <label className="text-sm font-semibold">每天學幾個單字？</label>
          <div className="flex items-center gap-3 mt-2">
            <Stepper value={wordsPerDay} onChange={setWordsPerDay} min={1} max={10} />
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold">每天學幾句句子？</label>
          <div className="flex items-center gap-3 mt-2">
            <Stepper value={sentencesPerDay} onChange={setSentencesPerDay} min={1} max={5} />
          </div>
        </div>
      </div>

      <button onClick={handleSave} className="btn-primary w-full">
        {saved ? "已儲存 ✓" : "儲存設定"}
      </button>

      <p className="text-xs text-ink/40 text-center">
        提示：建議從每天 5–8 個單字、5 句句子開始，養成每日 10–20 分鐘的習慣。
      </p>
    </div>
  );
}

function Stepper({
  value,
  onChange,
  min,
  max,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
}) {
  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-10 h-10 rounded-full bg-paper border border-line text-xl font-bold active:bg-line"
      >
        −
      </button>
      <span className="text-2xl font-bold w-10 text-center">{value}</span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        className="w-10 h-10 rounded-full bg-paper border border-line text-xl font-bold active:bg-line"
      >
        +
      </button>
    </div>
  );
}
