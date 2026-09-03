"use client";

import { createTodoAction, deleteTodoAction, toggleTodoAction } from "@/app/actions";

export type TodoItemView = {
  id: string;
  title: string;
  done: boolean;
};

export function TodoBoard({ todos }: { todos: TodoItemView[] }) {
  const open = todos.filter((item) => !item.done);
  const done = todos.filter((item) => item.done);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <header className="border-b border-white/10 px-4 py-4 md:px-6">
        <p className="text-xs font-medium tracking-[0.16em] text-accent">TO-DO</p>
        <h1 className="font-serif text-3xl">Yapılacaklar</h1>
        <p className="mt-1 text-sm text-muted">
          All Star programının dışında küçük işler: {open.length} açık · {done.length} bitti
        </p>
      </header>

      <div className="mx-auto w-full max-w-2xl p-4 md:p-6">
        <form action={createTodoAction} className="mb-6 flex gap-2">
          <input
            name="title"
            required
            maxLength={140}
            placeholder="Yanlış defterini düzenle, 20 paragraf…"
            className="h-12 min-w-0 flex-1 rounded-2xl border border-white/10 bg-[#12163a] px-4 text-sm"
          />
          <button type="submit" className="h-12 rounded-full bg-accent px-5 text-sm font-semibold text-white">
            Ekle
          </button>
        </form>

        {todos.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-white/15 px-6 py-16 text-center text-sm text-muted">
            Liste boş. Program dışı işleri buraya yaz.
          </p>
        ) : (
          <div className="space-y-6">
            <section>
              <h2 className="mb-2 text-xs font-medium tracking-[0.14em] text-muted">AÇIK</h2>
              <ul className="space-y-2">
                {open.length === 0 ? (
                  <li className="text-sm text-muted">Açık iş yok.</li>
                ) : (
                  open.map((item) => <TodoRow key={item.id} item={item} />)
                )}
              </ul>
            </section>
            {done.length > 0 ? (
              <section>
                <h2 className="mb-2 text-xs font-medium tracking-[0.14em] text-muted">BİTTİ</h2>
                <ul className="space-y-2">
                  {done.map((item) => (
                    <TodoRow key={item.id} item={item} />
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

function TodoRow({ item }: { item: TodoItemView }) {
  return (
    <li className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#12163a]/80 px-3 py-3">
      <form action={toggleTodoAction.bind(null, item.id)}>
        <button
          type="submit"
          className={`h-5 w-5 rounded-md border ${item.done ? "border-correct bg-correct" : "border-white/30"}`}
          aria-label={item.done ? "Geri al" : "Tamamla"}
        />
      </form>
      <p className={`min-w-0 flex-1 text-sm ${item.done ? "text-muted line-through" : ""}`}>{item.title}</p>
      <form action={deleteTodoAction.bind(null, item.id)}>
        <button type="submit" className="text-xs text-muted hover:text-wrong">
          Sil
        </button>
      </form>
    </li>
  );
}
