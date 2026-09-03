import { prisma } from "@/lib/prisma";
import { buildAllStarTytProgram, defaultProgramStart, TYT_PROGRAM } from "@/lib/allstar-tyt";

let seedLock: Promise<void> | null = null;

async function insertProgram(userId: string, start: string) {
  const seeds = buildAllStarTytProgram(start);
  for (let index = 0; index < seeds.length; index += 40) {
    const chunk = seeds.slice(index, index + 40);
    await prisma.studyTask.createMany({
      data: chunk.map((item) => ({
        userId,
        date: item.date,
        title: item.title,
        subject: item.subject,
        minutes: item.minutes,
        topicKey: item.topicKey,
        weekNumber: item.weekNumber,
        targetQuestions: item.targetQuestions,
        source: item.source,
      })),
    });
  }
}

async function dedupeProgram(userId: string) {
  const rows = await prisma.studyTask.findMany({
    where: { userId, source: TYT_PROGRAM.source },
    orderBy: { createdAt: "asc" },
    select: { id: true, date: true, topicKey: true, title: true },
  });
  const seen = new Set<string>();
  const extra: string[] = [];
  for (const row of rows) {
    const key = `${row.date}|${row.topicKey}|${row.title}`;
    if (seen.has(key)) extra.push(row.id);
    else seen.add(key);
  }
  if (extra.length) {
    await prisma.studyTask.deleteMany({ where: { id: { in: extra } } });
  }
}

export async function ensureAllStarProgram(userId: string) {
  if (seedLock) {
    await seedLock;
    return;
  }

  seedLock = (async () => {
    const wanted = defaultProgramStart();
    const first = await prisma.studyTask.findFirst({
      where: { userId, source: TYT_PROGRAM.source },
      orderBy: { date: "asc" },
      select: { date: true },
    });

    if (first && first.date < wanted) {
      await prisma.studyTask.deleteMany({
        where: { userId, source: TYT_PROGRAM.source },
      });
    } else if (first) {
      const existing = await prisma.studyTask.count({
        where: { userId, source: TYT_PROGRAM.source },
      });
      if (existing > 450) await dedupeProgram(userId);
      return;
    }

    await insertProgram(userId, wanted);

    await prisma.profile.updateMany({
      where: { userId },
      data: {
        examType: "YKS",
        platform: "kaynak345",
        platformNote: "345 All Star TYT konu + veri bankası",
        dailyHours: 4,
      },
    });
  })();

  try {
    await seedLock;
  } finally {
    seedLock = null;
  }
}

export { insertProgram };
