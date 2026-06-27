"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Library, MessageSquare, Settings } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/lesson", label: "Lesson", icon: BookOpen },
  { href: "/vocabulary", label: "Vocab", icon: Library },
  { href: "/phrases", label: "Phrases", icon: MessageSquare },
  { href: "/practice", label: "Practice", icon: MessageSquare },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-line z-50">
      <div className="max-w-md mx-auto grid grid-cols-6">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center py-2.5 gap-0.5 ${
                active ? "text-accent" : "text-ink/50"
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
