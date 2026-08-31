"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { deleteConversationAction } from "@/app/actions";

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
          <div
            key={conversation.id}
            className={`mb-1 flex items-center gap-1 rounded-xl ${
              active ? "bg-accent/15" : "hover:bg-white/5"
            }`}
          >
            <Link
              href={`/chat/${conversation.id}`}
              className={`min-w-0 flex-1 px-3 py-2 text-sm ${
                active ? "text-accent" : "text-foreground/90"
              }`}
            >
              <span className="line-clamp-2">{conversation.title}</span>
            </Link>
            <form action={deleteConversationAction.bind(null, conversation.id)}>
              <button
                type="submit"
                aria-label="Sohbeti sil"
                className="mr-1 rounded-lg px-2 py-1 text-xs text-muted hover:bg-white/10 hover:text-coral"
              >
                Sil
              </button>
            </form>
          </div>
        );
      })}
    </>
  );
}
