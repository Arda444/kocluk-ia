import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ChatWindow } from "@/components/ChatWindow";
import { TodayPanel } from "@/components/TodayPanel";
import { istanbulToday } from "@/lib/dates";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const conversation = await prisma.conversation.findFirst({
    where: { id, userId: session.user.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!conversation) {
    notFound();
  }

  const todayTasks = await prisma.studyTask.findMany({
    where: { userId: session.user.id, date: istanbulToday() },
    orderBy: { createdAt: "asc" },
  });

  return (
    <>
      <header className="border-b border-white/10 px-4 py-3 md:px-6">
        <h1 className="truncate text-sm font-medium">{conversation.title}</h1>
      </header>
      <div className="border-b border-white/10 px-4 py-3 md:px-6">
        <TodayPanel tasks={todayTasks} />
      </div>
      <ChatWindow
        conversationId={conversation.id}
        initialMessages={conversation.messages.map((message) => ({
          id: message.id,
          role: message.role as "user" | "assistant",
          content: message.content,
        }))}
      />
    </>
  );
}
