import { prisma } from "@/lib/prisma";
import { welcomeMessage } from "@/lib/prompt";
import { istanbulToday } from "@/lib/dates";

export async function getOrCreateCoachConversation(userId: string) {
  const latest = await prisma.conversation.findFirst({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: { id: true },
  });
  if (latest) return latest.id;

  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) return null;

  const todayTasks = await prisma.studyTask.findMany({
    where: { userId, date: istanbulToday() },
    orderBy: { createdAt: "asc" },
  });

  const conversation = await prisma.conversation.create({
    data: {
      userId,
      title: "Koç",
      messages: {
        create: {
          role: "assistant",
          content: welcomeMessage(profile, todayTasks),
        },
      },
    },
  });
  return conversation.id;
}
