"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { StatsPanel } from "@/components/StatsPanel";
import { TYT_PROGRAM, programWeekOf } from "@/lib/allstar-tyt";
import { istanbulToday } from "@/lib/dates";
import { summarizeProgram } from "@/lib/program-stats";
import type { ProgramTask } from "@/components/ProgramBoard";

export function StatsBoard({ initialTasks }: { initialTasks: ProgramTask[] }) {
  const today = istanbulToday();
  const programTasks = initialTasks.filter((task) => task.source === TYT_PROGRAM.source);
  const startMonday = programTasks.reduce(
    (min, task) => (task.date < min ? task.date : min),
    programTasks[0]?.date ?? TYT_PROGRAM.startDate,
  );
  const maxWeek = programTasks.reduce((max: number, task) => Math.max(max, task.weekNumber), 1);
  const inferred = programWeekOf(startMonday, today);
  const [week, setWeek] = useState(() => Math.min(maxWeek, Math.max(1, inferred || 1)));

  const stats = useMemo(() => summarizeProgram(programTasks), [programTasks]);
  const weekTasks = programTasks.filter((task) => task.weekNumber === week);
  const weekStats = useMemo(() => summarizeProgram(weekTasks), [weekTasks]);
  const weekDone = weekTasks.filter((task) => task.done).length;

  if (programTasks.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-5 py-12">
        <p className="text-xs font-medium tracking-[0.16em] text-accent">İSTATİSTİK</p>
        <h1 className="mt-2 font-serif text-4xl">Henüz veri yok</h1>
        <p className="mt-4 text-sm leading-6 text-muted">
          Program yüklendikten sonra doğru, yanlış, boş ve çözülen soru burada toplanır.
        </p>
        <Link
          href="/program"
          className="mt-8 flex h-12 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white"
        >
          Panele git
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-4 md:px-6">
        <div>
          <p className="text-xs font-medium tracking-[0.16em] text-accent">İSTATİSTİK</p>
          <h1 className="font-serif text-3xl">Program özeti</h1>
          <p className="mt-1 text-sm text-muted">
            {stats.solved} çözülen / {stats.target} hedef · net {stats.net}
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
            Hafta {week}/{TYT_PROGRAM.weeks}
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

      <div className="p-4 md:p-6">
        <StatsPanel
          layout="page"
          stats={stats}
          weekLabel={`Hafta ${week} · ${weekDone}/${weekTasks.length} blok`}
          weekDone={weekDone}
          weekTotal={weekTasks.length}
          weekElapsed={weekTasks.reduce((sum, task) => sum + task.elapsedSeconds, 0)}
          weekTargetSeconds={weekTasks.reduce((sum, task) => sum + task.minutes * 60, 0)}
          weekSolved={weekStats.solved}
          weekTarget={weekStats.target}
          weekCorrect={weekStats.correct}
          weekWrong={weekStats.wrong}
          weekBlank={weekStats.blank}
          weekNet={weekStats.net}
        />
      </div>
    </div>
  );
}
