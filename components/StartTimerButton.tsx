"use client";

import { useTimer, type TimerTask } from "@/components/TimerProvider";

export function StartTimerButton({ task }: { task: TimerTask }) {
  const { start, resume, task: active, running, setFullscreen } = useTimer();
  const isThis = active?.id === task.id;

  function begin(fullscreen: boolean) {
    if (isThis) {
      if (!running) resume();
      setFullscreen(fullscreen);
      return;
    }
    start(task, { fullscreen });
  }

  return (
    <span className="inline-flex shrink-0 overflow-hidden rounded-lg border border-white/15">
      <button
        type="button"
        onClick={() => begin(true)}
        className={`h-9 px-3 text-xs font-semibold ${isThis ? "bg-accent text-white" : "text-muted hover:text-foreground"}`}
      >
        {isThis && running ? "Tam ekran" : "Süre tut"}
      </button>
      <button
        type="button"
        onClick={() => begin(false)}
        className="h-9 border-l border-white/15 px-2.5 text-xs text-muted hover:text-foreground"
        title="Küçük kronometre"
      >
        Ufak
      </button>
    </span>
  );
}
