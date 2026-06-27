"use client";

import { MasteryStatus } from "@/lib/types";

const LABELS: Record<MasteryStatus, string> = {
  new: "New",
  learning: "Learning",
  familiar: "Familiar",
  mastered: "Mastered",
};

const STYLES: Record<MasteryStatus, string> = {
  new: "bg-status-new/15 text-status-new",
  learning: "bg-status-learning/15 text-status-learning",
  familiar: "bg-status-familiar/15 text-status-familiar",
  mastered: "bg-status-mastered/15 text-status-mastered",
};

export default function MasteryBadge({
  status,
  onClick,
}: {
  status: MasteryStatus;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STYLES[status]} ${
        onClick ? "active:opacity-70" : ""
      }`}
    >
      {LABELS[status]}
    </button>
  );
}
