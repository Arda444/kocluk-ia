import { readEnv } from "@/lib/env-value";

export function getGroqApiKey() {
  const key = readEnv("GROQ_API_KEY", "GROQ_KEY", "GROQ_SECRET");
  return key.length > 0 ? key : null;
}

export function groqMissingMessage() {
  if (process.env.VERCEL) {
    return "Groq anahtarı bu yayında yok. Vercel → Settings → Environment Variables → adı tam GROQ_API_KEY, ortam Production, sonra Redeploy.";
  }
  return "Groq anahtarı yok. Proje klasöründeki .env dosyasına GROQ_API_KEY=gsk_... yaz (tırnak şart değil) ve npm run dev’i yeniden başlat.";
}

export function groqErrorMessage(error: unknown) {
  const record = error as { message?: string; error?: { message?: string } };
  const message = record?.error?.message || record?.message || String(error);
  if (/api key|invalid|unauthorized|401/i.test(message)) {
    return "Groq anahtarı geçersiz. Vercel’deki GROQ_API_KEY değerini kontrol et ve Redeploy yap.";
  }
  if (/rate|429|quota|limit/i.test(message)) {
    return "Groq limiti doldu. Bir dakika sonra tekrar dene.";
  }
  return `Koç yanıt veremedi: ${message.slice(0, 180)}`;
}
