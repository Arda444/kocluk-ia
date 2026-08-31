"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useActionState } from "react";
import { saveProfileAction, type ActionState } from "@/app/actions";
import { EXAM_TYPES, GRADES, PLATFORMS, TRACKS } from "@/lib/labels";

type ProfileSeed = {
  displayName: string;
  examType: string;
  grade: string;
  track: string | null;
  platform: string;
  platformNote: string;
  dailyHours: number;
  target: string;
  weakSubjects: string;
};

const STEPS = [
  { id: "name", title: "Sana nasıl hitap edeyim?", image: "/onboarding/name.png" },
  { id: "exam", title: "Hangi sınava hazırlanıyorsun?", image: "/onboarding/exam.png" },
  { id: "grade", title: "Kaçıncı sınıfsın?", image: "/onboarding/grade.png" },
  { id: "track", title: "Sayısal mısın, sözel mi?", image: "/onboarding/track.png" },
  { id: "platform", title: "Sınava hangi platformdan hazırlanıyorsun?", image: "/onboarding/platform.png" },
  { id: "hours", title: "Günde kaç saat çalışmak istiyorsun?", image: "/onboarding/hours.png" },
  { id: "target", title: "Hedef üniversite veya lise var mı?", image: "/onboarding/target.png" },
  { id: "weak", title: "En çok nerede takılıyorsun?", image: "/onboarding/weak.png" },
] as const;

