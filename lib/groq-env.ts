export function getGroqApiKey() {
  const raw =
    process.env["GROQ_API_KEY"] ??
    process.env["GROQ_KEY"] ??
    process.env["GROQ_SECRET"] ??
    "";
  const key = raw.trim().replace(/^["']+|["']+$/g, "");
  return key.length > 0 ? key : null;
}

export function groqMissingMessage() {
  if (process.env.VERCEL) {
    return "Groq anahtarı bu yayında yok. Vercel → Settings → Environment Variables → adı tam GROQ_API_KEY, ortam Production, sonra Redeploy.";
  }
  return "Groq anahtarı yok. Proje klasöründeki .env dosyasına GROQ_API_KEY=gsk_... yaz (tırnak şart değil) ve npm run dev’i yeniden başlat.";
}
