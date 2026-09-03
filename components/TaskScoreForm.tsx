"use client";

import { useEffect, useState } from "react";
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

function scoreField(value: number | null | undefined) {
  return value ? String(value) : "";
}

export function TaskScoreForm({
  task,
  showNote = true,
  showSolved = true,
}: {
  task: ScoreFormTask;
  showNote?: boolean;
  showSolved?: boolean;
}) {
  const [correct, setCorrect] = useState(scoreField(task.correct));
  const [wrong, setWrong] = useState(scoreField(task.wrong));
  const [blank, setBlank] = useState(scoreField(task.blank));
  const [note, setNote] = useState(task.note ?? "");

  useEffect(() => {
    setCorrect(scoreField(task.correct));
    setWrong(scoreField(task.wrong));
    setBlank(scoreField(task.blank));
    setNote(task.note ?? "");
  }, [task.id]);

  const correctN = Number(correct) || 0;
  const wrongN = Number(wrong) || 0;
  const blankN = Number(blank) || 0;
  const solved = correctN + wrongN + blankN;
  const target = task.targetQuestions ?? 0;
  const net = solved > 0 ? tytNet(correctN, wrongN) : null;

  return (
    <form
      action={logTaskResultAction}
      onReset={(event) => event.preventDefault()}
      className="mt-3 space-y-2.5"
    >
      <input type="hidden" name="id" value={task.id} />
      {showSolved ? (
        <p className="text-xs text-muted">
          <span className="font-semibold text-foreground">{solved}</span>
          {target ? ` / ${target} soru` : " çözülen"}
          {net != null ? <span className="text-accent"> · net {net}</span> : null}
        </p>
      ) : net != null ? (
        <p className="text-xs font-medium text-accent">net {net}</p>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <ScoreChip
          name="correct"
          hint={SCORE.correct.label}
          value={correct}
          onChange={setCorrect}
          shell={SCORE.correct.shell}
          letterClass={SCORE.correct.letterClass}
          inputClass={SCORE.correct.input}
        />
        <ScoreChip
          name="wrong"
          hint={SCORE.wrong.label}
          value={wrong}
          onChange={setWrong}
          shell={SCORE.wrong.shell}
          letterClass={SCORE.wrong.letterClass}
          inputClass={SCORE.wrong.input}
        />
        <ScoreChip
          name="blank"
          hint={SCORE.blank.label}
          value={blank}
          onChange={setBlank}
          shell={SCORE.blank.shell}
          letterClass={SCORE.blank.letterClass}
          inputClass={SCORE.blank.input}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {showNote ? (
          <input
            name="note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="not"
            className="h-9 min-w-0 flex-1 rounded-lg border border-white/10 bg-[#070b1c] px-3 text-sm"
          />
        ) : null}
        <button
          type="submit"
          className="h-9 shrink-0 rounded-lg bg-accent px-3 text-sm font-semibold text-white"
        >
          İşle
        </button>
        <StartTimerButton
          task={{
            id: task.id,
            title: task.title,
            subject: task.subject,
            targetMinutes: task.minutes,
            elapsedSeconds: task.elapsedSeconds,
          }}
        />
      </div>
    </form>
  );
}

function ScoreChip({
  name,
  hint,
  value,
  onChange,
  shell,
  letterClass,
  inputClass,
}: {
  name: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
  shell: string;
  letterClass: string;
  inputClass: string;
}) {
  return (
    <label className={`inline-flex w-fit shrink-0 items-center gap-2 rounded-xl border py-1 pl-2.5 pr-1 ${shell}`}>
      <span className={`text-sm font-semibold ${letterClass}`}>{hint}</span>
      <input
        name={name}
        type="number"
        min={0}
        inputMode="numeric"
        value={value}
        placeholder="0"
        aria-label={hint}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
      />
    </label>
  );
}
