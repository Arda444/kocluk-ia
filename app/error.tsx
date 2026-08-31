"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {

  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col items-center justify-center px-6 text-center">
      <p className="text-xs font-semibold tracking-[0.2em] text-accent">Sınav Koçu</p>
      <h1 className="mt-4 font-serif text-4xl">Sayfa yüklenemedi</h1>
      <p className="mt-3 text-muted">
        Sunucu hatası. Çoğu zaman eski oturum + boş veritabanı döngüsüdür. Çıkış yapıp canlı siteden kayıt ol.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-7 text-sm font-semibold text-black"
        >
          Yenile
        </button>
        <a
          href="/logout"
          className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 px-7 text-sm"
        >
          Çıkış yap
        </a>
      </div>
    </main>
  );
}
