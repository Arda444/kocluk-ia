export function stopSpeaking() {
  if (typeof window === "undefined") return;
  window.speechSynthesis?.cancel();
}

export function speakText(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const clean = text
    .replace(/[#*_`>]/g, "")
    .replace(/\n{2,}/g, ". ")
    .slice(0, 1200);
  if (!clean.trim()) return;
  stopSpeaking();
  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.lang = "tr-TR";
  utterance.rate = 1.02;
  const voices = window.speechSynthesis.getVoices();
  const turkish =
    voices.find((voice) => voice.lang.toLowerCase().startsWith("tr")) ??
    voices.find((voice) => /emre|emel|tolga|yelda|turkish/i.test(voice.name));
  if (turkish) utterance.voice = turkish;
  window.speechSynthesis.speak(utterance);
}
