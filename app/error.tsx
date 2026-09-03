"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col items-center justify-center px-6 text-center">
      <p className="text-xs font-semibold tracking-[0.2em] text-accent">ALL STAR TYT</p>
      <h1 className="mt-4 font-serif text-4xl">Sayfa yüklenemedi</h1>
      <p className="mt-3 text-muted">Bir şey ters gitti. Sayfayı yenile.</p>
      <div className="mt-8">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-7 text-sm font-semibold text-white"
        >
          Yenile
        </button>
      </div>
    </main>
  );
}
