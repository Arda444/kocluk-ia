"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function IconPanel() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.6" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.6" stroke="currentColor" strokeWidth="1.8" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.6" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.6" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function IconCoach() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path
        d="M5 16.5V7.8A2.8 2.8 0 0 1 7.8 5h8.4A2.8 2.8 0 0 1 19 7.8v5.4A2.8 2.8 0 0 1 16.2 16H9.2L5 19.2V16.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <rect x="4" y="5.5" width="16" height="14" rx="2.2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 10h16M8 4v3.5M16 4v3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconStats() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path d="M5 18V11M10 18V7M15 18v-5M20 18V9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconNotes() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path
        d="M7 4.5h8.2L19.5 9v10.5A1.5 1.5 0 0 1 18 21H7a1.5 1.5 0 0 1-1.5-1.5v-15A1.5 1.5 0 0 1 7 4.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M15 4.8V9h4.2M8.5 13h7M8.5 16.5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconTodo() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <rect x="4.5" y="4.5" width="15" height="15" rx="2.2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 12.2 10.4 14.6 16 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MobileNav({ todayCount }: { todayCount: number }) {
  const pathname = usePathname();
  const items: Array<{
    href: string;
    label: string;
    badge: number;
    match: boolean;
    icon: ReactNode;
  }> = [
    { href: "/program", label: "Panel", badge: todayCount, match: pathname.startsWith("/program"), icon: <IconPanel /> },
    { href: "/chat", label: "Koç", badge: 0, match: pathname.startsWith("/chat"), icon: <IconCoach /> },
    { href: "/calendar", label: "Takvim", badge: 0, match: pathname.startsWith("/calendar"), icon: <IconCalendar /> },
    { href: "/stats", label: "Özet", badge: 0, match: pathname.startsWith("/stats"), icon: <IconStats /> },
    { href: "/notes", label: "Notlar", badge: 0, match: pathname.startsWith("/notes"), icon: <IconNotes /> },
    { href: "/todos", label: "To-do", badge: 0, match: pathname.startsWith("/todos"), icon: <IconTodo /> },
  ];

  return (
    <nav className="border-t border-white/10 bg-[#0a102c] px-1 pt-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] md:hidden">
      <div className="grid grid-cols-6">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={item.match ? "page" : undefined}
            className={`relative flex flex-col items-center justify-center gap-1 py-1.5 text-[10px] font-medium ${
              item.match ? "text-accent" : "text-muted"
            }`}
          >
            <span
              className={`relative flex h-8 w-8 items-center justify-center rounded-xl ${
                item.match ? "bg-accent text-white" : "bg-white/5 text-muted"
              }`}
            >
              {item.icon}
              {item.badge ? (
                <span className="absolute -right-1.5 -top-1 min-w-4 rounded-full bg-wrong px-1 text-center text-[9px] leading-4 text-white">
                  {item.badge}
                </span>
              ) : null}
            </span>
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
