"use client";

import { useEffect, useState } from "react";
import { useTimer } from "@/components/TimerProvider";
import { subjectDot } from "@/lib/subjects";
import { formatClock, pad2, shortTopic } from "@/lib/time";

export function TimerHud() {
  const { task, running, fullscreen, elapsed, pause, resume, stop, reset, setFullscreen } = useTimer();
  const [askReset, setAskReset] = useState(false);

  useEffect(() => {
    setAskReset(false);
  }, [task?.id, fullscreen]);

  if (!task) return null;

  const target = Math.max(1, task.targetMinutes) * 60;
  const over = elapsed > target;
  const remaining = Math.max(0, target - elapsed);
  const ratio = Math.min(100, (elapsed / target) * 100);

  function requestReset() {
    if (elapsed <= 0) return;
    setAskReset(true);
  }

  function confirmReset() {
    reset();
    setAskReset(false);
  }

  if (fullscreen) {
    return (
      <FullscreenTimer
        subject={task.subject}
        title={shortTopic(task.title)}
        elapsed={elapsed}
        targetMinutes={task.targetMinutes}
        targetSeconds={target}
        remaining={remaining}
        ratio={ratio}
        over={over}
        running={running}
        askReset={askReset}
        onPause={pause}
        onResume={resume}
        onMinimize={() => setFullscreen(false)}
        onClose={stop}
        onAskReset={requestReset}
        onConfirmReset={confirmReset}
        onCancelReset={() => setAskReset(false)}
      />
    );
  }

  return (
    <div className="fixed right-3 bottom-[8.25rem] z-40 w-[min(100%-1.5rem,19rem)] rounded-2xl border border-white/15 bg-[#12163a]/95 p-3 shadow-2xl backdrop-blur md:right-4 md:bottom-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] tracking-[0.16em] text-accent">SÜRE</p>
          <p className="truncate text-sm">{shortTopic(task.title)}</p>
        </div>
        <div className="flex items-center gap-2">
          <p className={`font-serif text-2xl tabular-nums ${over ? "text-wrong" : "text-correct"}`}>
            {formatClock(elapsed)}
          </p>
          <button
            type="button"
            onClick={stop}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-sm text-muted hover:text-foreground"
            aria-label="Kronometreyi kapat"
            title="Kapat"
          >
            ×
          </button>
        </div>
      </div>
      <p className="mt-1 text-[11px] text-muted">
        Hedef {task.targetMinutes} dk · {over ? "hedef aşıldı" : `${formatClock(remaining)} kaldı`}
      </p>
      {askReset ? (
        <ResetPrompt onConfirm={confirmReset} onCancel={() => setAskReset(false)} />
      ) : (
        <>
          <div className="mt-3 flex gap-2">
            {running ? (
              <button type="button" onClick={pause} className="h-8 flex-1 rounded-lg bg-accent text-xs font-semibold text-white">
                Duraklat
              </button>
            ) : (
              <button type="button" onClick={resume} className="h-8 flex-1 rounded-lg bg-accent text-xs font-semibold text-white">
                Devam
              </button>
            )}
            <button type="button" onClick={() => setFullscreen(true)} className="h-8 rounded-lg border border-white/15 px-2 text-xs">
              Tam ekran
            </button>
          </div>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={requestReset}
              disabled={elapsed <= 0}
              className="h-8 flex-1 rounded-lg border border-white/15 text-xs text-muted disabled:opacity-40"
            >
              Sıfırla
            </button>
            <button type="button" onClick={stop} className="h-8 flex-1 rounded-lg border border-white/15 text-xs">
              Kapat
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function ResetPrompt({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="mt-3 rounded-xl border border-wrong/30 bg-wrong/10 px-3 py-2 text-left">
      <p className="text-sm">Süre 00:00 olsun mu? Tutulan kayıt da silinir.</p>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={onConfirm}
          className="h-8 rounded-lg bg-wrong px-3 text-xs font-semibold text-white"
        >
          Sıfırla
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="h-8 rounded-lg border border-white/15 px-3 text-xs"
        >
          Vazgeç
        </button>
      </div>
    </div>
  );
}

function FullscreenTimer({
  subject,
  title,
  elapsed,
  targetMinutes,
  targetSeconds,
  remaining,
  ratio,
  over,
  running,
  askReset,
  onPause,
  onResume,
  onMinimize,
  onClose,
  onAskReset,
  onConfirmReset,
  onCancelReset,
}: {
  subject: string;
  title: string;
  elapsed: number;
  targetMinutes: number;
  targetSeconds: number;
  remaining: number;
  ratio: number;
  over: boolean;
  running: boolean;
  askReset: boolean;
  onPause: () => void;
  onResume: () => void;
  onMinimize: () => void;
  onClose: () => void;
  onAskReset: () => void;
  onConfirmReset: () => void;
  onCancelReset: () => void;
}) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (event.code === "Space") {
        event.preventDefault();
        if (running) onPause();
        else onResume();
      }
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [running, onPause, onResume, onClose]);

  const glow = over
    ? "rgba(255, 107, 122, 0.28)"
    : running
      ? "rgba(139, 108, 255, 0.38)"
      : "rgba(139, 108, 255, 0.16)";

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col text-center"
      style={{
        background: `radial-gradient(720px 520px at 50% 28%, ${glow}, transparent 62%), #070b1c`,
        paddingTop: "max(1rem, env(safe-area-inset-top))",
        paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
      }}
    >
      <header className="grid grid-cols-3 items-center px-4">
        <button
          type="button"
          onClick={onMinimize}
          className="h-10 justify-self-start rounded-full border border-white/12 px-3 text-sm text-muted hover:text-foreground"
        >
          Küçült
        </button>
        <p className="text-[11px] font-medium tracking-[0.22em] text-accent">KRONOMETRE</p>
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center justify-self-end rounded-full border border-white/12 text-xl leading-none text-muted hover:text-foreground"
          aria-label="Kronometreyi kapat"
        >
          ×
        </button>
      </header>

      <div className="mt-5 px-6">
        <p className="inline-flex items-center gap-2 text-sm text-muted">
          <span className={`h-2 w-2 rounded-full ${subjectDot(subject)}`} />
          {subject}
        </p>
        <h2 className="mt-2 font-serif text-2xl leading-tight md:text-4xl">{title}</h2>
        <p
          className={`mx-auto mt-2 w-fit rounded-full px-3 py-1 text-xs font-semibold ${
            over ? "bg-wrong/15 text-wrong" : running ? "bg-correct/15 text-correct" : "bg-white/10 text-muted"
          }`}
        >
          {over ? "Hedef aşıldı" : running ? "Çalışıyor" : "Durdu"}
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4">
        <div className="relative grid place-items-center">
          <ProgressRing ratio={ratio} over={over} running={running} />
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
            <ClockFace seconds={elapsed} running={running} over={over} />
          </div>
        </div>
        <p className="mt-6 text-sm text-muted">
          {over ? (
            <>
              Hedef {targetMinutes} dk aşıldı · <span className="text-wrong">+{formatClock(elapsed - targetSeconds)}</span>
            </>
          ) : (
            <>
              Kalan <span className="text-foreground">{formatClock(remaining)}</span>
              {" · hedef "}
              {targetMinutes} dk
            </>
          )}
        </p>
      </div>

      <div className="px-5 pb-4">
        {askReset ? (
          <div className="mx-auto max-w-sm">
            <ResetPrompt onConfirm={onConfirmReset} onCancel={onCancelReset} />
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={running ? onPause : onResume}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent text-white shadow-[0_12px_40px_rgba(139,108,255,0.45)] md:h-[4.5rem] md:w-[4.5rem]"
              aria-label={running ? "Duraklat" : "Devam"}
            >
              {running ? (
                <span className="flex gap-1.5">
                  <span className="h-6 w-1.5 rounded-sm bg-white" />
                  <span className="h-6 w-1.5 rounded-sm bg-white" />
                </span>
              ) : (
                <span className="ml-1 h-0 w-0 border-y-[11px] border-y-transparent border-l-[18px] border-l-white" />
              )}
            </button>
            <p className="mt-2 text-[11px] text-muted">{running ? "Duraklat" : "Devam"} · Esc kapatır</p>
            <div className="mx-auto mt-5 grid w-full max-w-md grid-cols-3 gap-2">
              <button
                type="button"
                onClick={onAskReset}
                disabled={elapsed <= 0}
                className="h-12 rounded-2xl border border-white/12 text-sm text-muted disabled:opacity-40"
              >
                Sıfırla
              </button>
              <button type="button" onClick={onMinimize} className="h-12 rounded-2xl border border-white/12 text-sm">
                Küçült
              </button>
              <button type="button" onClick={onClose} className="h-12 rounded-2xl border border-white/12 text-sm">
                Kapat
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ClockFace({ seconds, running, over }: { seconds: number; running: boolean; over: boolean }) {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const rest = total % 60;

  return (
    <div
      className={`flex items-start justify-center font-serif leading-none ${over ? "text-wrong" : "text-foreground"}`}
      style={{ fontSize: "clamp(2.4rem, 11vw, 4.6rem)" }}
    >
      {hours > 0 ? (
        <>
          <TimeUnit value={hours} label="SA" />
          <Colon running={running} />
        </>
      ) : null}
      <TimeUnit value={minutes} label="DK" />
      <Colon running={running} />
      <TimeUnit value={rest} label="SN" />
    </div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <span className="flex min-w-[1.35em] flex-col items-center">
      <span className="tabular-nums">{pad2(value)}</span>
      <span className="mt-1 font-sans text-[0.22em] font-medium tracking-[0.18em] text-muted">{label}</span>
    </span>
  );
}

function Colon({ running }: { running: boolean }) {
  return (
    <span className={`mx-0.5 translate-y-[-0.08em] font-sans ${running ? "animate-pulse" : "opacity-35"}`}>:</span>
  );
}

function ProgressRing({ ratio, over, running }: { ratio: number; over: boolean; running: boolean }) {
  const size = 280;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.min(1, Math.max(0, ratio) / 100));

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="h-[min(68vw,22rem)] w-[min(68vw,22rem)] -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        className={over ? "stroke-wrong" : "stroke-accent"}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        style={{
          transition: "stroke-dashoffset 0.4s ease",
          filter: running ? "drop-shadow(0 0 10px rgba(139,108,255,0.55))" : undefined,
        }}
      />
    </svg>
  );
}
