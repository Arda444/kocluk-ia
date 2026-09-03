import { AppShell } from "@/components/AppShell";
import { ProgramBoard } from "@/components/ProgramBoard";
import { getAppUser } from "@/lib/app-user";
import { prisma } from "@/lib/prisma";
import { defaultProgramStart } from "@/lib/allstar-tyt";

export default async function ProgramPage() {
  const user = await getAppUser();
  const tasks = await prisma.studyTask.findMany({
    where: { userId: user.id },
    orderBy: [{ date: "asc" }, { createdAt: "asc" }],
  });

  return (
    <AppShell>
      <ProgramBoard
        defaultStart={defaultProgramStart()}
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
