import { AppShell } from "@/components/AppShell";
import { CalendarBoard } from "@/components/CalendarBoard";
import { getAppUser } from "@/lib/app-user";
import { prisma } from "@/lib/prisma";

export default async function CalendarPage() {
  const user = await getAppUser();
  const tasks = await prisma.studyTask.findMany({
    where: { userId: user.id },
    orderBy: [{ date: "asc" }, { createdAt: "asc" }],
  });

  return (
    <AppShell>
      <CalendarBoard initialTasks={tasks} />
    </AppShell>
  );
}
