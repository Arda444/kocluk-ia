# Sınav Koçu

LGS ve YKS hazırlık koçu. Kayıt/giriş, tanışma soruları (sınıf, alan, günlük süre), kalıcı sohbet geçmişi. Ücretsiz: Groq + SQLite (yerel) / Turso (canlı) + Vercel.

## Yerel kurulum

1. [Groq](https://console.groq.com) hesabı aç, API key al.
2. Bağımlılıklar ve veritabanı:

```bash
npm install
copy .env.example .env
```

`.env` içinde `GROQ_API_KEY` ve `AUTH_SECRET` doldur (`openssl rand -hex 32`).

```bash
npx prisma migrate dev --name init
npm run dev
```

Tarayıcı: http://localhost:3000

## Canlı yayın

GitHub Pages kullanılmaz (sunucu + veritabanı gerekir).

- Repo: yalnızca [github.com/Arda444](https://github.com/Arda444)
- Hosting: Vercel
- Veritabanı: Turso

Vercel ortam değişkenleri: `DATABASE_URL` (şema için `file:./dev.db` kalabilir), `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `GROQ_API_KEY`, `AUTH_SECRET`, `AUTH_URL`.

Turso şeması: `npm run db:turso` (Turso env doluyken).