export function OnboardingWizard({
  defaultName,
  initial,
}: {
  defaultName: string;
  initial?: ProfileSeed;
}) {
  const [examType, setExamType] = useState(initial?.examType ?? "YKS");
  const [platform, setPlatform] = useState(initial?.platform ?? "youtube");
  const [values, setValues] = useState({
    displayName: initial?.displayName || defaultName,
    examType: initial?.examType ?? "YKS",
    grade: initial?.grade ?? "12",
    track: initial?.track ?? "sayisal",
    platform: initial?.platform ?? "youtube",
    platformNote: initial?.platformNote ?? "",
    dailyHours: String(initial?.dailyHours ?? 3),
    target: initial?.target ?? "",
    weakSubjects: initial?.weakSubjects ?? "",
  });
  const [step, setStep] = useState(0);
  const [state, action, pending] = useActionState<ActionState, FormData>(
    saveProfileAction,
    undefined,
  );

  const visibleSteps = useMemo(
    () => STEPS.filter((item) => !(item.id === "track" && examType !== "YKS")),
    [examType],
  );
  const current = visibleSteps[step] ?? visibleSteps[0];
  const last = step === visibleSteps.length - 1;

  useEffect(() => {
    if (step >= visibleSteps.length) {
      setStep(Math.max(0, visibleSteps.length - 1));
    }
  }, [step, visibleSteps.length]);

  function setField(name: string, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (name === "examType") setExamType(value);
    if (name === "platform") setPlatform(value);
  }

  function next() {
    if (current.id === "name" && values.displayName.trim().length < 2) return;
    if (current.id === "weak" && values.weakSubjects.trim().length < 2) return;
    if (current.id === "platform" && platform === "other" && !values.platformNote.trim()) return;
    setStep((value) => Math.min(value + 1, visibleSteps.length - 1));
  }

  return (
    <div className="mx-auto w-full max-w-lg px-5 py-10">
      {initial ? (
        <a href="/chat" className="text-xs text-accent">
          ← Panele dön
        </a>
      ) : null}
      <p className="text-xs font-semibold tracking-[0.2em] text-accent">
        {step + 1} / {visibleSteps.length}
      </p>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full bg-accent transition-all"
          style={{ width: `${((step + 1) / visibleSteps.length) * 100}%` }}
        />
      </div>

      <div className="mt-8 flex justify-center">
        <Image
          src={current.image}
          alt=""
          width={220}
          height={220}
          className="h-40 w-40 rounded-3xl object-cover ring-1 ring-white/10 sm:h-52 sm:w-52"
        />
      </div>
      <h1 className="mt-8 font-serif text-3xl leading-tight text-balance">{current.title}</h1>

      <div className="mt-6">
        {current.id === "name" ? (
          <input
            value={values.displayName}
            onChange={(event) => setField("displayName", event.target.value)}
            placeholder="Adın"
            className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 outline-none ring-accent/40 focus:ring-2"
          />
        ) : null}

        {current.id === "exam" ? (
          <div className="grid gap-2">
            {EXAM_TYPES.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setField("examType", item.value)}
                className={`rounded-2xl border px-4 py-3 text-left ${
                  values.examType === item.value
                    ? "border-accent bg-accent/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        ) : null}

        {current.id === "grade" ? (
          <div className="grid grid-cols-2 gap-2">
            {GRADES.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setField("grade", item.value)}
                className={`rounded-2xl border px-3 py-3 text-sm ${
                  values.grade === item.value
                    ? "border-accent bg-accent/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        ) : null}

        {current.id === "track" ? (
          <div className="grid gap-2">
            {TRACKS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setField("track", item.value)}
                className={`rounded-2xl border px-4 py-3 text-left ${
                  values.track === item.value
                    ? "border-accent bg-accent/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        ) : null}

        {current.id === "platform" ? (
          <div className="grid gap-2">
            {PLATFORMS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setField("platform", item.value)}
                className={`rounded-2xl border px-4 py-3 text-left ${
                  values.platform === item.value
                    ? "border-accent bg-accent/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <span className="block font-medium">{item.label}</span>
                <span className="text-xs text-muted">{item.hint}</span>
              </button>
            ))}
            {platform === "other" ? (
              <input
                value={values.platformNote}
                onChange={(event) => setField("platformNote", event.target.value)}
                placeholder="Örn. Apotemi + kendi PDF’in"
                className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 outline-none ring-accent/40 focus:ring-2"
              />
            ) : null}
          </div>
        ) : null}

        {current.id === "hours" ? (
          <div>
            <input
              type="range"
              min={0.5}
              max={10}
              step={0.5}
              value={values.dailyHours}
              onChange={(event) => setField("dailyHours", event.target.value)}
              className="w-full accent-[#7cffb2]"
            />
            <p className="mt-3 font-serif text-4xl text-accent">{values.dailyHours} saat</p>
          </div>
        ) : null}

        {current.id === "target" ? (
          <div>
            <input
              value={values.target}
              onChange={(event) => setField("target", event.target.value)}
              placeholder="Örn. ODTÜ Bilgisayar — boş bırakabilirsin"
              className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 outline-none ring-accent/40 focus:ring-2"
            />
            <p className="mt-3 text-sm text-muted">Zorunlu değil. Atlayabilirsin.</p>
          </div>
        ) : null}

        {current.id === "weak" ? (
          <input
            value={values.weakSubjects}
            onChange={(event) => setField("weakSubjects", event.target.value)}
            placeholder="Örn. geometri ve fizik"
            className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 outline-none ring-accent/40 focus:ring-2"
          />
        ) : null}
      </div>

      {state?.error ? (
        <p className="mt-4 rounded-xl bg-red-500/15 px-3 py-2 text-sm text-red-200">{state.error}</p>
      ) : null}

      <div className="mt-8 flex gap-3">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep((value) => value - 1)}
            className="h-12 flex-1 rounded-2xl border border-white/15"
          >
            Geri
          </button>
        ) : null}

        {last ? (
          <form action={action} className="flex-1">
            <input type="hidden" name="displayName" value={values.displayName} />
            <input type="hidden" name="examType" value={values.examType} />
            <input type="hidden" name="grade" value={values.grade} />
            <input type="hidden" name="track" value={values.track} />
            <input type="hidden" name="platform" value={values.platform} />
            <input type="hidden" name="platformNote" value={values.platformNote} />
            <input type="hidden" name="dailyHours" value={values.dailyHours} />
            <input type="hidden" name="target" value={values.target} />
            <input type="hidden" name="weakSubjects" value={values.weakSubjects} />
            <button
              type="submit"
              disabled={pending}
              className="h-12 w-full rounded-2xl bg-accent font-semibold text-black disabled:opacity-60"
            >
              {pending ? "Kaydediliyor…" : "Koça bağlan"}
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={next}
            className="h-12 flex-1 rounded-2xl bg-accent font-semibold text-black"
          >
            {current.id === "target" && !values.target.trim() ? "Atla" : "İleri"}
          </button>
        )}
      </div>
    </div>
  );
}
