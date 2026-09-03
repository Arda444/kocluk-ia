import Groq from "groq-sdk";
import { getAppUser } from "@/lib/app-user";
import { dbErrorMessage, prisma } from "@/lib/prisma";
import { buildSystemPrompt } from "@/lib/prompt";
import { stripPlanBlocks } from "@/lib/plan";
import { istanbulToday, weekRange } from "@/lib/dates";
import { TYT_PROGRAM, programWeekOf } from "@/lib/allstar-tyt";
import {
  getGroqApiKey,
  groqErrorMessage,
  groqErrorText,
  groqMissingMessage,
  groqRetryWaitMs,
  isGroqOversize,
  isGroqRateLimit,
} from "@/lib/groq-env";

const PRIMARY_MODEL = "openai/gpt-oss-120b";
const FALLBACK_MODEL = "openai/gpt-oss-20b";
const COMPLETION_TOKENS = 1200;
const COMPACT_TOKENS = 700;
const HISTORY_LIMIT = 8;

export const maxDuration = 60;
export const runtime = "nodejs";

type ChatTurn = { role: "system" | "user" | "assistant"; content: string };

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function createChatStream(groq: Groq, model: string, messages: ChatTurn[], maxTokens: number) {
  return groq.chat.completions.create({
    model,
    messages,
    stream: true,
    temperature: 0.55,
    max_tokens: maxTokens,
    reasoning_effort: "low",
  });
}

async function openChatStream(groq: Groq, messages: ChatTurn[]) {
  let lastError: unknown;
  for (const model of [PRIMARY_MODEL, FALLBACK_MODEL]) {
    for (const maxTokens of [COMPLETION_TOKENS, COMPACT_TOKENS]) {
      try {
        return await createChatStream(groq, model, messages, maxTokens);
      } catch (error) {
        lastError = error;
        if (isGroqOversize(error) && maxTokens === COMPLETION_TOKENS) continue;
        if (isGroqRateLimit(error) && /Used \d+/i.test(groqErrorText(error))) {
          await sleep(groqRetryWaitMs(error));
          continue;
        }
        break;
      }
    }
  }
  throw lastError;
}

export async function POST(request: Request) {
  const user = await getAppUser();

  const groqKey = getGroqApiKey();
  if (!groqKey) {
    return Response.json({ error: groqMissingMessage() }, { status: 503 });
  }

  const body = (await request.json()) as {
    conversationId?: string;
    content?: string;
  };
  const conversationId = body.conversationId?.trim();
  const content = body.content?.trim();
  if (!conversationId || !content) {
    return Response.json({ error: "Mesaj ve sohbet gerekli." }, { status: 400 });
  }

  let conversation;
  let profile;
  let todayTasks;
  let weekTasks;
  let programLoaded = false;
  let programStart = "";
  try {
    conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, userId: user.id },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
    if (!conversation) {
      return Response.json(
        { error: "Bu sohbet bulunamadı. Yeni bir sohbet başlat." },
        { status: 404 },
      );
    }

    profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });
    if (!profile) {
      return Response.json({ error: "Önce tanışma formunu doldur." }, { status: 400 });
    }

    const today = istanbulToday();
    const range = weekRange(today);
    const [todayRows, weekRows, firstProgram] = await Promise.all([
      prisma.studyTask.findMany({
        where: { userId: user.id, date: today },
        orderBy: { createdAt: "asc" },
      }),
      prisma.studyTask.findMany({
        where: {
          userId: user.id,
          source: TYT_PROGRAM.source,
          date: { gte: range.start, lte: range.end },
        },
        orderBy: [{ date: "asc" }, { createdAt: "asc" }],
      }),
      prisma.studyTask.findFirst({
        where: { userId: user.id, source: TYT_PROGRAM.source },
        orderBy: { date: "asc" },
        select: { date: true },
      }),
    ]);
    todayTasks = todayRows;
    weekTasks = weekRows;
    programLoaded = Boolean(firstProgram);
    programStart = firstProgram?.date ?? "";
  } catch (error) {
    return Response.json({ error: dbErrorMessage(error) }, { status: 503 });
  }

  if (!conversation || !profile || !todayTasks) {
    return Response.json({ error: "Sohbet yüklenemedi. Lütfen tekrar dene." }, { status: 503 });
  }

  const history = conversation.messages
    .slice(-HISTORY_LIMIT)
    .map((message) => ({
      role: message.role as "user" | "assistant",
      content:
        message.role === "assistant" && message.content.length > 900
          ? `${message.content.slice(0, 900)}…`
          : message.content,
    }));

  const groq = new Groq({ apiKey: groqKey });
  const messages: ChatTurn[] = [
    { role: "system", content: buildSystemPrompt(profile, todayTasks, istanbulToday(), {
      loaded: programLoaded,
      week: programLoaded ? programWeekOf(programStart, istanbulToday()) : 0,
      totalWeeks: TYT_PROGRAM.weeks,
      weekTasks: weekTasks ?? [],
    }) },
    ...history,
    { role: "user", content },
  ];

  let groqStream;
  try {
    groqStream = await openChatStream(groq, messages);
  } catch (error) {
    return Response.json({ error: groqErrorMessage(error) }, { status: 502 });
  }

  try {
    await prisma.message.create({
      data: { conversationId, role: "user", content },
    });

    const userMessageCount = conversation.messages.filter((m) => m.role === "user").length;
    const title =
      userMessageCount === 0
        ? content.length > 48
          ? `${content.slice(0, 48)}…`
          : content
        : conversation.title;

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { title, updatedAt: new Date() },
    });
  } catch (error) {
    return Response.json({ error: dbErrorMessage(error) }, { status: 503 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let full = "";
      try {
        for await (const chunk of groqStream) {
          const delta = chunk.choices[0]?.delta?.content ?? "";
          if (delta) {
            full += delta;
            controller.enqueue(encoder.encode(delta));
          }
        }
        if (full.trim()) {
          await prisma.message.create({
            data: {
              conversationId,
              role: "assistant",
              content: stripPlanBlocks(full) || full,
            },
          });
          await prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() },
          });
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
