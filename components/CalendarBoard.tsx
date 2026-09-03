"use client";

import { useMemo, useState } from "react";
import { toggleTaskAction } from "@/app/actions";
import { ElapsedLabel } from "@/components/ElapsedLabel";
import { TaskScoreForm } from "@/components/TaskScoreForm";
import { formatDayLong, istanbulToday, monthMatrix, weekRange } from "@/lib/dates";
import { SUBJECTS, subjectDot, subjectShort } from "@/lib/subjects";
import { tytNet } from "@/lib/allstar-tyt";
import { formatClock } from "@/lib/time";

type Task = {
  id: string;
  date: string;
  title: string;
  subject: string;
  minutes: number;
  done: boolean;
  targetQuestions?: number;
  correct?: number;
  wrong?: number;
  blank?: number;
  note?: string;
  elapsedSeconds?: number;
};

const WEEKDAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

function formatDuration(minutes: number) {
  if (!minutes) return "0 dk";
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return `${rest} dk`;
  if (!rest) return `${hours} sa`;
  return `${hours} sa ${rest} dk`;
}

function shortTitle(title: string) {
  return title.replace(/^All Star /, "").replace(/ — .*$/, "");
}

export function CalendarBoard({ initialTasks }: { initialTasks: Task[] }) {
  const today = istanbulToday();
  const now = new Date(`${today}T12:00:00`);
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [selected, setSelected] = useState(today);

  const cells = useMemo(
    () => monthMatrix(cursor.year, cursor.month),
    [cursor.year, cursor.month],
  );

  const byDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const task of initialTasks) {
      const list = map.get(task.date) ?? [];
      list.push(task);
      map.set(task.date, list);
    }
    return map;
  }, [initialTasks]);

  const dayTasks = byDate.get(selected) ?? [];
  const { start, end } = weekRange(selected);
  const weekTasks = initialTasks.filter((task) => task.date >= start && task.date <= end);
  const weekMinutes = weekTasks.reduce((sum, task) => sum + task.minutes, 0);
  const weekElapsed = weekTasks.reduce((sum, task) => sum + (task.elapsedSeconds ?? 0), 0);
  const weekDone = weekTasks.filter((task) => task.done).length;
  const dayDone = dayTasks.filter((task) => task.done).length;
  const dayMinutes = dayTasks.reduce((sum, task) => sum + task.minutes, 0);
  const dayCorrect = dayTasks.reduce((sum, task) => sum + (task.correct ?? 0), 0);
  const dayWrong = dayTasks.reduce((sum, task) => sum + (task.wrong ?? 0), 0);
  const dayBlank = dayTasks.reduce((sum, task) => sum + (task.blank ?? 0), 0);
  const daySolved = dayCorrect + dayWrong + dayBlank;
  const dayTarget = dayTasks.reduce((sum, task) => sum + (task.targetQuestions ?? 0), 0);
  const selectedSunday = new Date(`${selected}T12:00:00`).getDay() === 0;

  const title = new Intl.DateTimeFormat("tr-TR", { month: "long", year: "numeric" }).format(
    new Date(cursor.year, cursor.month, 1),
  );

  function shift(delta: number) {
    const date = new Date(cursor.year, cursor.month + delta, 1);
    setCursor({ year: date.getFullYear(), month: date.getMonth() });
  }

  function goToday() {
    setCursor({ year: now.getFullYear(), month: now.getMonth() });
    setSelected(today);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-4 md:px-6">
        <div>
          <p className="text-xs font-medium tracking-[0.16em] text-accent">TAKVİM</p>
          <h1 className="font-serif text-3xl capitalize">{title}</h1>
          <p className="mt-1 text-sm text-muted">4 Eylül’den 18 hafta · Pazar tatil · koç plan eklemez</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goToday}
            className="h-9 rounded-full border border-white/10 px-3 text-sm hover:border-accent/40"
          >
            Bugün
          </button>
          <button
            type="button"
            onClick={() => shift(-1)}
            className="h-9 w-9 rounded-full border border-white/10 text-lg leading-none"
            aria-label="Önceki ay"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => shift(1)}
            className="h-9 w-9 rounded-full border border-white/10 text-lg leading-none"
            aria-label="Sonraki ay"
          >
            ›
          </button>
        </div>
      </header>

      <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(20rem,0.9fr)] lg:p-6">
        <section className="rounded-[1.75rem] border border-white/10 bg-[#0d1233]/80 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] md:p-5">
          <div className="mb-4 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-2xl bg-white/5 px-2 py-3">
              <p className="text-muted">Haftalık hedef</p>
              <p className="mt-1 font-serif text-2xl text-accent">{formatDuration(weekMinutes)}</p>
              <p className="mt-1 text-[10px] text-muted">tutulan {formatClock(weekElapsed)}</p>
            </div>
            <div className="rounded-2xl bg-white/5 px-2 py-3">
              <p className="text-muted">Bu hafta</p>
              <p className="mt-1 font-serif text-2xl">
                {weekDone}/{weekTasks.length || 0}
              </p>
            </div>
            <div className="rounded-2xl bg-white/5 px-2 py-3">
              <p className="text-muted">Seçili gün</p>
              <p className="mt-1 font-serif text-2xl text-accent">{dayTasks.length}</p>
              <p className="mt-1 text-[10px] text-muted">blok</p>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-medium uppercase tracking-wide text-muted">
            {WEEKDAYS.map((day) => (
              <div key={day} className={`py-2 ${day === "Paz" ? "text-wrong/70" : ""}`}>
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {cells.map((cell) => {
              const active = cell.date === selected;
              const isToday = cell.date === today;
              const tasks = byDate.get(cell.date) ?? [];
              const remaining = tasks.filter((task) => !task.done).length;
              const sunday = new Date(`${cell.date}T12:00:00`).getDay() === 0;
              const donePct = tasks.length ? Math.round(((tasks.length - remaining) / tasks.length) * 100) : 0;
              return (
                <button
                  key={cell.date}
                  type="button"
                  onClick={() => setSelected(cell.date)}
                  className={`flex min-h-[6.4rem] flex-col rounded-2xl p-1.5 text-left transition md:min-h-[7.6rem] md:p-2 ${
                    active
                      ? "bg-accent text-white shadow-[0_10px_30px_rgba(139,108,255,0.28)]"
                      : sunday
                        ? "bg-white/[0.02] ring-1 ring-inset ring-white/5"
                        : isToday
                          ? "bg-accent/15 ring-1 ring-accent/45"
                          : cell.inMonth
                            ? "bg-white/[0.04] hover:bg-white/[0.08]"
                            : "opacity-30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                        isToday && !active ? "bg-accent text-white" : ""
                      }`}
                    >
                      {cell.day}
                    </span>
                    {sunday ? (
                      <span className={`text-[9px] uppercase tracking-wide ${active ? "text-white/70" : "text-muted"}`}>
                        tatil
                      </span>
                    ) : tasks.length ? (
                      <span className={`text-[10px] ${active ? "text-white/75" : "text-muted"}`}>
                        {remaining}/{tasks.length}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-1.5 flex min-h-0 flex-1 flex-col gap-1">
                    {tasks.slice(0, 3).map((task) => (
                      <span
                        key={task.id}
                        className={`flex items-center gap-1 truncate rounded-md px-1 py-0.5 text-[10px] leading-tight ${
                          active ? "bg-white/15" : "bg-black/20"
                        } ${task.done ? "opacity-50 line-through" : ""}`}
                      >
                        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${active ? "bg-white" : subjectDot(task.subject)}`} />
                        {subjectShort(task.subject)}
                      </span>
                    ))}
                    {tasks.length > 3 ? (
                      <span className={`text-[10px] ${active ? "text-white/70" : "text-muted"}`}>+{tasks.length - 3}</span>
                    ) : null}
                  </div>
                  {tasks.length > 0 && !sunday ? (
                    <div className={`mt-1 h-1 overflow-hidden rounded-full ${active ? "bg-white/20" : "bg-white/10"}`}>
                      <div className={`h-full ${active ? "bg-white" : "bg-correct"}`} style={{ width: `${donePct}%` }} />
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1.5 px-1">
            {SUBJECTS.filter((subject) =>
              ["Matematik", "Geometri", "Türkçe", "Fizik", "Kimya", "Biyoloji", "Tarih", "Coğrafya"].includes(subject),
            ).map((subject) => (
              <span key={subject} className="inline-flex items-center gap-1.5 text-[10px] text-muted">
                <span className={`h-1.5 w-1.5 rounded-full ${subjectDot(subject)}`} />
                {subject}
              </span>
            ))}
          </div>
        </section>

        <aside className="flex flex-col rounded-[1.75rem] border border-white/10 bg-[#12163a]/90 p-4">
          <p className="text-xs capitalize text-muted">{formatDayLong(selected)}</p>
          <h2 className="font-serif text-2xl">{selectedSunday ? "Pazar tatil" : "Günün planı"}</h2>
          <p className="mt-1 text-sm text-muted">
            {selectedSunday
              ? "Bu günde All Star bloğu yok."
              : `${dayMinutes ? `${formatDuration(dayMinutes)} · ` : ""}${dayDone}/${dayTasks.length} bitti`}
          </p>
          {!selectedSunday && dayTasks.length > 0 ? (
            <p className="mt-1 text-xs leading-5 text-muted">
              <span className="font-medium text-foreground">{daySolved} çözülen</span>
              {dayTarget ? ` / ${dayTarget} hedef` : ""}
              {" · "}
              <span className="text-correct">{dayCorrect} D</span>
              {" · "}
              <span className="text-wrong">{dayWrong} Y</span>
              {" · "}
              <span className="text-blank">{dayBlank} B</span>
              {" · net "}
              {tytNet(dayCorrect, dayWrong)}
            </p>
          ) : null}

          <ul className="mt-4 space-y-2">
            {dayTasks.length === 0 ? (
              <li className="rounded-2xl border border-dashed border-white/15 px-4 py-10 text-center text-sm text-muted">
                {selectedSunday ? "Dinlen. İstersen 20 paragraf." : "Bu günde plan yok."}
              </li>
            ) : (
              dayTasks.map((task) => (
                  <li
                    key={task.id}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
                    style={{ borderLeftWidth: 4, borderLeftColor: "rgba(139,108,255,0.85)" }}
                  >
                    <div className="flex items-start gap-3 p-3">
                      <form action={toggleTaskAction.bind(null, task.id)}>
                        <button
                          type="submit"
                          className={`mt-0.5 h-5 w-5 rounded-md border ${
                            task.done ? "border-correct bg-correct" : "border-white/25"
                          }`}
                          aria-label="Tamamla"
                        />
                      </form>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className={`text-sm font-medium ${task.done ? "text-muted line-through" : ""}`}>
                              {shortTitle(task.title)}
                            </p>
                            <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                              <span className={`h-2 w-2 rounded-full ${subjectDot(task.subject)}`} />
                              {task.subject}
                              {" · "}
                              <ElapsedLabel
                                taskId={task.id}
                                elapsedSeconds={task.elapsedSeconds ?? 0}
                                targetMinutes={task.minutes}
                              />
                            </p>
                          </div>
                          <p className="shrink-0 text-right">
                            <span className="block text-lg font-semibold leading-none tabular-nums">
                              {(task.correct ?? 0) + (task.wrong ?? 0) + (task.blank ?? 0)}
                            </span>
                            <span className="text-[10px] text-muted">/ {task.targetQuestions || 0} soru</span>
                          </p>
                        </div>
                        <TaskScoreForm
                          showNote={false}
                          showSolved={false}
                          task={{
                            id: task.id,
                            title: task.title,
                            subject: task.subject,
                            minutes: task.minutes,
                            elapsedSeconds: task.elapsedSeconds ?? 0,
                            targetQuestions: task.targetQuestions,
                            correct: task.correct,
                            wrong: task.wrong,
                            blank: task.blank,
                            note: task.note,
                          }}
                        />
                      </div>
                    </div>
                  </li>
                ))
            )}
          </ul>
        </aside>
      </div>
    </div>
  );
}
