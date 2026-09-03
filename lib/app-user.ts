import { prisma, ensureSchema } from "@/lib/prisma";
import { ensureAllStarProgram } from "@/lib/ensure-program";
import { STUDENT_NAME } from "@/lib/student";

const LOCAL_EMAIL = "local@allstar.tyt";

function isPlaceholderName(name?: string | null) {
  const value = name?.trim() ?? "";
  return !value || value === "Öğrenci";
}

async function ensureProfile(userId: string, displayName: string) {
  const found = await prisma.profile.findUnique({ where: { userId } });
  if (found) {
    if (isPlaceholderName(found.displayName) && found.displayName !== displayName) {
      return prisma.profile.update({
        where: { userId },
        data: { displayName },
      });
    }
    return found;
  }
  return prisma.profile.create({
    data: {
      userId,
      displayName,
      examType: "YKS",
      grade: "12",
      track: "sayisal",
      platform: "kaynak345",
      platformNote: "345 All Star TYT konu + veri bankası",
      dailyHours: 4,
      target: "TYT'yi sıfırdan bitir",
      weakSubjects: "Matematik",
    },
  });
}

export async function getAppUser() {
  await ensureSchema();

  let user = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: LOCAL_EMAIL,
        name: STUDENT_NAME,
        passwordHash: "local-no-login",
      },
    });
  } else if (isPlaceholderName(user.name)) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { name: STUDENT_NAME },
    });
  }

  await ensureProfile(user.id, user.name || STUDENT_NAME);
  await ensureAllStarProgram(user.id);
  return user;
}
