"use client";

import { useMemo, useRef, useState } from "react";
import { Copy, Mic, RotateCcw, Snail, Square, Volume2 } from "lucide-react";

function wordsFrom(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
}

function compareSpeech(target: string, heard: string) {
  const targetWords = wordsFrom(target);
  const heardWords = wordsFrom(heard);
  const heardSet = new Set(heardWords);
  const targetSet = new Set(targetWords);
  const matched = targetWords.filter((word) => heardSet.has(word));
  const missing = targetWords.filter((word, index) => !heardSet.has(word) && targetWords.indexOf(word) === index);
  const extra = heardWords.filter((word, index) => !targetSet.has(word) && heardWords.indexOf(word) === index);
  const score = targetWords.length === 0 ? 0 : Math.round((matched.length / targetWords.length) * 100);

  return { targetWords, heardWords, heardSet, missing, extra, score };
}

function feedbackLabel(score: number) {
  if (score >= 90) return "很穩，可以加快速度再念一次。";
  if (score >= 70) return "接近了，重點修正黃色單字。";
  return "先慢聽，再把句子拆成 2-3 段跟讀。";
}

function getSpeechRecognition() {
  if (typeof window === "undefined") return null;
  const browserWindow = window as typeof window & {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  };
  return browserWindow.SpeechRecognition || browserWindow.webkitSpeechRecognition || null;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
}

interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

export default function SpeechTools({
  text,
  compact = false,
  inverted = false,
}: {
  text: string;
  compact?: boolean;
  inverted?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState("");
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const feedback = useMemo(() => (heard ? compareSpeech(text, heard) : null), [heard, text]);
  const buttonBase = inverted
    ? "border-white/30 bg-white/10 text-white active:bg-white/20"
    : "border-line bg-white text-ink active:bg-paper";
  const mutedText = inverted ? "text-white/70" : "text-ink/50";

  function speak(times = 1, rate = 0.82) {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    let spoken = 0;
    const playNext = () => {
      if (spoken >= times) return;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-AU";
      utterance.rate = rate;
      utterance.pitch = 1;
      spoken += 1;
      utterance.onend = () => {
        if (spoken < times) window.setTimeout(playNext, 650);
      };
      window.speechSynthesis.speak(utterance);
    };

    playNext();
  }

  async function copyText() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1300);
    } catch {
      setCopied(false);
    }
  }

  function startListening() {
    const Recognition = getSpeechRecognition();
    if (!Recognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new Recognition();
    recognition.lang = "en-AU";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript || "";
      setHeard(transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    setHeard("");
    setListening(true);
    recognition.start();
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  return (
    <div className={compact ? "mt-2" : "mt-3"}>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => speak(1)}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${buttonBase}`}
          aria-label="播放英文發音"
        >
          <Volume2 size={14} /> 聽
        </button>
        <button
          type="button"
          onClick={() => speak(1, 0.58)}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${buttonBase}`}
          aria-label="慢速播放英文發音"
        >
          <Snail size={14} /> 慢聽
        </button>
        <button
          type="button"
          onClick={() => speak(3)}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${buttonBase}`}
          aria-label="連續播放三次"
        >
          <RotateCcw size={14} /> 3次
        </button>
        <button
          type="button"
          onClick={copyText}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${buttonBase}`}
          aria-label="複製英文"
        >
          <Copy size={14} /> {copied ? "已複製" : "複製"}
        </button>
        <button
          type="button"
          onClick={listening ? stopListening : startListening}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${
            listening ? "border-red-300 bg-red-50 text-red-600" : buttonBase
          }`}
          aria-label="開始跟讀辨識"
        >
          {listening ? <Square size={14} /> : <Mic size={14} />}
          {listening ? "停止" : "跟讀"}
        </button>
      </div>

      {!speechSupported && (
        <p className={`mt-2 text-xs ${mutedText}`}>這個瀏覽器不支援麥克風辨識；發音播放仍可使用。</p>
      )}

      {feedback && (
        <div className={`mt-2 rounded-lg px-3 py-2 text-xs ${inverted ? "bg-white/10 text-white" : "bg-paper text-ink"}`}>
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold">我聽到：{heard}</p>
            <span className={`rounded-full px-2 py-0.5 font-bold ${feedback.score >= 80 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
              {feedback.score}%
            </span>
          </div>
          <p className={`mt-1 ${mutedText}`}>糾正建議：{feedbackLabel(feedback.score)}</p>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {feedback.targetWords.map((word, index) => {
              const matched = feedback.heardSet.has(word);
              return (
                <span
                  key={`${word}-${index}`}
                  className={`rounded-md px-1.5 py-0.5 font-semibold ${
                    matched ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {word}
                </span>
              );
            })}
          </div>

          {(feedback.missing.length > 0 || feedback.extra.length > 0) && (
            <div className={`mt-2 space-y-1 ${mutedText}`}>
              {feedback.missing.length > 0 && <p>重念這些字：{feedback.missing.join(", ")}</p>}
              {feedback.extra.length > 0 && <p>可能多念了：{feedback.extra.join(", ")}</p>}
            </div>
          )}

          <p className={`mt-2 ${mutedText}`}>練法：慢聽一次 → 跟讀一次 → 看黃色字修正 → 再跟讀一次。</p>
        </div>
      )}
    </div>
  );
}
