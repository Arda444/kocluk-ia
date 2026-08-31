import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { auth } from "@/auth";
import { prisma, ensureSchema } from "@/lib/prisma";
import { NewChatButton, SignOutButton } from "@/components/SidebarActions";
import { ConversationList } from "@/components/ConversationList";
import { MobileNav } from "@/components/MobileNav";
import { examLabel, gradeLabel, platformLabel, trackLabel } from "@/lib/labels";
import { istanbulToday } from "@/lib/dates";

export async function AppShell({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  let profile;
  let conversations: Array<{ id: string; title: string }> = [];
  let todayCount = 0;
  try {
    await ensureSchema();
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) {
      redirect("/logout");
    }
    const found = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    });
    if (!found) {
      redirect("/onboarding");
    }
    profile = found;
    [conversations, todayCount] = await Promise.all([
      prisma.conversation.findMany({
        where: { userId: session.user.id },
        orderBy: { updatedAt: "desc" },
        select: { id: true, title: true },
      }),
      prisma.studyTask.count({
        where: { userId: session.user.id, date: istanbulToday(), done: false },
      }),
    ]);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    redirect("/logout");
  }
  if (!profile) {
    redirect("/onboarding");
  }

  return (
    <div className="flex h-svh min-h-0 flex-col md:flex-row">
      <aside className="hidden w-[280px] shrink-0 flex-col border-r border-white/10 bg-black/25 md:flex">
        <div className="border-b border-white/10 p-4">
          <Link href="/" className="text-xs font-semibold tracking-[0.18em] text-accent">
            Sınav Koçu
          </Link>
          <p className="mt-2 truncate font-medium">{profile.displayName}</p>
          <p className="truncate text-xs text-muted">
            {gradeLabel(profile.grade)} · {platformLabel(profile.platform)}
            {profile.examType === "YKS" ? ` · ${trackLabel(profile.track)}` : ""}
          </p>
          <div className="mt-4 grid gap-2">
            <NewChatButton />
            <Link
              href="/calendar"
              className="flex h-10 items-center justify-center rounded-xl border border-white/10 text-sm"
            >
              Takvim{todayCount ? ` · ${todayCount}` : ""}
            </Link>
          </div>
        </div>
        <nav className="min-h-0 flex-1 overflow-y-auto p-2">
          <ConversationList conversations={conversations} />
        </nav>
        <div className="border-t border-white/10 p-2">
          <Link
            href="/onboarding"
            className="block rounded-lg px-3 py-2 text-sm text-muted hover:bg-white/5 hover:text-foreground"
          >
            Profili düzenle
          </Link>
          <p className="px-3 pb-2 text-[11px] text-muted">{examLabel(profile.examType)}</p>
          <SignOutButton />
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="border-b border-white/10 md:hidden">
          <div className="flex items-center justify-between px-4 pt-3 pb-1">
            <Link href="/chat" className="text-[10px] font-semibold tracking-[0.16em] text-accent">
              SINAV KOÇU
            </Link>
            <span className="truncate text-xs text-muted">{profile.displayName}</span>
          </div>
          <MobileNav todayCount={todayCount} />
        </header>
        <section className="flex min-h-0 flex-1 flex-col">{children}</section>
      </div>
    </div>
  );
}
