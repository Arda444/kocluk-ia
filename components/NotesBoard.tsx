"use client";

import { createStickyNoteAction, deleteStickyNoteAction, updateStickyNoteAction } from "@/app/actions";

const COLORS = [
  { id: "yellow", label: "Sarı", className: "bg-[#ffe56d] text-[#3d3208]" },
  { id: "pink", label: "Pembe", className: "bg-[#ffb4c8] text-[#4a1730]" },
  { id: "mint", label: "Mint", className: "bg-[#b8f0c8] text-[#16351f]" },
  { id: "blue", label: "Mavi", className: "bg-[#b7dcff] text-[#16324a]" },
  { id: "lavender", label: "Mor", className: "bg-[#dcc4ff] text-[#2d1a4a]" },
] as const;

export type StickyNoteItem = {
  id: string;
  body: string;
  color: string;
  createdAt: string;
};

export function NotesBoard({ notes }: { notes: StickyNoteItem[] }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <header className="border-b border-white/10 px-4 py-4 md:px-6">
        <p className="text-xs font-medium tracking-[0.16em] text-accent">NOTLAR</p>
        <h1 className="font-serif text-3xl">Post-it tahtası</h1>
        <p className="mt-1 text-sm text-muted">Hatırlatma, formül, net hedef — yapışkan not gibi tut.</p>
      </header>

      <div className="p-4 md:p-6">
        <form
          action={createStickyNoteAction}
          className="mb-6 flex flex-col gap-3 rounded-[1.5rem] border border-white/10 bg-[#12163a]/80 p-4 md:flex-row md:items-end"
        >
          <label className="min-w-0 flex-1 text-sm">
            Yeni not
            <textarea
              name="body"
              required
              rows={3}
              maxLength={400}
              placeholder="Yarın geometri yanlış defteri…"
              className="mt-2 w-full rounded-xl border border-white/10 bg-[#0a102c] px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm">
            Renk
            <select name="color" defaultValue="yellow" className="mt-2 h-11 rounded-xl border border-white/10 bg-[#0a102c] px-3">
              {COLORS.map((color) => (
                <option key={color.id} value={color.id}>
                  {color.label}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="h-11 rounded-full bg-accent px-6 text-sm font-semibold text-white">
            Yapıştır
          </button>
        </form>

        {notes.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-white/15 px-6 py-16 text-center text-sm text-muted">
            Tahta boş. İlk post-it’i yapıştır.
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {notes.map((note) => {
              const palette = COLORS.find((item) => item.id === note.color) ?? COLORS[0];
              return (
                <li key={note.id}>
                  <article className={`relative min-h-[12rem] rounded-xl p-4 shadow-[6px_10px_24px_rgba(0,0,0,0.35)] ${palette.className}`}>
                    <span className="absolute top-0 left-1/2 h-4 w-16 -translate-x-1/2 -translate-y-1 rounded-sm bg-white/35" />
                    <form action={updateStickyNoteAction}>
                      <input type="hidden" name="id" value={note.id} />
                      <textarea
                        name="body"
                        defaultValue={note.body}
                        maxLength={400}
                        className="h-36 w-full resize-none bg-transparent text-sm leading-6 outline-none"
                      />
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <button type="submit" className="text-xs font-semibold underline-offset-2 hover:underline">
                          Kaydet
                        </button>
                        <button
                          type="submit"
                          formAction={deleteStickyNoteAction.bind(null, note.id)}
                          className="text-xs opacity-70 hover:opacity-100"
                        >
                          Kopar
                        </button>
                      </div>
                    </form>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
