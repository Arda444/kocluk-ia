import { redirect } from "next/navigation";
import { getAppUser } from "@/lib/app-user";
import { prisma } from "@/lib/prisma";
import { ChatWindow } from "@/components/ChatWindow";
import { TodayPanel } from "@/components/TodayPanel";
import { istanbulToday } from "@/lib/dates";
import { studentFirstName } from "@/lib/student";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getAppUser();

  const conversation = await prisma.conversation.findFirst({
    where: { id, userId: user.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!conversation) {
    redirect("/chat");
  }

  const todayTasks = await prisma.studyTask.findMany({
    where: { userId: user.id, date: istanbulToday() },
    orderBy: { createdAt: "asc" },
  });

  return (
    <>
      <header className="border-b border-white/10 px-4 py-3 md:px-6">
        <h1 className="truncate font-serif text-xl">Koç</h1>
        <p className="truncate text-xs text-muted">
          {conversation.title === "Koç"
            ? `${studentFirstName(user.name)}, sana inanıyorum.`
            : conversation.title}
        </p>
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
