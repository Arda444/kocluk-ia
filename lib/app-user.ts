import { prisma, ensureSchema } from "@/lib/prisma";
import { ensureAllStarProgram } from "@/lib/ensure-program";
import {
  STUDENT_NAME,
  isPlaceholderName,
  rewritePlaceholderText,
} from "@/lib/student";

const LOCAL_EMAIL = "local@allstar.tyt";

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

async function rewriteE2eMentions(userId: string) {
  const messages = await prisma.message.findMany({
    where: { conversation: { userId }, content: { contains: "E2E" } },
    select: { id: true, content: true },
  });
  await Promise.all(
    messages.map((message) => {
      const content = rewritePlaceholderText(message.content);
      if (content === message.content) return Promise.resolve(message);
      return prisma.message.update({
        where: { id: message.id },
        data: { content },
      });
    }),
  );
}

export async function getAppUser() {
  await ensureSchema();

  let user = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
  if (!user) {
    try {
      user = await prisma.user.create({
        data: {
          email: LOCAL_EMAIL,
          name: STUDENT_NAME,
          passwordHash: "local-no-login",
        },
      });
    } catch {
      user =
        (await prisma.user.findUnique({ where: { email: LOCAL_EMAIL } })) ??
        (await prisma.user.findFirst({ orderBy: { createdAt: "asc" } }));
    }
  }
  if (!user) {
    throw new Error("Kullanıcı bulunamadı");
  }
  if (isPlaceholderName(user.name)) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { name: STUDENT_NAME },
    });
  }

  await ensureProfile(user.id, user.name || STUDENT_NAME);
  await rewriteE2eMentions(user.id);
  await ensureAllStarProgram(user.id);
  return user;
}
