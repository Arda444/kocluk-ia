import { createConversationAction } from "@/app/actions";

export default function ChatIndexPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-semibold">Hazırsan yeni bir sohbet aç</h1>
      <p className="mt-2 max-w-md text-slate-400">
        Koç, tanışma cevaplarına göre plan, süre ve deneme stratejisi önerir. Eski sohbetlerin solda durur.
      </p>
      <form action={createConversationAction} className="mt-6">
        <button
          type="submit"
          className="h-11 rounded-xl bg-amber-400 px-6 font-semibold text-slate-950 transition hover:bg-amber-300"
        >
          Yeni sohbet başlat
        </button>
      </form>
    </div>
  );
}
