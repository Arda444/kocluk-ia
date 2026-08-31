import Groq from "groq-sdk";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buildSystemPrompt } from "@/lib/prompt";

const PRIMARY_MODEL = "llama-3.3-70b-versatile";
const FALLBACK_MODEL = "llama-3.1-8b-instant";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  if (!process.env.GROQ_API_KEY) {
    return Response.json(
      { error: "GROQ_API_KEY tanımlı değil. .env dosyasına ücretsiz Groq anahtarını ekle." },
      { status: 503 },
    );
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

  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, userId: session.user.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!conversation) {
    return Response.json({ error: "Sohbet bulunamadı." }, { status: 404 });
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) {
    return Response.json({ error: "Önce tanışma formunu doldur." }, { status: 400 });
  }

  const userMessage = await prisma.message.create({
    data: { conversationId, role: "user", content },
  });

  const userMessageCount = conversation.messages.filter((m) => m.role === "user").length;
  if (userMessageCount === 0) {
    const title = content.length > 48 ? `${content.slice(0, 48)}…` : content;
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { title, updatedAt: new Date() },
    });
  } else {
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });
  }

  const history = [
    ...conversation.messages,
    userMessage,
  ].map((message) => ({
    role: message.role as "user" | "assistant",
    content: message.content,
  }));

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const messages = [
    { role: "system" as const, content: buildSystemPrompt(profile) },
    ...history,
  ];

  let groqStream;
  try {
    groqStream = await groq.chat.completions.create({
      model: PRIMARY_MODEL,
      messages,
      stream: true,
      temperature: 0.6,
    });
  } catch {
    groqStream = await groq.chat.completions.create({
      model: FALLBACK_MODEL,
      messages,
      stream: true,
      temperature: 0.6,
    });
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
            data: { conversationId, role: "assistant", content: full },
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
