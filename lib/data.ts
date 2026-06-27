import scenariosData from "@/data/scenarios.json";
import phrasesData from "@/data/phrases.json";
import { Scenario, PhraseCategory, VocabWord, Sentence } from "./types";
import { MasteryMap } from "./storage";

export const scenarios = scenariosData as Scenario[];
export const phraseCategories = phrasesData as PhraseCategory[];

export function getScenario(id: string): Scenario | undefined {
  return scenarios.find((s) => s.id === id);
}

export function getAllVocabulary(): VocabWord[] {
  return scenarios.flatMap((s) => s.vocabulary);
}

export function getAllSentences(): Sentence[] {
  return scenarios.flatMap((s) => s.sentences);
}

// Priority for "today" review: learning < familiar < new < mastered
const REVIEW_PRIORITY: Record<string, number> = {
  learning: 0,
  familiar: 1,
  new: 2,
  mastered: 3,
};

export function pickTodayWords(scenario: Scenario, count: number, masteryMap: MasteryMap): VocabWord[] {
  const sorted = [...scenario.vocabulary].sort((a, b) => {
    const pa = REVIEW_PRIORITY[masteryMap[a.id] || "new"];
    const pb = REVIEW_PRIORITY[masteryMap[b.id] || "new"];
    return pa - pb;
  });
  return sorted.slice(0, Math.max(1, Math.min(count, sorted.length)));
}

export function pickTodaySentences(scenario: Scenario, count: number): Sentence[] {
  return scenario.sentences.slice(0, Math.max(1, Math.min(count, scenario.sentences.length)));
}

export function overallStats(masteryMap: MasteryMap) {
  const all = getAllVocabulary();
  const counts = { new: 0, learning: 0, familiar: 0, mastered: 0 };
  for (const w of all) {
    const status = masteryMap[w.id] || "new";
    counts[status as keyof typeof counts]++;
  }
  return { total: all.length, ...counts };
}
