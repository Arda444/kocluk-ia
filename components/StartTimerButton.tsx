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
    <span className="inline-flex w-full overflow-hidden rounded-xl border border-white/15 sm:w-auto">
      <button
        type="button"
        onClick={() => begin(true)}
        className={`h-10 flex-1 px-3 text-xs font-semibold sm:h-8 sm:flex-none ${isThis ? "bg-accent text-white" : "text-muted hover:text-foreground"}`}
      >
        {isThis && running ? "Tam ekran" : "Süre tut"}
      </button>
      <button
        type="button"
        onClick={() => begin(false)}
        className="h-10 border-l border-white/15 px-3 text-xs text-muted hover:text-foreground sm:h-8"
        title="Küçük kronometre"
      >
        Ufak
      </button>
    </span>
  );
}
