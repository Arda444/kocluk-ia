"use client";

import Link from "next/link";
import { useState } from "react";
import { resetAllStarProgramAction, seedAllStarProgramAction, toggleTaskAction } from "@/app/actions";
import { ElapsedLabel } from "@/components/ElapsedLabel";
import { TaskScoreForm } from "@/components/TaskScoreForm";
import { TYT_PROGRAM, programWeekOf, tytNet } from "@/lib/allstar-tyt";
import { formatDayLong, istanbulToday, weekdayIndex } from "@/lib/dates";
import { subjectDot } from "@/lib/subjects";
import { formatClock } from "@/lib/time";

export type ProgramTask = {
  id: string;
  date: string;
  title: string;
  subject: string;
  minutes: number;
  done: boolean;
  topicKey: string;
  weekNumber: number;
  targetQuestions: number;
  correct: number;
  wrong: number;
  blank: number;
  note: string;
  source: string;
  elapsedSeconds: number;
};

const DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

function topicTitle(title: string) {
  return title.replace(/^All Star /, "").replace(/ — .*$/, "");
}

function dayTotals(rows: ProgramTask[]) {
  const correct = rows.reduce((sum, task) => sum + task.correct, 0);
  const wrong = rows.reduce((sum, task) => sum + task.wrong, 0);
  const blank = rows.reduce((sum, task) => sum + task.blank, 0);
  const target = rows.reduce((sum, task) => sum + task.targetQuestions, 0);
  const elapsed = rows.reduce((sum, task) => sum + task.elapsedSeconds, 0);
  const minutes = rows.reduce((sum, task) => sum + task.minutes, 0);
  return {
    correct,
    wrong,
    blank,
    solved: correct + wrong + blank,
    target,
    elapsed,
    minutes,
    net: tytNet(correct, wrong),
  };
}

