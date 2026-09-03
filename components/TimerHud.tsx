"use client";

import { useEffect } from "react";
import { useTimer } from "@/components/TimerProvider";
import { subjectDot } from "@/lib/subjects";
import { formatClock, pad2, shortTopic } from "@/lib/time";

export function TimerHud() {
  const { task, running, fullscreen, elapsed, pause, resume, stop, reset, setFullscreen } = useTimer();
  if (!task) return null;

  const target = Math.max(1, task.targetMinutes) * 60;
  const over = elapsed > target;
  const remaining = Math.max(0, target - elapsed);
  const ratio = Math.min(100, (elapsed / target) * 100);

  function confirmReset() {
    if (elapsed <= 0) return;
    if (window.confirm("Tutulan süre sıfırlansın mı? Kayıt da 00:00 olur.")) {
      reset();
    }
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
        onPause={pause}
        onResume={resume}
        onMinimize={() => setFullscreen(false)}
        onStop={stop}
        onReset={confirmReset}
      />
    );
  }

  return (
    <div className="fixed right-4 bottom-[6.75rem] z-40 w-[min(100%-2rem,20rem)] rounded-2xl border border-white/15 bg-[#12163a]/95 p-3 shadow-2xl backdrop-blur md:bottom-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] tracking-[0.16em] text-accent">SÜRE</p>
          <p className="truncate text-sm">{shortTopic(task.title)}</p>
        </div>
        <p className={`font-serif text-2xl tabular-nums ${over ? "text-wrong" : "text-correct"}`}>{formatClock(elapsed)}</p>
      </div>
      <p className="mt-1 text-[11px] text-muted">
        Hedef {task.targetMinutes} dk · {over ? "hedef aşıldı" : `${formatClock(remaining)} kaldı`}
      </p>
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
          onClick={confirmReset}
          disabled={elapsed <= 0}
          className="h-8 flex-1 rounded-lg border border-white/15 text-xs text-muted disabled:opacity-40"
        >
          Sıfırla
        </button>
        <button type="button" onClick={stop} className="h-8 flex-1 rounded-lg border border-white/15 px-2 text-xs">
          Kaydet
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
  onPause,
  onResume,
  onMinimize,
  onStop,
  onReset,
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
  onPause: () => void;
  onResume: () => void;
  onMinimize: () => void;
  onStop: () => void;
  onReset: () => void;
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
      if (event.key === "Escape") onMinimize();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [running, onPause, onResume, onMinimize]);

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
      <header className="grid grid-cols-3 items-center px-5">
        <span />
        <p className="text-[11px] font-medium tracking-[0.22em] text-accent">KRONOMETRE</p>
        <span
          className={`justify-self-end h-10 rounded-full px-3 text-xs font-semibold leading-10 ${
            over ? "bg-wrong/15 text-wrong" : running ? "bg-correct/15 text-correct" : "bg-white/10 text-muted"
          }`}
        >
          {over ? "Aştı" : running ? "Çalışıyor" : "Durdu"}
        </span>
      </header>

      <div className="mt-6 px-6">
        <p className="inline-flex items-center gap-2 text-sm text-muted">
          <span className={`h-2 w-2 rounded-full ${subjectDot(subject)}`} />
          {subject}
        </p>
        <h2 className="mt-2 font-serif text-2xl leading-tight md:text-4xl">{title}</h2>
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
        <p className="mt-2 text-[11px] text-muted">{running ? "Duraklat" : "Devam"} · boşluk tuşu</p>
        <div className="mt-5 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={onReset}
            disabled={elapsed <= 0}
            className="h-12 rounded-2xl border border-white/12 text-sm text-muted disabled:opacity-40"
          >
            Sıfırla
          </button>
          <button
            type="button"
            onClick={onMinimize}
            className="h-12 rounded-2xl border border-white/12 text-sm"
          >
            Küçült
          </button>
          <button
            type="button"
            onClick={onStop}
            className="h-12 rounded-2xl border border-white/12 text-sm"
          >
            Kaydet
          </button>
        </div>
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
