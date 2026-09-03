import { AppShell } from "@/components/AppShell";
import { StatsBoard } from "@/components/StatsBoard";
import { getAppUser } from "@/lib/app-user";
import { prisma } from "@/lib/prisma";

export default async function StatsPage() {
  const user = await getAppUser();
  const tasks = await prisma.studyTask.findMany({
    where: { userId: user.id },
    orderBy: [{ date: "asc" }, { createdAt: "asc" }],
  });

  return (
    <AppShell>
      <StatsBoard
        initialTasks={tasks.map((task) => ({
          id: task.id,
          date: task.date,
          title: task.title,
          subject: task.subject,
          minutes: task.minutes,
          done: task.done,
          topicKey: task.topicKey,
          weekNumber: task.weekNumber,
          targetQuestions: task.targetQuestions,
          correct: task.correct,
          wrong: task.wrong,
          blank: task.blank,
          note: task.note,
          source: task.source,
          elapsedSeconds: task.elapsedSeconds,
        }))}
      />
    </AppShell>
  );
}
