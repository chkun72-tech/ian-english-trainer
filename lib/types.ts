// Core data types for Ian English Trainer

export type MasteryStatus = "new" | "learning" | "familiar" | "mastered";

export interface VocabWord {
  id: string;
  scenarioId: string;
  word: string;
  zh: string;
  context: string;
  example: string;
}

export interface Sentence {
  id: string;
  scenarioId: string;
  en: string;
  zh: string;
}

export interface DialogueLine {
  speaker: "customer" | "you" | "friend" | "colleague";
  en: string;
  zhHint: string;
}

export interface Dialogue {
  id: string;
  scenarioId: string;
  title: string;
  lines: DialogueLine[];
}

export type QuizType = "mc" | "translate";

export interface QuizQuestion {
  id: string;
  scenarioId: string;
  type: QuizType;
  question: string;
  options?: string[];
  answer: string;
}

export interface ChecklistItem {
  item: string;
  zh: string;
}

export interface Scenario {
  id: string;
  name: string;
  nameZh: string;
  emoji: string;
  checklist: ChecklistItem[];
  checklistSentences: Sentence[];
  vocabulary: VocabWord[];
  sentences: Sentence[];
  dialogue: Dialogue;
  quiz: QuizQuestion[];
}

export interface PhraseItem {
  id: string;
  en: string;
  zh: string;
}

export interface PhraseCategory {
  id: string;
  name: string;
  nameZh: string;
  phrases: PhraseItem[];
}

export interface Settings {
  wordsPerDay: number;
  sentencesPerDay: number;
}
