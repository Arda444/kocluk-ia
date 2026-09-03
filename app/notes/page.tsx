import { AppShell } from "@/components/AppShell";
import { NotesBoard } from "@/components/NotesBoard";
import { getAppUser } from "@/lib/app-user";
import { prisma } from "@/lib/prisma";

export default async function NotesPage() {
  const user = await getAppUser();
  const notes = await prisma.stickyNote.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AppShell>
      <NotesBoard
        notes={notes.map((note) => ({
          id: note.id,
          body: note.body,
          color: note.color,
          createdAt: note.createdAt.toISOString(),
        }))}
      />
    </AppShell>
  );
}
