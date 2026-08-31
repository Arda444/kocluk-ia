"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function ConversationList({
  conversations,
}: {
  conversations: { id: string; title: string }[];
}) {
  const pathname = usePathname();

  if (conversations.length === 0) {
    return <p className="px-2 py-4 text-sm text-muted">Henüz sohbet yok.</p>;
  }

  return (
    <>
      {conversations.map((conversation) => {
        const active = pathname === `/chat/${conversation.id}`;
        return (
          <Link
            key={conversation.id}
            href={`/chat/${conversation.id}`}
            className={`mb-1 block rounded-xl px-3 py-2 text-sm transition ${
              active ? "bg-accent/15 text-accent" : "text-foreground/90 hover:bg-white/5"
            }`}
          >
            <span className="line-clamp-2">{conversation.title}</span>
          </Link>
        );
      })}
    </>
  );
}
