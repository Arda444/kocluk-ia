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
    <nav className="border-t border-white/10 px-1 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden">
      <div className="grid grid-cols-3 gap-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-xl px-1 py-2 text-center text-[11px] font-medium ${
              item.match ? "bg-accent/20 text-accent" : "text-muted"
            }`}
          >
            {item.label}
            {item.badge ? <span className="ml-1 text-[10px]">{item.badge}</span> : null}
          </Link>
        ))}
      </div>
    </nav>
  );
}
