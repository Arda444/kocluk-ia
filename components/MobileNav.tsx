"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function MobileNav({ todayCount }: { todayCount: number }) {
  const pathname = usePathname();
  const items = [
    { href: "/chat", label: "Sohbet", match: pathname.startsWith("/chat") },
    {
      href: "/calendar",
      label: todayCount ? `Takvim · ${todayCount}` : "Takvim",
      match: pathname.startsWith("/calendar"),
    },
    { href: "/onboarding", label: "Profil", match: pathname.startsWith("/onboarding") },
  ];

  return (
    <nav className="border-t border-white/10 px-2 pb-2 pt-1 md:hidden">
      <div className="grid grid-cols-3 gap-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-xl px-2 py-2 text-center text-xs font-medium ${
              item.match ? "bg-accent/15 text-accent" : "text-muted"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
