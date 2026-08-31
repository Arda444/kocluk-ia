import Groq from "groq-sdk";
import { auth } from "@/auth";
import { dbErrorMessage, ensureSchema, prisma } from "@/lib/prisma";
import { buildSystemPrompt } from "@/lib/prompt";
import { extractPlanItems } from "@/lib/plan";
import { istanbulToday } from "@/lib/dates";
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
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  try {
    await ensureSchema();
  } catch (error) {
    return Response.json({ error: dbErrorMessage(error) }, { status: 503 });
  }

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
  try {
    conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, userId: session.user.id },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
    if (!conversation) {
      return Response.json(
        { error: "Bu sohbet bulunamadı. Yeni bir sohbet başlat." },
        { status: 404 },
      );
    }

    profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    });
    if (!profile) {
      return Response.json({ error: "Önce tanışma formunu doldur." }, { status: 400 });
    }

    todayTasks = await prisma.studyTask.findMany({
      where: { userId: session.user.id, date: istanbulToday() },
      orderBy: { createdAt: "asc" },
    });
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
    { role: "system", content: buildSystemPrompt(profile, todayTasks, istanbulToday()) },
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
          const { clean, items } = extractPlanItems(full, istanbulToday());
          if (items.length) {
            await prisma.studyTask.createMany({
              data: items.map((item) => ({
                userId: session.user.id,
                date: item.date,
                title: item.title,
                subject: item.subject ?? "",
                minutes: item.minutes ?? 40,
              })),
            });
          }
          await prisma.message.create({
            data: {
              conversationId,
              role: "assistant",
              content: items.length
                ? `${clean}\n\n${items.length} görev takvime eklendi.`
                : clean || full,
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
