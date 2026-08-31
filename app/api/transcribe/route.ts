import Groq from "groq-sdk";
import { auth } from "@/auth";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Giriş gerekli." }, { status: 401 });
  }
  if (!process.env.GROQ_API_KEY) {
    return Response.json({ error: "GROQ_API_KEY yok." }, { status: 503 });
  }

  const form = await request.formData();
  const audio = form.get("audio");
  if (!(audio instanceof File) || audio.size < 100) {
    return Response.json({ error: "Ses bulunamadı." }, { status: 400 });
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const result = await groq.audio.transcriptions.create({
    file: audio,
    model: "whisper-large-v3",
    language: "tr",
  });

  return Response.json({ text: result.text.trim() });
}
