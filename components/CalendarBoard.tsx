"use client";

import { useMemo, useState } from "react";
import {
  createTaskAction,
  deleteTaskAction,
  toggleTaskAction,
  updateTaskAction,
} from "@/app/actions";
import { monthMatrix, istanbulToday } from "@/lib/dates";

type Task = {
  id: string;
  date: string;
  title: string;
  subject: string;
  minutes: number;
  done: boolean;
};

const WEEKDAYS = ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"];

export function CalendarBoard({ initialTasks }: { initialTasks: Task[] }) {
  const today = istanbulToday();
  const now = new Date(`${today}T12:00:00`);
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [selected, setSelected] = useState(today);
  const [editing, setEditing] = useState<string | null>(null);

  const cells = useMemo(
    () => monthMatrix(cursor.year, cursor.month),
    [cursor.year, cursor.month],
  );
  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const task of initialTasks) {
      map.set(task.date, (map.get(task.date) ?? 0) + 1);
    }
    return map;
  }, [initialTasks]);

  const dayTasks = initialTasks.filter((task) => task.date === selected);
  const title = new Intl.DateTimeFormat("tr-TR", { month: "long", year: "numeric" }).format(
    new Date(cursor.year, cursor.month, 1),
  );

  function shift(delta: number) {
    const date = new Date(cursor.year, cursor.month + delta, 1);
    setCursor({ year: date.getFullYear(), month: date.getMonth() });
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-4 md:flex-row md:p-6">
      <div className="flex-1">
        <div className="mb-4 flex items-center justify-between">
          <button type="button" onClick={() => shift(-1)} className="rounded-full border border-white/10 px-3 py-1">
            ‹
          </button>
          <h1 className="font-serif text-2xl capitalize">{title}</h1>
          <button type="button" onClick={() => shift(1)} className="rounded-full border border-white/10 px-3 py-1">
            ›
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted">
          {WEEKDAYS.map((day) => (
            <div key={day} className="py-2">
              {day}
            </div>
          ))}
          {cells.map((cell) => {
            const active = cell.date === selected;
            const isToday = cell.date === today;
            return (
              <button
                key={cell.date}
                type="button"
                onClick={() => setSelected(cell.date)}
                className={`relative min-h-12 rounded-xl text-sm md:min-h-16 ${
                  active
                    ? "bg-accent text-black"
                    : isToday
                      ? "bg-accent/15 text-accent"
                      : cell.inMonth
                        ? "bg-white/5"
                        : "text-muted/50"
                }`}
              >
                {cell.day}
                {(counts.get(cell.date) ?? 0) > 0 ? (
                  <span
                    className={`absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full ${
                      active ? "bg-black" : "bg-coral"
                    }`}
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <aside className="w-full shrink-0 rounded-3xl border border-white/10 bg-white/5 p-4 md:w-[340px]">
        <p className="text-xs text-muted">{selected}</p>
        <h2 className="mt-1 font-serif text-xl">Günün işleri</h2>
        <ul className="mt-4 space-y-3">
          {dayTasks.length === 0 ? (
            <li className="text-sm text-muted">Bu günde görev yok.</li>
          ) : (
            dayTasks.map((task) =>
              editing === task.id ? (
                <li key={task.id}>
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
                      className="h-10 rounded-xl border border-white/10 bg-black/30 px-3 text-sm"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        name="subject"
                        defaultValue={task.subject}
                        placeholder="Ders"
                        className="h-10 rounded-xl border border-white/10 bg-black/30 px-3 text-sm"
                      />
                      <input
                        name="minutes"
                        type="number"
                        defaultValue={task.minutes}
                        className="h-10 rounded-xl border border-white/10 bg-black/30 px-3 text-sm"
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
                <li key={task.id} className="rounded-2xl bg-black/20 p-3">
                  <div className="flex items-start gap-2">
                    <form action={toggleTaskAction.bind(null, task.id)}>
                      <button
                        type="submit"
                        className={`mt-1 h-4 w-4 rounded border ${
                          task.done ? "border-accent bg-accent" : "border-white/30"
                        }`}
                      />
                    </form>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm ${task.done ? "text-muted line-through" : ""}`}>{task.title}</p>
                      <p className="text-xs text-muted">
                        {task.minutes} dk{task.subject ? ` · ${task.subject}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex gap-2 text-xs">
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

        <form action={createTaskAction} className="mt-5 grid gap-2 border-t border-white/10 pt-4">
          <p className="text-sm font-medium">Yeni görev</p>
          <input type="hidden" name="date" value={selected} />
          <input
            name="title"
            required
            placeholder="Ne çalışacaksın?"
            className="h-10 rounded-xl border border-white/10 bg-black/30 px-3 text-sm"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              name="subject"
              placeholder="Ders"
              className="h-10 rounded-xl border border-white/10 bg-black/30 px-3 text-sm"
            />
            <input
              name="minutes"
              type="number"
              min={10}
              defaultValue={40}
              className="h-10 rounded-xl border border-white/10 bg-black/30 px-3 text-sm"
            />
          </div>
          <button type="submit" className="h-10 rounded-xl bg-accent text-sm font-semibold text-black">
            Ekle
          </button>
        </form>
      </aside>
    </div>
  );
}
