import { AppShell } from "@/components/AppShell";
import { CalendarBoard } from "@/components/CalendarBoard";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function CalendarPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const tasks = await prisma.studyTask.findMany({
    where: { userId: session.user.id },
    orderBy: [{ date: "asc" }, { createdAt: "asc" }],
  });

  return (
    <AppShell>
      <CalendarBoard initialTasks={tasks} />
    </AppShell>
  );
}
