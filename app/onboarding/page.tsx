import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { OnboardingWizard } from "@/components/OnboardingWizard";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });

  return (
    <main className="min-h-full">
      <OnboardingWizard
        defaultName={session.user.name ?? ""}
        initial={
          profile
            ? {
                displayName: profile.displayName,
                examType: profile.examType,
                grade: profile.grade,
                track: profile.track,
                platform: profile.platform,
                platformNote: profile.platformNote,
                dailyHours: profile.dailyHours,
                target: profile.target,
                weakSubjects: profile.weakSubjects,
              }
            : undefined
        }
      />
    </main>
  );
}
