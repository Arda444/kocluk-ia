let resumeTimer: number | undefined;

function voicesReady(): Promise<SpeechSynthesisVoice[]> {
  const synth = window.speechSynthesis;
  const now = synth.getVoices();
  if (now.length) return Promise.resolve(now);
  return new Promise((resolve) => {
    const finish = () => resolve(synth.getVoices());
    synth.addEventListener("voiceschanged", finish, { once: true });
    window.setTimeout(finish, 600);
  });
}

export function stopSpeaking() {
  if (typeof window === "undefined") return;
  if (resumeTimer) {
    window.clearInterval(resumeTimer);
    resumeTimer = undefined;
  }
  window.speechSynthesis?.cancel();
}

export function primeSpeech() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.resume();
    const ping = new SpeechSynthesisUtterance(" ");
    ping.volume = 0;
    ping.lang = "tr-TR";
    window.speechSynthesis.speak(ping);
  } catch {
    // iOS may ignore the silent ping; real utterance still follows.
  }
}

export function speakableText(raw: string) {
  const hasTable = raw.includes("|");
  const text = raw
    .replace(/:::plan[\s\S]*?:::/gi, "")
    .replace(/```[\s\S]*?```/g, "")
    .split("\n")
    .filter((line) => !line.includes("|") && !/^[-:\s]+$/.test(line))
    .join(". ")
    .replace(/[#*_`>▸]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const clipped = text.slice(0, 900);
  if (hasTable && clipped) return `${clipped}. Ayrıntılar ekranda.`;
  return clipped;
}

export async function speakText(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const clean = speakableText(text);
  if (!clean) return;

  stopSpeaking();
  window.speechSynthesis.resume();

  const voices = await voicesReady();
  const turkish =
    voices.find((voice) => voice.lang.toLowerCase().startsWith("tr")) ??
    voices.find((voice) => /emre|emel|tolga|yelda|yuri|turkish|türk/i.test(voice.name));

  const chunks = clean.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((part) => part.trim()).filter(Boolean) ?? [clean];
  for (const chunk of chunks.slice(0, 8)) {
    const utterance = new SpeechSynthesisUtterance(chunk);
    utterance.lang = "tr-TR";
    utterance.rate = 1.02;
    if (turkish) utterance.voice = turkish;
    window.speechSynthesis.speak(utterance);
  }

  resumeTimer = window.setInterval(() => {
    if (window.speechSynthesis.speaking && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    if (!window.speechSynthesis.speaking) {
      if (resumeTimer) window.clearInterval(resumeTimer);
      resumeTimer = undefined;
    }
  }, 4000);
}
