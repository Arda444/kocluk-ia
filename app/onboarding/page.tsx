import { getAppUser } from "@/lib/app-user";
import { prisma } from "@/lib/prisma";
import { OnboardingWizard } from "@/components/OnboardingWizard";

export default async function OnboardingPage() {
  const user = await getAppUser();
  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });

  return (
    <main className="min-h-full">
      <OnboardingWizard
        defaultName={user.name ?? ""}
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
