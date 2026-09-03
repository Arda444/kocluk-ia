"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConversationList } from "@/components/ConversationList";
import { NewChatButton } from "@/components/SidebarActions";

export function SideNav({
  todayCount,
  conversations,
}: {
  todayCount: number;
  conversations: Array<{ id: string; title: string }>;
}) {
  const pathname = usePathname();
  const onChat = pathname.startsWith("/chat");

  const items = [
    { href: "/program", label: todayCount ? `Panel · ${todayCount}` : "Panel", match: pathname.startsWith("/program") },
    { href: "/chat", label: "Koç", match: onChat },
    { href: "/calendar", label: "Takvim", match: pathname.startsWith("/calendar") },
    { href: "/stats", label: "İstatistik", match: pathname.startsWith("/stats") },
    { href: "/notes", label: "Notlar", match: pathname.startsWith("/notes") },
    { href: "/todos", label: "To-do", match: pathname.startsWith("/todos") },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mt-4 grid gap-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex h-10 items-center justify-center rounded-xl text-sm font-semibold ${
              item.match
                ? "bg-accent text-white"
                : "border border-white/10 text-foreground hover:border-accent/40"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
      {onChat ? (
        <div className="mt-4">
          <NewChatButton />
        </div>
      ) : null}
      {onChat ? (
        <nav className="mt-2 min-h-0 flex-1 overflow-y-auto">
          <ConversationList conversations={conversations} />
        </nav>
      ) : (
        <div className="min-h-0 flex-1" />
      )}
    </div>
  );
}
