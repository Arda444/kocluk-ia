import { allStarTopics, tytNet, TYT_PROGRAM } from "@/lib/allstar-tyt";

export type ScoreTask = {
  date: string;
  title: string;
  subject: string;
  minutes: number;
  done: boolean;
  topicKey?: string | null;
  weekNumber?: number | null;
  targetQuestions?: number | null;
  correct?: number | null;
  wrong?: number | null;
  blank?: number | null;
  note?: string | null;
  source?: string | null;
  elapsedSeconds?: number | null;
};

export function isProgramTask(task: ScoreTask) {
  return task.source === TYT_PROGRAM.source;
}

export function summarizeProgram(tasks: ScoreTask[]) {
  const program = tasks.filter(isProgramTask);
  const topics = allStarTopics();
  const doneKeys = new Set(
    program.filter((task) => task.done && task.topicKey).map((task) => task.topicKey as string),
  );
  const uniqueKeys = new Set(program.map((task) => task.topicKey).filter(Boolean) as string[]);
  const curriculumDone = topics.filter((topic) => {
    const related = program.filter((task) => task.topicKey === topic.key);
    return related.length > 0 && related.every((task) => task.done);
  }).length;

  const correct = program.reduce((sum, task) => sum + (task.correct ?? 0), 0);
  const wrong = program.reduce((sum, task) => sum + (task.wrong ?? 0), 0);
  const blank = program.reduce((sum, task) => sum + (task.blank ?? 0), 0);
  const target = program.reduce((sum, task) => sum + (task.targetQuestions ?? 0), 0);
  const solved = correct + wrong + blank;
  const done = program.filter((task) => task.done).length;
  const elapsedSeconds = program.reduce((sum, task) => sum + (task.elapsedSeconds ?? 0), 0);
  const targetSeconds = program.reduce((sum, task) => sum + task.minutes * 60, 0);

  const bySubject: Record<
    string,
    {
      done: number;
      total: number;
      correct: number;
      wrong: number;
      blank: number;
      solved: number;
      target: number;
      elapsed: number;
      targetMin: number;
    }
  > = {};
  for (const task of program) {
    const key = task.subject || "Diğer";
    const row = bySubject[key] ?? {
      done: 0,
      total: 0,
      correct: 0,
      wrong: 0,
      blank: 0,
      solved: 0,
      target: 0,
      elapsed: 0,
      targetMin: 0,
    };
    row.total += 1;
    if (task.done) row.done += 1;
    row.correct += task.correct ?? 0;
    row.wrong += task.wrong ?? 0;
    row.blank += task.blank ?? 0;
    row.solved += (task.correct ?? 0) + (task.wrong ?? 0) + (task.blank ?? 0);
    row.target += task.targetQuestions ?? 0;
    row.elapsed += task.elapsedSeconds ?? 0;
    row.targetMin += task.minutes;
    bySubject[key] = row;
  }

  return {
    totalTasks: program.length,
    doneTasks: done,
    taskPct: program.length ? Math.round((done / program.length) * 100) : 0,
    topicCount: topics.length,
    topicsCompleted: curriculumDone,
    topicPct: topics.length ? Math.round((curriculumDone / topics.length) * 100) : 0,
    uniqueTopicKeys: uniqueKeys.size,
    markedTopicKeys: doneKeys.size,
    correct,
    wrong,
    blank,
    solved,
    target,
    net: tytNet(correct, wrong),
    hoursDone: Math.round((elapsedSeconds / 3600) * 10) / 10,
    hoursTotal: Math.round((targetSeconds / 3600) * 10) / 10,
    elapsedSeconds,
    targetSeconds,
    bySubject,
  };
}
