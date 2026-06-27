"use client";

import { MasteryStatus, Settings } from "./types";

const KEYS = {
  mastery: "iet_mastery_v1",
  settings: "iet_settings_v1",
  todayScenario: "iet_today_scenario_v1",
  todayProgress: "iet_today_progress_v1", // { date: string, scenarioId, vocabDone, sentencesDone, dialogueDone, quizDone }
};

const isBrowser = () => typeof window !== "undefined";

function safeGet<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSet<T>(key: string, value: T) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore write errors (e.g. storage full / disabled)
  }
}

// ---------- Mastery ----------
export type MasteryMap = Record<string, MasteryStatus>;

export function getMasteryMap(): MasteryMap {
  return safeGet<MasteryMap>(KEYS.mastery, {});
}

export function getMastery(wordId: string): MasteryStatus {
  const map = getMasteryMap();
  return map[wordId] || "new";
}

export function setMastery(wordId: string, status: MasteryStatus) {
  const map = getMasteryMap();
  map[wordId] = status;
  safeSet(KEYS.mastery, map);
}

export const MASTERY_ORDER: MasteryStatus[] = ["new", "learning", "familiar", "mastered"];

export function cycleMastery(current: MasteryStatus): MasteryStatus {
  const idx = MASTERY_ORDER.indexOf(current);
  return MASTERY_ORDER[(idx + 1) % MASTERY_ORDER.length];
}

// ---------- Settings ----------
const DEFAULT_SETTINGS: Settings = {
  wordsPerDay: 6,
  sentencesPerDay: 5,
};

export function getSettings(): Settings {
  return safeGet<Settings>(KEYS.settings, DEFAULT_SETTINGS);
}

export function setSettings(settings: Settings) {
  safeSet(KEYS.settings, settings);
}

// ---------- Today's scenario ----------
export function getTodayScenarioId(): string | null {
  return safeGet<string | null>(KEYS.todayScenario, null);
}

export function setTodayScenarioId(id: string) {
  safeSet(KEYS.todayScenario, id);
}

// ---------- Today's progress (resets daily) ----------
export interface TodayProgress {
  date: string;
  scenarioId: string | null;
  vocabDone: boolean;
  sentencesDone: boolean;
  dialogueDone: boolean;
  quizDone: boolean;
}

function todayDateStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getTodayProgress(): TodayProgress {
  const fallback: TodayProgress = {
    date: todayDateStr(),
    scenarioId: getTodayScenarioId(),
    vocabDone: false,
    sentencesDone: false,
    dialogueDone: false,
    quizDone: false,
  };
  const stored = safeGet<TodayProgress>(KEYS.todayProgress, fallback);
  if (stored.date !== todayDateStr()) {
    // new day, reset
    return fallback;
  }
  return stored;
}

export function setTodayProgress(progress: Partial<TodayProgress>) {
  const current = getTodayProgress();
  const updated = { ...current, ...progress, date: todayDateStr() };
  safeSet(KEYS.todayProgress, updated);
}

export function markStepDone(step: "vocabDone" | "sentencesDone" | "dialogueDone" | "quizDone") {
  setTodayProgress({ [step]: true } as Partial<TodayProgress>);
}
