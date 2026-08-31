import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { OnboardingForm } from "@/components/OnboardingForm";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });

  return (
    <main className="mx-auto flex min-h-full max-w-lg flex-col justify-center px-6 py-12">
      <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
        Tanışalım
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">Seni tanıyalım</h1>
      <p className="mt-2 mb-8 text-slate-400">
        Sınıfın, alanın ve günlük süren koçun her sohbette yanında olsun.
      </p>
      <OnboardingForm
        defaultName={session.user.name ?? ""}
        initial={
          profile
            ? {
                displayName: profile.displayName,
                examType: profile.examType,
                grade: profile.grade,
                track: profile.track,
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
