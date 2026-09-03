"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function MobileNav({ todayCount }: { todayCount: number }) {
  const pathname = usePathname();
  const items = [
    { href: "/program", label: "Panel", badge: todayCount, match: pathname.startsWith("/program") },
    { href: "/chat", label: "Koç", badge: 0, match: pathname.startsWith("/chat") },
    { href: "/calendar", label: "Takvim", badge: 0, match: pathname.startsWith("/calendar") },
    { href: "/stats", label: "Özet", badge: 0, match: pathname.startsWith("/stats") },
    { href: "/notes", label: "Notlar", badge: 0, match: pathname.startsWith("/notes") },
    { href: "/todos", label: "To-do", badge: 0, match: pathname.startsWith("/todos") },
  ];

  return (
    <nav className="border-t border-white/10 bg-[#0a102c] px-2 pt-2 pb-[max(0.65rem,env(safe-area-inset-bottom))] md:hidden">
      <div className="grid grid-cols-3 gap-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex h-11 items-center justify-center gap-1 rounded-xl text-sm font-semibold ${
              item.match
                ? "bg-accent text-white shadow-[0_8px_20px_rgba(139,108,255,0.28)]"
                : "border border-white/15 bg-white/5 text-foreground"
            }`}
          >
            {item.label}
            {item.badge ? (
              <span
                className={`min-w-5 rounded-full px-1.5 text-center text-[10px] leading-5 ${
                  item.match ? "bg-white/20" : "bg-accent/25 text-accent"
                }`}
              >
                {item.badge}
              </span>
            ) : null}
          </Link>
        ))}
      </div>
    </nav>
  );
}
