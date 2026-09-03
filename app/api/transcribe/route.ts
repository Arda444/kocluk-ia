import Groq from "groq-sdk";
import { getAppUser } from "@/lib/app-user";
import { getGroqApiKey, groqMissingMessage } from "@/lib/groq-env";

export async function POST(request: Request) {
  await getAppUser();
  const groqKey = getGroqApiKey();
  if (!groqKey) {
    return Response.json({ error: groqMissingMessage() }, { status: 503 });
  }

  const form = await request.formData();
  const audio = form.get("audio");
  if (!(audio instanceof File) || audio.size < 100) {
    return Response.json({ error: "Ses bulunamadı." }, { status: 400 });
  }

  const groq = new Groq({ apiKey: groqKey });
  const result = await groq.audio.transcriptions.create({
    file: audio,
    model: "whisper-large-v3",
    language: "tr",
  });

  return Response.json({ text: result.text.trim() });
}
