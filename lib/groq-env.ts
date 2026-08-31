import { readEnv } from "@/lib/env-value";

export function getGroqApiKey() {
  const key = readEnv("GROQ_API_KEY", "GROQ_KEY", "GROQ_SECRET");
  return key.length > 0 ? key : null;
}

export function groqMissingMessage() {
  return "Koç şu an yanıt veremiyor. Biraz sonra tekrar dene.";
}

export function groqErrorMessage(error: unknown) {
  const record = error as { message?: string; error?: { message?: string } };
  const message = record?.error?.message || record?.message || String(error);
  if (/rate|429|quota|limit/i.test(message)) {
    return "Şu an yoğunluk var. Bir dakika sonra tekrar dene.";
  }
  return "Yanıt oluşturulamadı. Lütfen tekrar dene.";
}
