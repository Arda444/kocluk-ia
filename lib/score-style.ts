export const SCORE = {
  correct: {
    label: "Doğru",
    input:
      "h-8 w-12 rounded-lg border border-correct/50 bg-correct/10 px-1 text-center text-sm text-correct placeholder:text-correct/60",
    stack:
      "mt-1 h-11 w-full min-w-0 rounded-xl border border-correct/50 bg-correct/10 px-2 text-center text-base text-correct placeholder:text-correct/60",
    chip: "text-correct",
    bar: "bg-correct",
  },
  wrong: {
    label: "Yanlış",
    input:
      "h-8 w-12 rounded-lg border border-wrong/50 bg-wrong/10 px-1 text-center text-sm text-wrong placeholder:text-wrong/60",
    stack:
      "mt-1 h-11 w-full min-w-0 rounded-xl border border-wrong/50 bg-wrong/10 px-2 text-center text-base text-wrong placeholder:text-wrong/60",
    chip: "text-wrong",
    bar: "bg-wrong",
  },
  blank: {
    label: "Boş",
    input:
      "h-8 w-12 rounded-lg border border-blank/50 bg-blank/10 px-1 text-center text-sm text-blank placeholder:text-blank/70",
    stack:
      "mt-1 h-11 w-full min-w-0 rounded-xl border border-blank/50 bg-blank/10 px-2 text-center text-base text-blank placeholder:text-blank/70",
    chip: "text-blank",
    bar: "bg-blank",
  },
} as const;
