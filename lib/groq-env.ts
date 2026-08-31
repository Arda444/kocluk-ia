import { readEnv } from "@/lib/env-value";

export function getGroqApiKey() {
  const key = readEnv("GROQ_API_KEY", "GROQ_KEY", "GROQ_SECRET");
  return key.length > 0 ? key : null;
}

export function groqMissingMessage() {
  return "Koç şu an yanıt veremiyor. Biraz sonra tekrar dene.";
}

export function groqErrorText(error: unknown) {
  const record = error as { message?: string; error?: { message?: string } };
  return record?.error?.message || record?.message || String(error);
}

export function groqErrorMessage(error: unknown) {
  const message = groqErrorText(error);
  if (/rate.?limit|429|quota|TPM|tokens per minute|too large for model/i.test(message)) {
    return "Şu an yoğunluk var. Bir dakika sonra tekrar dene.";
  }
  return "Yanıt oluşturulamadı. Lütfen tekrar dene.";
}

export function isGroqOversize(error: unknown) {
  return /too large for model|reduce your message size/i.test(groqErrorText(error));
}

export function isGroqRateLimit(error: unknown) {
  const status = (error as { status?: number }).status;
  const message = groqErrorText(error);
  return status === 429 || status === 413 || /rate.?limit|TPM|tokens per minute/i.test(message);
}

export function groqRetryWaitMs(error: unknown) {
  const match = groqErrorText(error).match(/try again in ([\d.]+)\s*s/i);
  if (!match) return 1600;
  return Math.min(8000, Math.ceil(Number(match[1]) * 1000) + 250);
}
