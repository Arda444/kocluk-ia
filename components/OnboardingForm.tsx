"use client";

import { useActionState, useState } from "react";
import { saveProfileAction, type ActionState } from "@/app/actions";
import { EXAM_TYPES, GRADES, TRACKS } from "@/lib/labels";

type Props = {
  defaultName: string;
  initial?: {
    displayName: string;
    examType: string;
    grade: string;
    track: string | null;
    dailyHours: number;
    target: string;
    weakSubjects: string;
  };
};

export function OnboardingForm({ defaultName, initial }: Props) {
  const [examType, setExamType] = useState(initial?.examType ?? "YKS");
  const [state, action, pending] = useActionState<ActionState, FormData>(
    saveProfileAction,
    undefined,
  );

  return (
    <form action={action} className="grid gap-4">
      <label className="grid gap-1.5 text-sm">
        <span className="font-medium text-slate-200">Adın</span>
        <input
          name="displayName"
          required
          defaultValue={initial?.displayName ?? defaultName}
          className="h-11 rounded-xl border border-white/10 bg-white/5 px-3 outline-none ring-amber-400/40 focus:ring-2"
        />
      </label>

      <label className="grid gap-1.5 text-sm">
        <span className="font-medium text-slate-200">Hangi sınava hazırlanıyorsun?</span>
        <select
          name="examType"
          value={examType}
          onChange={(event) => setExamType(event.target.value)}
          className="h-11 rounded-xl border border-white/10 bg-[#141b2d] px-3 outline-none ring-amber-400/40 focus:ring-2"
        >
          {EXAM_TYPES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-1.5 text-sm">
        <span className="font-medium text-slate-200">Kaçıncı sınıfsın?</span>
        <select
          name="grade"
          defaultValue={initial?.grade ?? "12"}
          className="h-11 rounded-xl border border-white/10 bg-[#141b2d] px-3 outline-none ring-amber-400/40 focus:ring-2"
        >
          {GRADES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>

      {examType === "YKS" ? (
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium text-slate-200">Sayısal mısın, sözel mi?</span>
          <select
            name="track"
            defaultValue={initial?.track ?? "sayisal"}
            className="h-11 rounded-xl border border-white/10 bg-[#141b2d] px-3 outline-none ring-amber-400/40 focus:ring-2"
          >
            {TRACKS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <label className="grid gap-1.5 text-sm">
        <span className="font-medium text-slate-200">Günde kaç saat çalışmak istiyorsun?</span>
        <input
          name="dailyHours"
          type="number"
          min={0.5}
          max={16}
          step={0.5}
          required
          defaultValue={initial?.dailyHours ?? 3}
          className="h-11 rounded-xl border border-white/10 bg-white/5 px-3 outline-none ring-amber-400/40 focus:ring-2"
        />
      </label>

      <label className="grid gap-1.5 text-sm">
        <span className="font-medium text-slate-200">Hedefin (okul / bölüm / lise)</span>
        <input
          name="target"
          required
          defaultValue={initial?.target}
          placeholder="Örn. Boğaziçi Bilgisayar veya fen lisesi"
          className="h-11 rounded-xl border border-white/10 bg-white/5 px-3 outline-none ring-amber-400/40 focus:ring-2"
        />
      </label>

      <label className="grid gap-1.5 text-sm">
        <span className="font-medium text-slate-200">En zorlandığın ders(ler)</span>
        <input
          name="weakSubjects"
          required
          defaultValue={initial?.weakSubjects}
          placeholder="Örn. geometri ve fizik"
          className="h-11 rounded-xl border border-white/10 bg-white/5 px-3 outline-none ring-amber-400/40 focus:ring-2"
        />
      </label>

      {state?.error ? (
        <p className="rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-200">{state.error}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="h-11 rounded-xl bg-amber-400 font-semibold text-slate-950 transition hover:bg-amber-300 disabled:opacity-60"
      >
        {pending ? "Kaydediliyor…" : "Koça başla"}
      </button>
    </form>
  );
}
