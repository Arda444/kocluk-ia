import { tytNet } from "@/lib/allstar-tyt";
import { SCORE } from "@/lib/score-style";
import { subjectDot } from "@/lib/subjects";
import { formatClock, formatHours } from "@/lib/time";

export type ProgramStatsView = {
  totalTasks: number;
  doneTasks: number;
  taskPct: number;
  topicCount: number;
  topicsCompleted: number;
  topicPct: number;
  correct: number;
  wrong: number;
  blank: number;
  solved: number;
  target: number;
  net: number;
  hoursDone: number;
  hoursTotal: number;
  elapsedSeconds?: number;
  targetSeconds?: number;
  bySubject: Record<
    string,
    {
      done: number;
      total: number;
      correct: number;
      wrong: number;
      blank: number;
      solved?: number;
      target?: number;
      elapsed?: number;
      targetMin?: number;
    }
  >;
};

export function StatsPanel({
  stats,
  weekLabel,
  weekDone,
  weekTotal,
  weekElapsed = 0,
  weekTargetSeconds = 0,
  weekSolved,
  weekTarget,
  weekCorrect,
  weekWrong,
  weekBlank,
  weekNet,
  layout = "aside",
}: {
  stats: ProgramStatsView;
  weekLabel: string;
  weekDone: number;
  weekTotal: number;
  weekElapsed?: number;
  weekTargetSeconds?: number;
  weekSolved?: number;
  weekTarget?: number;
  weekCorrect?: number;
  weekWrong?: number;
  weekBlank?: number;
  weekNet?: number;
  layout?: "aside" | "page";
}) {
  const subjects = Object.entries(stats.bySubject).sort((a, b) => b[1].total - a[1].total);
  const solvedPct = stats.target ? Math.round((stats.solved / stats.target) * 100) : 0;

  return (
    <section
      className={
        layout === "page"
          ? "grid gap-4 md:grid-cols-2"
          : "flex flex-col gap-3 rounded-3xl border border-white/10 bg-[#12163a]/80 p-4"
      }
    >
      <div className="rounded-3xl border border-accent/30 bg-accent/10 p-4 md:col-span-2">
        <p className="text-xs text-muted">Toplam çözülen soru</p>
        <p className="mt-1 font-serif text-4xl text-foreground">{stats.solved}</p>
        <p className="mt-1 text-sm text-muted">
          {stats.target} hedef · %{solvedPct}
          {" · net "}
          <span className="text-accent">{stats.net}</span>
        </p>
        {stats.elapsedSeconds != null ? (
          <p className="mt-2 text-xs text-muted">
            Süre {formatClock(stats.elapsedSeconds)} / hedef {formatHours(stats.targetSeconds ?? 0)} sa
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-2 md:col-span-2 md:grid-cols-4">
        <StatCard label="Görev" value={`${stats.doneTasks}/${stats.totalTasks}`} hint={`%${stats.taskPct}`} />
        <StatCard
          label="Konu"
          value={`${stats.topicsCompleted}/${stats.topicCount}`}
          hint={`%${stats.topicPct}`}
        />
        <StatCard label="Tutulan" value={`${stats.hoursDone} sa`} hint="kayıtlı süre" />
        <StatCard label="Hedef" value={`${stats.hoursTotal} sa`} hint="planlanan" />
      </div>

      <div className="grid grid-cols-3 gap-2 text-center md:col-span-2">
        <div className="rounded-2xl border border-correct/30 bg-correct/10 px-2 py-3">
          <p className="text-[11px] text-correct">Doğru</p>
          <p className="mt-1 text-xl font-semibold text-correct">{stats.correct}</p>
        </div>
        <div className="rounded-2xl border border-wrong/30 bg-wrong/10 px-2 py-3">
          <p className="text-[11px] text-wrong">Yanlış</p>
          <p className="mt-1 text-xl font-semibold text-wrong">{stats.wrong}</p>
        </div>
        <div className="rounded-2xl border border-blank/30 bg-blank/10 px-2 py-3">
          <p className="text-[11px] text-blank">Boş</p>
          <p className="mt-1 text-xl font-semibold text-blank">{stats.blank}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white/5 p-4">
        <p className="text-xs text-muted">{weekLabel}</p>
        <p className="mt-1 text-lg font-semibold">
          {weekDone}/{weekTotal} blok
        </p>
        {weekSolved != null ? (
          <p className="mt-1 text-sm">
            <span className="font-medium">{weekSolved} çözülen</span>
            {weekTarget ? <span className="text-muted"> / {weekTarget} hedef</span> : null}
          </p>
        ) : null}
        {weekCorrect != null ? (
          <p className="mt-1 text-xs">
            <span className="text-correct">{weekCorrect} D</span>
            {" · "}
            <span className="text-wrong">{weekWrong ?? 0} Y</span>
            {" · "}
            <span className="text-blank">{weekBlank ?? 0} B</span>
            {weekNet != null ? <span className="text-muted"> · net {weekNet}</span> : null}
          </p>
        ) : null}
        {weekTargetSeconds ? (
          <p className="mt-1 text-xs text-muted">
            Süre {formatClock(weekElapsed)} / hedef {formatHours(weekTargetSeconds)} sa
          </p>
        ) : null}
      </div>

      <ul className="space-y-3 rounded-2xl bg-white/5 p-4">
        {subjects.map(([subject, row]) => (
          <li key={subject}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${subjectDot(subject)}`} />
                {subject}
              </span>
              <span className="text-muted">
                {row.done}/{row.total}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-accent"
                style={{ width: `${row.total ? Math.round((row.done / row.total) * 100) : 0}%` }}
              />
            </div>
            <p className="mt-1 text-[10px]">
              <span className={SCORE.correct.chip}>{row.correct} D</span>
              {" · "}
              <span className={SCORE.wrong.chip}>{row.wrong} Y</span>
              {" · "}
              <span className={SCORE.blank.chip}>{row.blank} B</span>
              <span className="text-muted"> · net {tytNet(row.correct, row.wrong)}</span>
              {row.solved != null ? (
                <span className="text-muted">
                  {" "}
                  · {row.solved} çözülen
                  {row.target ? ` / ${row.target}` : ""}
                </span>
              ) : null}
              {row.elapsed || row.targetMin ? (
                <span className="text-muted">
                  {" "}
                  · {formatClock(row.elapsed ?? 0)} / {row.targetMin ?? 0} dk
                </span>
              ) : null}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl bg-white/5 px-3 py-3">
      <p className="text-[11px] text-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
      <p className="text-[11px] text-muted">{hint}</p>
    </div>
  );
}
