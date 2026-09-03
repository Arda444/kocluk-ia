"use client";

import { logTaskResultAction } from "@/app/actions";
import { StartTimerButton } from "@/components/StartTimerButton";
import { tytNet } from "@/lib/allstar-tyt";
import { SCORE } from "@/lib/score-style";

export type ScoreFormTask = {
  id: string;
  title: string;
  subject: string;
  minutes: number;
  elapsedSeconds: number;
  targetQuestions?: number | null;
  correct?: number | null;
  wrong?: number | null;
  blank?: number | null;
  note?: string | null;
};

export function TaskScoreForm({
  task,
  showNote = true,
}: {
  task: ScoreFormTask;
  showNote?: boolean;
}) {
  const correct = task.correct ?? 0;
  const wrong = task.wrong ?? 0;
  const blank = task.blank ?? 0;
  const solved = correct + wrong + blank;
  const target = task.targetQuestions ?? 0;
  const net = solved > 0 ? tytNet(correct, wrong) : null;

  return (
    <form action={logTaskResultAction} className="mt-3 space-y-3">
      <input type="hidden" name="id" value={task.id} />
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-xs">
        <p>
          <span className="font-semibold text-foreground">{solved} çözülen</span>
          {target ? <span className="text-muted"> / {target} hedef</span> : null}
        </p>
        {net != null ? <p className="font-medium text-accent">net {net}</p> : null}
      </div>
      <div className="grid grid-cols-3 gap-2">
        <label className="text-[11px] font-medium text-correct">
          Doğru
          <input
            name="correct"
            type="number"
            min={0}
            inputMode="numeric"
            defaultValue={correct || ""}
            placeholder="0"
            aria-label="Doğru"
            className={SCORE.correct.stack}
          />
        </label>
        <label className="text-[11px] font-medium text-wrong">
          Yanlış
          <input
            name="wrong"
            type="number"
            min={0}
            inputMode="numeric"
            defaultValue={wrong || ""}
            placeholder="0"
            aria-label="Yanlış"
            className={SCORE.wrong.stack}
          />
        </label>
        <label className="text-[11px] font-medium text-blank">
          Boş
          <input
            name="blank"
            type="number"
            min={0}
            inputMode="numeric"
            defaultValue={blank || ""}
            placeholder="0"
            aria-label="Boş"
            className={SCORE.blank.stack}
          />
        </label>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        {showNote ? (
          <input
            name="note"
            defaultValue={task.note ?? ""}
            placeholder="not"
            className="h-10 min-w-0 flex-1 rounded-xl border border-white/10 bg-[#0a102c] px-3 text-sm"
          />
        ) : null}
        <button
          type="submit"
          className="h-10 shrink-0 rounded-xl bg-accent px-4 text-sm font-semibold text-white sm:px-3 sm:text-xs"
        >
          İşle
        </button>
      </div>
      <StartTimerButton
        task={{
          id: task.id,
          title: task.title,
          subject: task.subject,
          targetMinutes: task.minutes,
          elapsedSeconds: task.elapsedSeconds,
        }}
      />
    </form>
  );
}
