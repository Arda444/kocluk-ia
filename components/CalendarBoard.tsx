"use client";

import { useMemo, useState } from "react";
import {
  createTaskAction,
  deleteTaskAction,
  toggleTaskAction,
  updateTaskAction,
} from "@/app/actions";
import { formatDayLong, istanbulToday, monthMatrix, weekRange } from "@/lib/dates";
import { SUBJECTS, subjectDot } from "@/lib/subjects";

type Task = {
  id: string;
  date: string;
  title: string;
  subject: string;
  minutes: number;
  done: boolean;
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

export function CalendarBoard({ initialTasks }: { initialTasks: Task[] }) {
  const today = istanbulToday();
  const now = new Date(`${today}T12:00:00`);
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [selected, setSelected] = useState(today);
  const [editing, setEditing] = useState<string | null>(null);
  const [newSubject, setNewSubject] = useState("");

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
  const weekDone = weekTasks.filter((task) => task.done).length;
  const dayDone = dayTasks.filter((task) => task.done).length;
  const dayMinutes = dayTasks.reduce((sum, task) => sum + task.minutes, 0);

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

      <div className="grid gap-4 p-4 md:grid-cols-[1.4fr_0.9fr] md:p-6">
        <section className="rounded-3xl border border-white/10 bg-black/20 p-3 md:p-4">
          <div className="mb-4 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-2xl bg-white/5 px-2 py-3">
              <p className="text-muted">Bu hafta</p>
              <p className="mt-1 text-lg font-semibold text-accent">{formatDuration(weekMinutes)}</p>
            </div>
            <div className="rounded-2xl bg-white/5 px-2 py-3">
              <p className="text-muted">Tamamlanan</p>
              <p className="mt-1 text-lg font-semibold">
                {weekDone}/{weekTasks.length || 0}
              </p>
            </div>
            <div className="rounded-2xl bg-white/5 px-2 py-3">
              <p className="text-muted">Seçili gün</p>
              <p className="mt-1 text-lg font-semibold text-coral">{dayTasks.length} iş</p>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium uppercase tracking-wide text-muted">
            {WEEKDAYS.map((day) => (
              <div key={day} className="py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((cell) => {
              const active = cell.date === selected;
              const isToday = cell.date === today;
              const tasks = byDate.get(cell.date) ?? [];
              const remaining = tasks.filter((task) => !task.done).length;
              return (
                <button
                  key={cell.date}
                  type="button"
                  onClick={() => setSelected(cell.date)}
                  className={`flex min-h-[4.5rem] flex-col rounded-2xl p-1.5 text-left transition md:min-h-[5.5rem] ${
                    active
                      ? "bg-accent text-black shadow-[0_0_0_1px_rgba(124,255,178,0.6)]"
                      : isToday
                        ? "bg-accent/10 ring-1 ring-accent/40"
                        : cell.inMonth
                          ? "bg-white/5 hover:bg-white/10"
                          : "opacity-35"
                  }`}
                >
                  <span className={`text-sm font-medium ${active ? "text-black" : ""}`}>{cell.day}</span>
                  <div className="mt-auto flex flex-wrap gap-0.5">
                    {tasks.slice(0, 4).map((task) => (
                      <span
                        key={task.id}
                        className={`h-1.5 w-1.5 rounded-full ${active ? "bg-black/50" : subjectDot(task.subject)}`}
                      />
                    ))}
                  </div>
                  {tasks.length > 0 ? (
                    <span className={`mt-1 text-[10px] ${active ? "text-black/70" : "text-muted"}`}>
                      {remaining}/{tasks.length}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-2 px-1">
            {SUBJECTS.slice(0, 8).map((subject) => (
              <span key={subject} className="inline-flex items-center gap-1.5 text-[10px] text-muted">
                <span className={`h-1.5 w-1.5 rounded-full ${subjectDot(subject)}`} />
                {subject}
              </span>
            ))}
          </div>
        </section>

        <aside className="flex flex-col rounded-3xl border border-white/10 bg-black/25 p-4 md:sticky md:top-4 md:max-h-[calc(100svh-7rem)]">
          <p className="text-xs capitalize text-muted">{formatDayLong(selected)}</p>
          <h2 className="font-serif text-2xl">Günün planı</h2>
          <p className="mt-1 text-sm text-muted">
            {dayMinutes ? `${formatDuration(dayMinutes)} · ` : ""}
            {dayDone}/{dayTasks.length} bitti
          </p>

          <ul className="mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto">
            {dayTasks.length === 0 ? (
              <li className="rounded-2xl border border-dashed border-white/15 px-4 py-8 text-center text-sm text-muted">
                Bu günde görev yok. Aşağıdan ekle veya koça “bugünü planla” de.
              </li>
            ) : (
              dayTasks.map((task) =>
                editing === task.id ? (
                  <li key={task.id} className="rounded-2xl bg-white/5 p-3">
                    <form
                      action={async (formData) => {
                        await updateTaskAction(formData);
                        setEditing(null);
                      }}
                      className="grid gap-2"
                    >
                      <input type="hidden" name="id" value={task.id} />
                      <input type="hidden" name="date" value={task.date} />
                      <input
                        name="title"
                        defaultValue={task.title}
                        className="h-10 rounded-xl border border-white/10 bg-black/40 px-3 text-sm"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          name="subject"
                          defaultValue={task.subject}
                          className="h-10 rounded-xl border border-white/10 bg-black/40 px-2 text-sm"
                        >
                          <option value="">Ders</option>
                          {SUBJECTS.map((subject) => (
                            <option key={subject} value={subject}>
                              {subject}
                            </option>
                          ))}
                        </select>
                        <input
                          name="minutes"
                          type="number"
                          defaultValue={task.minutes}
                          className="h-10 rounded-xl border border-white/10 bg-black/40 px-3 text-sm"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" className="h-9 flex-1 rounded-xl bg-accent text-sm font-semibold text-black">
                          Kaydet
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditing(null)}
                          className="h-9 rounded-xl border border-white/15 px-3 text-sm"
                        >
                          Vazgeç
                        </button>
                      </div>
                    </form>
                  </li>
                ) : (
                  <li key={task.id} className="rounded-2xl bg-white/5 p-3">
                    <div className="flex items-start gap-3">
                      <form action={toggleTaskAction.bind(null, task.id)}>
                        <button
                          type="submit"
                          className={`mt-0.5 h-5 w-5 rounded-md border ${
                            task.done ? "border-accent bg-accent" : "border-white/25"
                          }`}
                          aria-label="Tamamla"
                        />
                      </form>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm ${task.done ? "text-muted line-through" : ""}`}>{task.title}</p>
                        <p className="mt-1 flex items-center gap-2 text-xs text-muted">
                          <span className={`h-2 w-2 rounded-full ${subjectDot(task.subject)}`} />
                          {task.minutes} dk{task.subject ? ` · ${task.subject}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex gap-3 pl-8 text-xs">
                      <button type="button" onClick={() => setEditing(task.id)} className="text-accent">
                        Düzenle
                      </button>
                      <form action={deleteTaskAction.bind(null, task.id)}>
                        <button type="submit" className="text-coral">
                          Sil
                        </button>
                      </form>
                    </div>
                  </li>
                ),
              )
            )}
          </ul>

          <form action={createTaskAction} className="mt-4 grid gap-2 border-t border-white/10 pt-4">
            <p className="text-sm font-medium">Görev ekle</p>
            <input type="hidden" name="date" value={selected} />
            <input type="hidden" name="subject" value={newSubject} />
            <input
              name="title"
              required
              placeholder="Örn. 345 üçgen 40 soru"
              className="h-10 rounded-xl border border-white/10 bg-black/40 px-3 text-sm"
            />
            <div className="flex flex-wrap gap-1">
              {SUBJECTS.map((subject) => (
                <button
                  key={subject}
                  type="button"
                  onClick={() => setNewSubject(subject === newSubject ? "" : subject)}
                  className={`rounded-full px-2 py-1 text-[11px] ${
                    newSubject === subject ? "bg-accent text-black" : "bg-white/5 text-muted hover:text-foreground"
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                name="minutes"
                type="number"
                min={10}
                defaultValue={40}
                className="h-10 rounded-xl border border-white/10 bg-black/40 px-3 text-sm"
              />
              <p className="self-center text-xs text-muted">süre (dk)</p>
            </div>
            <button type="submit" className="h-10 rounded-xl bg-accent text-sm font-semibold text-black">
              Ekle
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}
