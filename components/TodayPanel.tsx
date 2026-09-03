import Link from "next/link";
import { toggleTaskAction } from "@/app/actions";
import { tytNet } from "@/lib/allstar-tyt";
import { subjectDot } from "@/lib/subjects";
import { StartTimerButton } from "@/components/StartTimerButton";
import { ElapsedLabel } from "@/components/ElapsedLabel";

export type TodayTaskItem = {
  id: string;
  title: string;
  subject: string;
  minutes: number;
  done: boolean;
  targetQuestions?: number;
  correct?: number;
  wrong?: number;
  blank?: number;
  elapsedSeconds?: number;
};

export function TodayPanel({ tasks }: { tasks: TodayTaskItem[] }) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-muted">
        Bugün programda iş yok.{" "}
        <Link href="/program" className="text-accent">
          Haftalık tabloya git
        </Link>
        .
      </div>
    );
  }

  const open = tasks.filter((task) => !task.done).length;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium">Bugünün All Star işleri</p>
        <Link href="/program" className="text-xs text-accent">
          {open} kalan · tablo
        </Link>
      </div>
      <ul className="space-y-2">
        {tasks.map((task) => {
          const scored = (task.correct ?? 0) + (task.wrong ?? 0) + (task.blank ?? 0) > 0;
          return (
            <li key={task.id} className="flex items-start justify-between gap-2 text-sm">
              <div className="flex min-w-0 items-start gap-2">
              <form action={toggleTaskAction.bind(null, task.id)}>
                <button
                  type="submit"
                  className={`mt-0.5 h-4 w-4 rounded border ${
                    task.done ? "border-correct bg-correct" : "border-white/30"
                  }`}
                  aria-label="Tamamla"
                />
              </form>
              <span className={task.done ? "text-muted line-through" : ""}>
                {task.title}
                <span className="ml-2 inline-flex items-center gap-1.5 text-xs text-muted">
                  {task.subject ? <span className={`h-1.5 w-1.5 rounded-full ${subjectDot(task.subject)}`} /> : null}
                  <ElapsedLabel
                    taskId={task.id}
                    elapsedSeconds={task.elapsedSeconds ?? 0}
                    targetMinutes={task.minutes}
                  />
                  {task.targetQuestions ? ` · ${task.targetQuestions} soru` : ""}
                  {scored ? (
                    <span className="ml-1">
                      {" · "}
                      <span className="text-correct">{task.correct}D</span>{" "}
                      <span className="text-wrong">{task.wrong}Y</span>{" "}
                      <span className="text-blank">{task.blank}B</span>
                      <span> net {tytNet(task.correct ?? 0, task.wrong ?? 0)}</span>
                    </span>
                  ) : null}
                </span>
              </span>
              </div>
              <StartTimerButton
                task={{
                  id: task.id,
                  title: task.title,
                  subject: task.subject,
                  targetMinutes: task.minutes,
                  elapsedSeconds: task.elapsedSeconds ?? 0,
                }}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
