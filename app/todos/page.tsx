import { AppShell } from "@/components/AppShell";
import { TodoBoard } from "@/components/TodoBoard";
import { getAppUser } from "@/lib/app-user";
import { prisma } from "@/lib/prisma";

export default async function TodosPage() {
  const user = await getAppUser();
  const todos = await prisma.todoItem.findMany({
    where: { userId: user.id },
    orderBy: [{ done: "asc" }, { createdAt: "desc" }],
  });

  return (
    <AppShell>
      <TodoBoard todos={todos.map((todo) => ({ id: todo.id, title: todo.title, done: todo.done }))} />
    </AppShell>
  );
}
