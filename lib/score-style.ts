export const SCORE = {
  correct: {
    label: "Doğru",
    letter: "D",
    chip: "text-correct",
    bar: "bg-correct",
    shell: "border-correct/40 bg-correct/10",
    letterClass: "text-correct",
    input:
      "score-input h-9 w-11 rounded-md bg-black/30 text-center text-base font-semibold tabular-nums text-correct outline-none placeholder:text-correct/50",
  },
  wrong: {
    label: "Yanlış",
    letter: "Y",
    chip: "text-wrong",
    bar: "bg-wrong",
    shell: "border-wrong/40 bg-wrong/10",
    letterClass: "text-wrong",
    input:
      "score-input h-9 w-11 rounded-md bg-black/30 text-center text-base font-semibold tabular-nums text-wrong outline-none placeholder:text-wrong/50",
  },
  blank: {
    label: "Boş",
    letter: "B",
    chip: "text-blank",
    bar: "bg-blank",
    shell: "border-blank/40 bg-blank/10",
    letterClass: "text-blank",
    input:
      "score-input h-9 w-11 rounded-md bg-black/30 text-center text-base font-semibold tabular-nums text-blank outline-none placeholder:text-blank/60",
  },
} as const;
