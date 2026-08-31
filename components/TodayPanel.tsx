import Link from "next/link";
import { toggleTaskAction } from "@/app/actions";

export type TodayTaskItem = {
  id: string;
  title: string;
  subject: string;
  minutes: number;
  done: boolean;
};

export function TodayPanel({ tasks }: { tasks: TodayTaskItem[] }) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-muted">
        Bugün takvimde iş yok. Koçtan plan iste veya{" "}
        <Link href="/calendar" className="text-accent">
          takvime ekle
        </Link>
        .
      </div>
    );
  }

  const open = tasks.filter((task) => !task.done).length;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium">Bugünün işleri</p>
        <span className="text-xs text-muted">{open} kalan</span>
      </div>
      <ul className="space-y-2">
        {tasks.map((task) => (
          <li key={task.id} className="flex items-start gap-2 text-sm">
            <form action={toggleTaskAction.bind(null, task.id)}>
              <button
                type="submit"
                className={`mt-0.5 h-4 w-4 rounded border ${
                  task.done ? "border-accent bg-accent" : "border-white/30"
                }`}
                aria-label="Tamamla"
              />
            </form>
            <span className={task.done ? "text-muted line-through" : ""}>
              {task.title}
              <span className="ml-2 text-xs text-muted">
                {task.minutes} dk{task.subject ? ` · ${task.subject}` : ""}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