export function ProgramBoard({
  initialTasks,
  defaultStart,
}: {
  initialTasks: ProgramTask[];
  defaultStart: string;
}) {
  const today = istanbulToday();
  const programTasks = initialTasks.filter((task) => task.source === TYT_PROGRAM.source);
  const startMonday = programTasks.reduce(
    (min, task) => (task.date < min ? task.date : min),
    programTasks[0]?.date ?? defaultStart,
  );
  const maxWeek = programTasks.reduce((max: number, task) => Math.max(max, task.weekNumber), 1);
  const inferred = programWeekOf(startMonday, today);
  const [week, setWeek] = useState(() => Math.min(maxWeek, Math.max(1, inferred || 1)));

  const weekTasks = programTasks.filter((task) => task.weekNumber === week);
  const dates = [...new Set(weekTasks.map((task) => task.date))].sort();
  const weekSolved = weekTasks.reduce((sum, task) => sum + task.correct + task.wrong + task.blank, 0);
  const weekTarget = weekTasks.reduce((sum, task) => sum + task.targetQuestions, 0);

  if (programTasks.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-5 py-12">
        <p className="text-xs font-medium tracking-[0.16em] text-accent">PANEL</p>
        <h1 className="mt-2 font-serif text-4xl">345 All Star TYT tablosu</h1>
        <p className="mt-4 text-sm leading-6 text-muted">
          Günde 4 saat, haftada 6 gün, 18 hafta. Program 4 Eylül 2026’dan başlar; Pazar tatil.
        </p>
        <form action={seedAllStarProgramAction} className="mt-8 grid gap-3">
          <label className="text-sm">
            Başlangıç tarihi
            <input
              type="date"
              name="startDate"
              defaultValue={defaultStart}
              className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-[#0a102c] px-3"
            />
          </label>
          <button type="submit" className="h-12 rounded-full bg-accent text-sm font-semibold text-white">
            Programı yükle
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-4 md:px-6">
        <div>
          <p className="text-xs font-medium tracking-[0.16em] text-accent">PANEL</p>
          <h1 className="font-serif text-3xl">Hafta {week}/{TYT_PROGRAM.weeks}</h1>
          <p className="mt-1 text-sm text-muted">
            {weekSolved} çözülen / {weekTarget} hedef
            {" · "}
            <Link href="/stats" className="text-accent hover:underline">
              İstatistik
            </Link>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setWeek((value) => Math.max(1, value - 1))}
            className="h-9 w-9 rounded-full border border-white/10"
            aria-label="Önceki hafta"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => setWeek(Math.min(maxWeek, Math.max(1, inferred || 1)))}
            className="h-9 rounded-full border border-white/10 px-3 text-sm"
          >
            Bu hafta
          </button>
          <button
            type="button"
            onClick={() => setWeek((value) => Math.min(maxWeek, value + 1))}
            className="h-9 w-9 rounded-full border border-white/10"
            aria-label="Sonraki hafta"
          >
            ›
          </button>
        </div>
      </header>

      <section className="space-y-4 p-4 md:p-6">
        {dates.map((date) => {
          const rows = weekTasks.filter((task) => task.date === date);
          const isToday = date === today;
          const totals = dayTotals(rows);
          return (
            <article
              key={date}
              className={`rounded-3xl border p-4 ${
                isToday ? "border-accent/50 bg-accent/10" : "border-white/10 bg-[#12163a]/60"
              }`}
            >
              <div className="mb-1 flex items-baseline justify-between gap-2">
                <h2 className="font-serif text-xl">
                  {DAYS[weekdayIndex(date)] ?? formatDayLong(date)}
                  {isToday ? <span className="ml-2 text-sm text-accent">bugün</span> : null}
                </h2>
                <p className="text-xs text-muted">{formatDayLong(date)}</p>
              </div>
              <p className="mb-3 text-xs leading-5 text-muted">
                <span className="font-medium text-foreground">
                  {totals.solved} çözülen
                </span>
                {totals.target ? ` / ${totals.target} hedef` : ""}
                {" · "}
                <span className="text-correct">{totals.correct} D</span>
                {" · "}
                <span className="text-wrong">{totals.wrong} Y</span>
                {" · "}
                <span className="text-blank">{totals.blank} B</span>
                {" · net "}
                {totals.net}
                {" · "}
                {formatClock(totals.elapsed)} / {totals.minutes} dk
              </p>
              <ul className="space-y-3">
                {rows.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </ul>
            </article>
          );
        })}
        <form
          action={resetAllStarProgramAction}
          onSubmit={(event) => {
            if (!window.confirm("Program ve skorlar silinsin mi? Bu işlem geri alınamaz.")) {
              event.preventDefault();
            }
          }}
        >
          <button type="submit" className="text-xs text-wrong">
            Programı sıfırla
          </button>
        </form>
      </section>
    </div>
  );
}

function TaskCard({ task }: { task: ProgramTask }) {
  return (
    <li className="rounded-2xl border border-white/10 bg-[#0a102c]/70 p-3">
      <div className="flex items-start gap-3">
        <form action={toggleTaskAction.bind(null, task.id)}>
          <button
            type="submit"
            className={`mt-0.5 h-5 w-5 rounded-md border ${
              task.done ? "border-correct bg-correct" : "border-white/30"
            }`}
            aria-label="Tamamla"
          />
        </form>
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-medium ${task.done ? "text-muted line-through" : ""}`}>
            {topicTitle(task.title)}
          </p>
          <p className="mt-1 inline-flex flex-wrap items-center gap-1.5 text-[11px] text-muted">
            <span className={`h-1.5 w-1.5 rounded-full ${subjectDot(task.subject)}`} />
            {task.subject} ·{" "}
            <ElapsedLabel
              taskId={task.id}
              elapsedSeconds={task.elapsedSeconds}
              targetMinutes={task.minutes}
            />
          </p>
          <TaskScoreForm task={task} />
        </div>
      </div>
    </li>
  );
}
