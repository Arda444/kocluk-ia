if (process.env.VERCEL) {
  process.env.AUTH_TRUST_HOST ??= "true";
  const authUrl = process.env.AUTH_URL ?? "";
  if (!authUrl || authUrl.includes("localhost")) {
    const host =
      process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
    if (host) {
      process.env.AUTH_URL = host.startsWith("http") ? host : `https://${host}`;
    }
  }
}
