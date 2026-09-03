"use client";

import { useFormStatus } from "react-dom";
import { createConversationAction } from "@/app/actions";

function NewChatSubmit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-10 w-full rounded-xl bg-accent text-sm font-semibold text-white disabled:opacity-60"
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
