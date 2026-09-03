"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CoachMarkdown } from "@/components/CoachMarkdown";
import { stripPlanBlocks } from "@/lib/plan";
import { primeSpeech, speakText, stopSpeaking } from "@/lib/speech";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

function visibleAssistant(text: string) {
  const cut = text.indexOf(":::plan");
  return cut >= 0 ? text.slice(0, cut).trim() : text;
}

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
  const [voiceOn, setVoiceOn] = useState(true);
  const [listening, setListening] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<{ stop: () => void } | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [conversationId, initialMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  useEffect(() => () => stopSpeaking(), []);

  async function sendText(content: string) {
    const trimmed = content.trim();
    if (!trimmed || busy) return;

    const userMessage: ChatMessage = {
      id: `local-${Date.now()}`,
      role: "user",
      content: trimmed,
    };
    const assistantId = `stream-${Date.now()}`;

    primeSpeech();
    if (!voiceOn) stopSpeaking();
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
        body: JSON.stringify({ conversationId, content: trimmed }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Yanıt oluşturulamadı. Lütfen tekrar dene.");
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

      if (voiceOn && assembled.trim()) {
        await speakText(stripPlanBlocks(assembled));
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
      setMessages((current) =>
        current.filter((message) => message.id !== assistantId && message.id !== userMessage.id),
      );
      setInput(trimmed);
    } finally {
      setBusy(false);
    }
  }

  function startBrowserListen() {
    const Speech = (
      window as unknown as {
        SpeechRecognition?: new () => {
          lang: string;
          interimResults: boolean;
          continuous: boolean;
          start: () => void;
          stop: () => void;
          onresult: ((event: {
            results: ArrayLike<{ 0: { transcript: string }; isFinal?: boolean }>;
          }) => void) | null;
          onerror: (() => void) | null;
          onend: (() => void) | null;
        };
        webkitSpeechRecognition?: new () => {
          lang: string;
          interimResults: boolean;
          continuous: boolean;
          start: () => void;
          stop: () => void;
          onresult: ((event: {
            results: ArrayLike<{ 0: { transcript: string }; isFinal?: boolean }>;
          }) => void) | null;
          onerror: (() => void) | null;
          onend: (() => void) | null;
        };
      }
    ).SpeechRecognition ?? (window as unknown as { webkitSpeechRecognition?: new () => never }).webkitSpeechRecognition;
    if (!Speech) return false;
    const recognition = new Speech();
    recognition.lang = "tr-TR";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      const results = Array.from(event.results);
      const transcript = results.map((result) => result[0].transcript).join(" ");
      setInput(transcript);
      const last = results[results.length - 1] as { isFinal?: boolean };
      if (last?.isFinal) {
        setListening(false);
        void sendText(transcript);
      }
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    return true;
  }

  async function startWhisperListen() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size) chunks.push(event.data);
    };
    recorder.onstop = async () => {
      stream.getTracks().forEach((track) => track.stop());
      const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
      const form = new FormData();
      form.append("audio", blob, "speech.webm");
      const response = await fetch("/api/transcribe", { method: "POST", body: form });
      const payload = (await response.json()) as { text?: string; error?: string };
      if (!response.ok || !payload.text) {
        setError(payload.error ?? "Ses anlaşılamadı.");
        setListening(false);
        return;
      }
      setListening(false);
      await sendText(payload.text);
    };
    mediaRef.current = recorder;
    recorder.start();
    window.setTimeout(() => {
      if (recorder.state === "recording") recorder.stop();
    }, 8000);
  }

  async function toggleListen() {
    if (listening) {
      recognitionRef.current?.stop();
      if (mediaRef.current?.state === "recording") mediaRef.current.stop();
      setListening(false);
      return;
    }
    setVoiceOn(true);
    primeSpeech();
    stopSpeaking();
    setListening(true);
    if (!startBrowserListen()) {
      try {
        await startWhisperListen();
      } catch {
        setListening(false);
        setError("Mikrofona izin ver.");
      }
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-6 md:px-8">
        {messages.map((message) => {
          const body =
            message.role === "assistant" ? visibleAssistant(message.content) : message.content;
          return (
            <article
              key={message.id}
              className={
                message.role === "user"
                  ? "ml-auto max-w-2xl rounded-2xl bg-accent px-4 py-3 text-white"
                  : "mr-auto w-full max-w-4xl rounded-3xl border border-white/10 bg-white/[0.04] px-4 py-4 shadow-[0_0_0_1px_rgba(124,255,178,0.06)] md:px-5"
              }
            >
              <p
                className={`mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                  message.role === "user" ? "opacity-70" : "text-accent"
                }`}
              >
                {message.role === "user" ? "Sen" : "Koç"}
              </p>
              {message.role === "assistant" ? (
                body ? <CoachMarkdown text={body} /> : <p className="text-sm text-muted">{busy ? "…" : ""}</p>
              ) : (
                <p className="whitespace-pre-wrap text-sm leading-6">{body}</p>
              )}
            </article>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void sendText(input);
        }}
        className="border-t border-white/10 bg-[#0c0c0e]/85 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:px-8 md:py-4"
      >
        {error ? (
          <p className="mb-3 rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-200">{error}</p>
        ) : null}
        <div className="mx-auto flex max-w-3xl items-end gap-2">
          <button
            type="button"
            onClick={() => {
              const next = !voiceOn;
              setVoiceOn(next);
              if (next) primeSpeech();
              else stopSpeaking();
            }}
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
              voiceOn ? "bg-accent text-white" : "border border-white/15 text-muted"
            }`}
            aria-label={voiceOn ? "Sesli yanıt açık" : "Sesli yanıt kapalı"}
            aria-pressed={voiceOn}
          >
            <span className="text-lg">{voiceOn ? "🔊" : "🔇"}</span>
          </button>
          <button
            type="button"
            onClick={() => void toggleListen()}
            className={`relative h-12 w-12 shrink-0 rounded-full ${
              listening ? "bg-wrong text-white" : "border border-white/15 text-muted"
            }`}
            aria-label="Sesli konuş"
          >
            {listening ? <span className="voice-ring absolute inset-0 rounded-full bg-coral/40" /> : null}
            <span className="relative text-lg">{listening ? "■" : "🎙"}</span>
          </button>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void sendText(input);
              }
            }}
            rows={1}
            placeholder=""
            aria-label="Mesaj"
            className="min-h-12 flex-1 resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-base outline-none ring-accent/40 focus:ring-2"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-black disabled:opacity-40"
            aria-label="Gönder"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
              <path
                d="M5 12h12M13 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        {listening ? <p className="mx-auto mt-2 max-w-3xl text-[11px] text-muted">Dinliyorum…</p> : null}
      </form>
    </div>
  );
}

