import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NewChatButton, SignOutButton } from "@/components/SidebarActions";
import { ConversationList } from "@/components/ConversationList";
import { examLabel, gradeLabel, trackLabel } from "@/lib/labels";

export default async function ChatLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) {
    redirect("/onboarding");
  }

  const conversations = await prisma.conversation.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, updatedAt: true },
  });

  return (
    <div className="flex h-svh min-h-0 flex-col md:flex-row">
      <aside className="flex max-h-[42vh] w-full shrink-0 flex-col border-b border-white/10 bg-[#0e1528]/90 md:max-h-none md:w-[280px] md:border-b-0 md:border-r">
        <div className="border-b border-white/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">
            Sınav Koçu
          </p>
          <p className="mt-2 truncate font-medium">{profile.displayName}</p>
          <p className="truncate text-xs text-slate-400">
            {gradeLabel(profile.grade)} · {examLabel(profile.examType)}
            {profile.examType === "YKS" ? ` · ${trackLabel(profile.track)}` : ""}
          </p>
          <div className="mt-4">
            <NewChatButton />
          </div>
        </div>
        <nav className="min-h-0 flex-1 overflow-y-auto p-2">
          <ConversationList conversations={conversations} />
        </nav>
        <div className="border-t border-white/10 p-2">
          <Link
            href="/onboarding"
            className="block rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-white/5 hover:text-slate-100"
          >
            Profili düzenle
          </Link>
          <SignOutButton />
        </div>
      </aside>
      <section className="flex min-w-0 flex-1 flex-col">{children}</section>
    </div>
  );
}
