"use client";

import { useMemo, useRef, useState } from "react";
import { Copy, Mic, RotateCcw, Square, Volume2 } from "lucide-react";

function normalizeText(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function similarity(target: string, heard: string) {
  const targetWords = normalizeText(target).split(" ").filter(Boolean);
  const heardWords = new Set(normalizeText(heard).split(" ").filter(Boolean));
  if (targetWords.length === 0) return 0;
  const matched = targetWords.filter((word) => heardWords.has(word)).length;
  return Math.round((matched / targetWords.length) * 100);
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

  const score = useMemo(() => (heard ? similarity(text, heard) : null), [heard, text]);
  const buttonBase = inverted
    ? "border-white/30 bg-white/10 text-white active:bg-white/20"
    : "border-line bg-white text-ink active:bg-paper";

  function speak(times = 1) {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    let spoken = 0;
    const playNext = () => {
      if (spoken >= times) return;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-AU";
      utterance.rate = 0.82;
      utterance.pitch = 1;
      spoken += 1;
      utterance.onend = () => {
        if (spoken < times) {
          window.setTimeout(playNext, 650);
        }
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
        <p className={`mt-2 text-xs ${inverted ? "text-white/70" : "text-ink/50"}`}>
          這個瀏覽器不支援麥克風辨識；發音播放仍可使用。
        </p>
      )}

      {heard && (
        <div className={`mt-2 rounded-lg px-3 py-2 text-xs ${inverted ? "bg-white/10 text-white" : "bg-paper text-ink"}`}>
          <p className="font-semibold">我聽到：{heard}</p>
          <p className={inverted ? "text-white/70" : "text-ink/50"}>相似度：約 {score}%</p>
        </div>
      )}
    </div>
  );
}
