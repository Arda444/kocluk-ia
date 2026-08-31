import { createConversationAction } from "@/app/actions";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { istanbulNowLabel, istanbulToday } from "@/lib/dates";
import { TodayPanel } from "@/components/TodayPanel";

export default async function ChatIndexPage() {
  const session = await auth();
  const todayTasks = session?.user?.id
    ? await prisma.studyTask.findMany({
        where: { userId: session.user.id, date: istanbulToday() },
        orderBy: { createdAt: "asc" },
      })
    : [];

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
      <p className="text-sm text-muted">{istanbulNowLabel()}</p>
      <h1 className="mt-2 font-serif text-3xl">Bugün hazır mısın?</h1>
      <p className="mt-3 max-w-md text-muted">
        Koç, kaynağına göre plan kurar. Sesli konuşabilir, takvimden değiştirebilirsin.
      </p>
      <div className="mt-6 w-full max-w-md text-left">
        <TodayPanel tasks={todayTasks} />
      </div>
      <form action={createConversationAction} className="mt-6">
        <button
          type="submit"
          className="h-12 rounded-full bg-accent px-8 font-semibold text-black"
        >
          Koçla konuş
        </button>
      </form>
    </div>
  );
}
