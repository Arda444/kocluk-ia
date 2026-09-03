import type { ReactNode } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getAppUser } from "@/lib/app-user";
import { MobileNav } from "@/components/MobileNav";
import { SideNav } from "@/components/SideNav";
import { examLabel, gradeLabel, platformLabel, trackLabel } from "@/lib/labels";
import { istanbulToday } from "@/lib/dates";
import { STUDENT_NAME } from "@/lib/student";

export async function AppShell({ children }: { children: ReactNode }) {
  const user = await getAppUser();
  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  const [conversations, todayCount] = await Promise.all([
    prisma.conversation.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true },
    }),
    prisma.studyTask.count({
      where: { userId: user.id, date: istanbulToday(), done: false },
    }),
  ]);

  const name = profile?.displayName || user.name || STUDENT_NAME;

  return (
    <div className="flex h-svh min-h-0 flex-col md:flex-row">
      <aside className="hidden w-[280px] shrink-0 flex-col border-r border-white/10 bg-[#0a102c]/80 md:flex">
        <div className="border-b border-white/10 p-4">
          <Link href="/program" className="text-xs font-semibold tracking-[0.18em] text-accent">
            ALL STAR TYT
          </Link>
          <p className="mt-2 truncate font-medium">{name}</p>
          <p className="truncate text-xs text-muted">
            {gradeLabel(profile?.grade ?? "12")} · {platformLabel(profile?.platform ?? "kaynak345")}
            {profile?.examType === "YKS" ? ` · ${trackLabel(profile.track)}` : ""}
          </p>
        </div>
        <div className="flex min-h-0 flex-1 flex-col px-4 pb-2">
          <SideNav todayCount={todayCount} conversations={conversations} />
        </div>
        <div className="border-t border-white/10 p-2">
          <Link
            href="/onboarding"
            className="block rounded-lg px-3 py-2 text-sm text-muted hover:bg-white/5 hover:text-foreground"
          >
            Profili düzenle
          </Link>
          <p className="px-3 pb-2 text-[11px] text-muted">{examLabel(profile?.examType ?? "YKS")}</p>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="border-b border-white/10 px-4 py-3 md:hidden">
          <div className="flex items-center justify-between">
            <Link href="/program" className="text-[10px] font-semibold tracking-[0.16em] text-accent">
              ALL STAR TYT
            </Link>
            <span className="truncate text-xs text-muted">{name}</span>
          </div>
        </header>
        <section className="flex min-h-0 flex-1 flex-col">{children}</section>
        <MobileNav todayCount={todayCount} />
      </div>
    </div>
  );
}
