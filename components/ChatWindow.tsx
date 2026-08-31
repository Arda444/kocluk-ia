"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export function ChatWindow({
  conversationId,
  initialMessages,
}: {
  conversationId: string;
  initialMessages: ChatMessage[];
}) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [conversationId, initialMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  async function send(event: React.FormEvent) {
    event.preventDefault();
    const content = input.trim();
    if (!content || busy) return;

    const userMessage: ChatMessage = {
      id: `local-${Date.now()}`,
      role: "user",
      content,
    };
    const assistantId = `stream-${Date.now()}`;

    setInput("");
    setError(null);
    setBusy(true);
    setMessages((current) => [
      ...current,
      userMessage,
      { id: assistantId, role: "assistant", content: "" },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, content }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Yanıt alınamadı.");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Akış başlatılamadı.");

      const decoder = new TextDecoder();
      let assembled = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assembled += decoder.decode(value, { stream: true });
        const snapshot = assembled;
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantId ? { ...message, content: snapshot } : message,
          ),
        );
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
      setMessages((current) => current.filter((message) => message.id !== assistantId));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-6 md:px-8">
        {messages.map((message) => (
          <article
            key={message.id}
            className={
              message.role === "user"
                ? "ml-auto max-w-2xl rounded-2xl bg-amber-400 px-4 py-3 text-slate-950"
                : "mr-auto max-w-2xl rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100"
            }
          >
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide opacity-70">
              {message.role === "user" ? "Sen" : "Sınav Koçu"}
            </p>
            <p className="whitespace-pre-wrap text-sm leading-6">
              {message.content || (busy ? "…" : "")}
            </p>
          </article>
        ))}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={send}
        className="border-t border-white/10 bg-[#0b1020]/80 p-4 backdrop-blur md:px-8"
      >
        {error ? (
          <p className="mb-3 rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-200">{error}</p>
        ) : null}
        <div className="mx-auto flex max-w-3xl gap-2">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
            rows={1}
            placeholder="Bugünkü planı sor, deneme netini yaz, konu sırası iste…"
            className="min-h-12 flex-1 resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none ring-amber-400/40 placeholder:text-slate-500 focus:ring-2"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="h-12 rounded-2xl bg-amber-400 px-5 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:opacity-50"
          >
            Gönder
          </button>
        </div>
      </form>
    </div>
  );
}
