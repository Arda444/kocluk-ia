import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col items-center justify-center px-6 text-center">
      <p className="text-xs font-semibold tracking-[0.2em] text-accent">Sınav Koçu</p>
      <h1 className="mt-4 font-serif text-4xl">Sayfa yok</h1>
      <p className="mt-3 text-muted">Bu adres bulunamadı. Ana sayfaya veya sohbete dön.</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-7 text-sm font-semibold text-white"
        >
          Ana sayfa
        </Link>
        <Link
          href="/program"
          className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 px-7 text-sm"
        >
          Panel
        </Link>
      </div>
    </main>
  );
}
