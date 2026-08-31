"use client";

import { useFormStatus } from "react-dom";
import { createConversationAction, signOutAction } from "@/app/actions";

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className="w-full rounded-lg px-3 py-2 text-left text-sm text-muted transition hover:bg-white/5 hover:text-foreground"
      >
        Çıkış
      </button>
    </form>
  );
}

function NewChatSubmit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-10 w-full rounded-xl bg-accent text-sm font-semibold text-black disabled:opacity-60"
    >
      {pending ? "Açılıyor…" : "Yeni sohbet"}
    </button>
  );
}

export function NewChatButton() {
  return (
    <form action={createConversationAction}>
      <NewChatSubmit />
    </form>
  );
}
