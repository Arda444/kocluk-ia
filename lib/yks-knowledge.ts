import type { CoachProfile } from "@/lib/prompt";
import { normalizePlatform, PLATFORM_PLAYBOOK } from "@/lib/labels";

const CORE = `
# ÖSYM / YKS çekirdek (Türkiye)
YKS üç oturum: TYT (zorunlu temel) + AYT (alan) + isteğe YDT (dil).
Puan türleri: SAY, EA, SÖZ, DİL. Yerleştirme bu puan + OBP ile yapılır.
Net = doğru − (yanlış / 4). 4 yanlış 1 doğruyu götürür. Boş, neti düşürmez.
Ham puan netlerden üretilir. Yerleştirme puanına OBP eklenir.
OBP ≈ diploma notu × 5 (100'lük not → 500). Katkı genelde OBP × 0,12 (yaklaşık max 60).
Aynı liseyi tekrar yazanlarda OBP kırılabilir (yıl kılavuzuna bak).
Kesin baraj, katsayı, oturum tarihi ve tercih takvimi her yıl ÖSYM kılavuzunda değişir.
Sayı verirken "bu yılın kılavuzuna bak, aralık şudur" de. Ezber baraj / taban puan uydurma.
Güncel tercih ve taban için YÖK Atlas + ÖSYM tercih kılavuzu. 2023-2024-2025 rakamını 2026'ya kopyalama.

## TYT (temel yeterlilik)
Süre ~135 dk, 120 soru:
- Türkçe 40
- Sosyal Bilimler 20 (Tarih 5, Coğrafya 5, Felsefe 5, Din Kültürü veya ek felsefe 5)
- Temel Matematik 40 (mat + geometri karışık)
- Fen Bilimleri 20 (Fizik 7, Kimya 7, Biyoloji 6)
TYT tüm lisans puanlarına girer (ağırlık kabaca %40). TYT zayıfsa AYT ne kadar iyi olursa olsun yerleşme zorlaşır.
Süre: soru başına ~67 sn. Türkçe+mat = 80 soru; burası puanın omurgası.
Strateji: önce güçlü olduğun test, sonra Türkçe/mat. Takıldığın soruyu işaretle, dön.
Fen/sosyal: hız + eleme. Bilmiyorsan boş bırakmak bazen neti korur.
TYT geometriyi "sonra" diye erteleme; 8-12 soru buradan gelir.

## AYT (alan yeterliliği)
Süre ~180 dk. Testler 40'ar soru; öğrenci alanına göre test seçer, hepsini çözmez.
- Matematik 40 (işlem + geometri)
- Fen Bilimleri 40 (Fizik 14, Kimya 13, Biyoloji 13)
- Edebiyat-Sosyal 1: Edebiyat ~24, Tarih-1 ~10, Coğrafya-1 ~6
- Sosyal 2: Tarih-2, Coğrafya-2, Felsefe grubu, Din
SAY: Mat + Fen. EA: Mat + Edebiyat-Sosyal 1. SÖZ: Edebiyat-Sosyal 1 + Sosyal 2. DİL: asıl YDT.
Yerleştirmede AYT ağırlığı kabaca %60. Konu bitmeden her gün AYT genel deneme yok.

## YDT
~80 soru, ~120 dk. Dil puanının asıl parçası. Kelime + paragraf + dilbilgisi + cloze.
Günlük input şart (okuma + dinleme). TYT Türkçe destekler; AYT'ye sapma.

## Tercih ve yerleştirme
Önce puan türün, sonra bölüm, sonra şehir. "Puanım yetti yazayım" tuzak.
Tercih listesi 24'e kadar; sıralı gerçekçi (hayal / hedef / güvence).
Vakıfta burs dilimi (%100 / %50 / %25 / ücretsiz) tabanı tamamen değiştirir.
Açıköğretim / 2 yıllık / yatay geçiş ayrı konuş; lisans hedefiyle karıştırma.
Devlet yurt (KYK), ücret, şehir maliyeti tercihi etkiler — yalnız prestij konuşma.
Özel yetenek (konservatuvar, spor, resim) YKS puanından ayrı sınav ister.

# LGS (liseye geçiş)
8. sınıf, tek oturum. Sözel: Türkçe, T.C. İnkılap, Din, İngilizce. Sayısal: Mat, Fen.
Soru/süre MEB kılavuzuna bak. Puan + yüzdelik dilim. Yerel yerleştirme (adres, kayıt alanı, okul kontenjanı) kritik.
Fen lisesi / Anadolu için sayısal net + Türkçe. "Sadece mat" yetmez.
LGS'te tutarlı deneme + yanlış analizi; son ay yeni kaynak açma.

# Çalışma sistemi (varsayılan koçluk)
- Blok: 40-50 dk iş + 8-10 dk mola. Günde 3-6 kaliteli blok. 8 saat masada oturmak ≠ çalışma.
- Anlatım ≤ %30, soru ≥ %70. Video izlemek çalışma sayılmaz; çıktı soru / net / yanlış defteri.
- Aktif hatırlama: kapat-söyle, boş kâğıda yaz, kart. Pasif vurgulama işe yaramaz.
- Aralıklı tekrar: 1-3-7-21 gün. Ezber dersinde (tarih, biyoterim, kelime) şart.
- Karıştırarak çalış (interleaving): aynı gün mat+fizik, tek derse 4 saat gömülme.
- Yanlış defteri 4 kolon: soru / neden (bilgi, dikkatsizlik, süre, şık tuzağı) / doğru fikir / benzer 3 soru.
- Deneme: konu bitmeden her gün 3 saat deneme yok. Konu oturunca haftada 1 TYT + 1 AYT branş.
  Son 8-10 hafta: 2-3 deneme/hafta, aynı gün analiz, ertesi gün o konudan 20-30 soru.
- Deneme saati gerçek sınav saati gibi (TYT sabah). Telefon başka oda.
- Uyku 7+ saat. Gece 03:00 mesaisi net düşürür. Kafein'i deneme gününde ilk kez deneme.
- Telefon: blokta başka oda. "Müzikle çalışırım" iddiasını ölç: 2 gün sessiz vs müzik, net karşılaştır.

# Sınıfa göre faz
- 7: LGS alışkanlık, Türkçe paragraf + mat problem temeli.
- 8: LGS tam gaz. İlkbahar deneme, son 3 hafta yeni konu yok.
- 9-10: TYT temel + çalışma alışkanlığı. AYT'ye erken sapma. Geometri ve Türkçe her yıl.
- 11: TYT'yi ayakta tut, AYT'ye gir. Yaz tatili: eksik TYT kapat, AYT'ye 1-2 konu.
- 12 sonbahar: konu bitirme. Kış: soru bankası + branş deneme. İlkbahar: genel deneme + analiz.
  Son 3 hafta: yeni konu yok, form, uyku, kolay net kaçırmama.
- Mezun: ego değil teşhis. İlk 2 hafta deneme + eksik haritası, sonra agresif kapatma. "Ben bunu biliyorum" yalanını netle yakala.

# Sınav günü
Uyku önceki gece. Kahvaltı denediğin şey. Kimlik + sınav girişi. Erken çık.
İlk 10 soruda panik olursa atla, dön. Yanındakine bakma, mola sohbetinde soru tartışma.
Süre: TYT'de Türkçe/mat'a yığıl, son 15 dk işaretlenmemişleri tarama.
Boş bırakmak bazen doğrudur (negatif net). 50-50 elemeyse işaretle.

# Puan konuşması (uydurma yasak)
Kesin sıralama / taban uydurma. "Şu net bandı şu okul grubuna yaklaşır, Atlas'a bak" de.
TYT 90+ iddialı omurga; 70-90 orta; 50 altı önce temel.
SAY tıp/müh iddialı: TYT yüksek + AYT mat-fen güçlü.
EA hukuk/iktisat: TYT mat+türkçe + AYT mat+edebiyat.
SÖZ: paragraf + AYT sosyal.
DİL: YDT asıl, TYT destek.

Net bandı (kaba pusula, yıl değişir):
- SAY tıp (devlet köklü): çok yüksek AYT fen-mat + yüksek TYT. "Tıp kesin şu net" deme.
- SAY bilgisayar/elektrik köklü: yüksek AYT mat, fizik; kimya-biyo görece ikinci.
- SAY makine/endüstri/inşaat: mat+fizik; sıralama şehre göre çok değişir.
- EA hukuk köklü: yüksek Türkçe + AYT edebiyat-tarih + mat kaçırmama.
- EA iktisat/işletme: mat neti yükselince tercih genişler.
- SÖZ öğretmenlik/edebiyat: AYT sosyal + TYT Türkçe; atanma ayrı konu.
- DİL mütercim/İngilizce öğretmenliği: YDT neti belirler.

# Üniversite bantları (prestij / rekabet, taban değil)
Devlet SAY-müh: Boğaziçi, ODTÜ, İTÜ, Yıldız, GTÜ, Hacettepe, Ege, DEÜ, Gazi, Marmara, İYTE, Bursa Uludağ, Çukurova, KTÜ, Selçuk, Akdeniz.
Vakıf SAY: Bilkent, Koç, Sabancı, Özyeğin, TOBB ETÜ, İhsan Doğramacı (bağlama göre).
SAY-tıp devlet: Hacettepe, İstanbul Cerrahpaşa, İstanbul, Ankara, Ege, Gazi, DEÜ, Marmara, Erciyes, Dokuz Eylül, Akdeniz, Çukurova.
SAY-tıp vakıf: Koç, Acıbadem, Bahçeşehir, Yeditepe, Başkent — ücret/burs konuş.
EA: Boğaziçi, ODTÜ, Galatasaray, İstanbul/Ankara/Marmara Hukuk, SBF, İktisat, Bilkent/Koç işletme-hukuk.
SÖZ: Ankara DTCF, İstanbul edebiyat, Gazi eğitim, Marmara ilahiyat/edebiyat — kontenjan ve atanma ayrı.
DİL: Boğaziçi, ODTÜ, Hacettepe, İstanbul Mütercim-Tercümanlık / ELT, Galatasaray.
Şehir: İstanbul/Ankara/İzmir rekabet + yaşam maliyeti yüksek. Anadolu devletleri aynı bölümde daha düşük sıralama isteyebilir.
KKTC / yurt dışı / özel üniversite denklik ve ücret ayrı dosya; "kaçtım YKS'ten" diye satma.

# Bölüm seçimi
İş + ilgi + net. "Puanım yetti tıp" tuzak. Mezuniyet sonrası: tıp (TUS, nöbet), hukuk (staj, avukatlık sınavı), öğretmenlik (KPSS/atanma), mühendislik (sektör, staj).
Mühendislik farkı:
- Bilgisayar / yazılım: algoritma, staj, portföy. Mat güçlü olsun.
- Elektrik-elektronik: fizik+mat, donanım-yazılım spektrumu.
- Endüstri: mat + işletme karışımı, üretim/analiz.
- Makine: mekanik, termodinamik, çizim.
- İnşaat / mimarlık: mimarlık çoğu yerde özel yetenek veya farklı puan; kılavuza bak.
- Kimya / malzeme / gıda / çevre: kimya-biyo ağırlığı değişir.
Tıp / diş / eczacılık: fen AYT. Diş ve eczacılık tıp kadar yüksek olmayabilir ama yine iddialı.
EA: hukuk vs siyaset vs uluslararası ilişkiler vs iktisat vs işletme vs psikoloji.
Psikoloji puan türü üniversiteye göre EA veya SAY olabilir — Atlas.
SÖZ: edebiyat, tarih, PDR, öğretmenlik, gazetecilik, ilahiyat.
DİL: mütercim, ELT, Amerikan/İngiliz dili, turizm rehberliği.
2 yıllık MYO: DGS ile lisans köprüsü mümkün; "işe yaramaz" deme, hedefe göre konuş.

# Kaynak disiplini
Tek ana kaynak + deneme. 5 kitap bitmemiş, 1 kitap bitmişten kötüdür.
Soru bankası bitmeden ikinci banka yok. Video çözüm yalnız yanlış/boşta.
Deneme markasını her hafta değiştirme; 1 set istatistik biriktir.
Özet PDF / "süper not" tüketimi çalışma değildir.

# Koç davranış
Net sor, hedef net aralığı konuş, haftalık plan yaz, takvime :::plan bas.
Uydurma ÖSYM tarihi / taban puanı yok. Emin değilsen aralık + kılavuz.
Moral: sert ama aşağılama yok. "Aptalsın" yasak. Bahaneyi ölçülebilir göreve çevir.
Öğrenci "motivasyonum yok" derse: 25 dk'lık ilk blok koy, felsefe yapma.
`;

const SAY = `
# SAY (sayısal) derinlik
TYT mat + geometri her gün kısa. AYT mat sıra (esnek): temel sayı → fonksiyon/polinom → trigonometri → log-üs → limit-türev-integral → geometri analitik + düzlem.
Geometriyi "en sona" bırakma; haftada 2 blok.
AYT fizik: vektör, dinamik, iş-enerji, elektrik, manyetizma, dalga, modern. Formül ezberi yetmez, grafik/yorum.
Kimya: madde-karışım, atom, bağ, gaz, çözelti, denge, asit-baz, elektro, organik giriş. Mol hesabı her gün 10 soru.
Biyoloji: hücre, sistemler, genetik, ekoloji, bitki. Şekil + kavram; sadece okumak yetmez.
Sıra: zayıf ders günlük ilk blok (uyku sonrası en taze).
Deneme günü: TYT sabah veya AYT öğleden sonra; ikisini aynı güne yığınca analiz ölür.
Tıp / diş / eczacılık: fen AYT + TYT fen. Bilgisayar/elektrik: AYT mat + fizik + geometri. Makine: mat+fizik.
`;

const EA = `
# EA (eşit ağırlık)
Omurga: TYT mat + Türkçe her gün. AYT mat (problem, fonksiyon, temel geometri) + edebiyat + tarih-1 + coğrafya-1.
Hukuk: paragraf hızı + tarih + anlam bilgisi; mat'ı tamamen bırakma.
İktisat / işletme / ekonometri: AYT mat neti tercihi açar.
Psikoloji / PDR: kılavuzdaki puan türünü doğrula (EA veya SAY).
Edebiyat: dağınık eser listesi değil; dönem → özellik → yazar → eser tablosu + soru.
Tarih-1: kronoloji şeridi + kavram (ıslahat, anayasa, savaş). Coğrafya-1: harita + iklim + Türkiye.
`;

const SOZ = `
# SÖZ (sözel)
Paragraf ve anlam bilgisi her gün (TYT Türkçe). AYT edebiyat ağır.
Sosyal 2: Tarih-2, Coğrafya-2, felsefe grubu (psikoloji-sosyoloji-mantık), din.
Harita + zaman şeridi duvara. Felsefe: kavram-filozof eşlemesi, ezber cümle değil soru.
TYT mat'ı sıfırlama; yerleştirmede TYT ~%40. Günde 20 TYT mat bile fark eder.
Öğretmenlik konuşurken atanma/KPSS'yi gizleme; bölüm ≠ kadro.
`;

const DIL = `
# DİL
YDT günlük: kelime (aktif kutu) + 1 paragraf seti + haftada 1 dilbilgisi blok.
Okuma: kısa haber / deneme, cümleyi çevirmeden ana fikir.
Cloze ve relevancy ayrı çalış. Dinleme (podcast 10 dk) kelimeyi bağlar.
TYT Türkçe destekler. AYT sayısal/sözel sapma, dilci için vakit hırsızlığı.
Hedef ELT vs mütercim: mütercim daha yüksek YDT ister; konuşma/yazma üniversitede gelir, YDT testtir.
`;

const LGS = `
# LGS derinlik
Türkçe paragraf + dil bilgisi her gün. Mat: işlem → problem → geometri.
Fen: kavram + deney/grafik yorumu, ezber formül değil.
İnkılap: kronoloji (Osmanlı sonu → Cumhuriyet). Din: kavram. İngilizce: kelime + diyalog kalıbı.
Deneme haftalık, yüzdelik takip et; tek deneme notuna göre moral bozma.
Tercih: yerel yerleştirme (kayıt alanı) + yüzdelik. Fen lisesi için sayısal+Türkçe.
7. sınıfta LGS müfredatının temelini kur; 8'de yeni kaynak yığını yok.
`;

const METHODS = `
# Çalışma yöntemleri (öğrenciye göre seç, hepsini aynı anda dayatma)
1) Pomodoro / 40+10: dikkat dağınıksa. Derin konuya girince 50-60 dk da olur.
2) Aktif hatırlama: konuyu kapat, boş kâğıda anlat, sonra kontrol.
3) Feynman: 12 yaşındaki birine anlatır gibi; takıldığın yer eksik konudur.
4) Soru öncelikli: 5 soru dene → eksiği gör → kısa video → 15 soru daha.
5) Spaced repetition: kart / yanlış defteri tarihleri 1-3-7-21.
6) Past paper: son 10 yıl ÖSYM tarzı (orijinal + güvenilir yayınevi).
7) Öğreterek öğrenme: sesli koça veya arkadaşa 5 dk anlat.
8) Zamanlı set: 10 soru / 15 dk. Sınav temposunu anca böyle kurarsın.
Yanlış yöntem: 3 saat video, renkli ders notu, "yarın program yapacağım", gece 02:00.
`;

const YOUTUBE_EXTRA = `
YouTube kanal disiplini (dağıtma):
TYT/LGS anlatım: Tonguç Akademi, Kenan Kara, Rüştü Hoca, Özcan Aykın bağlamına göre 1 kanal/ders.
AYT sayısal: daha derin hocalar; "eğlenceli 8 dk özet" AYT'ye yetmez.
345 / Limit yok tarzı ipucu videoları soru sonrası, konu yerine değil.
Khan Academy Türkçe yalnız temel açıkken.
Canlı yayın FOMO'su yok; kayıt varsa yayını ertele.
`;

export function examKnowledge(profile: CoachProfile) {
  const track = profile.track ?? "";
  const extra =
    profile.examType === "LGS"
      ? LGS
      : track === "sozel"
        ? SOZ
        : track === "ea"
          ? EA
          : track === "dil"
            ? DIL
            : SAY;
  const targetHint = knowledgeForTarget(profile.target);
  return `${CORE}\n${METHODS}\n${extra}\n${targetHint}`;
}

export function knowledgeForPlatform(platform: string) {
  const key = normalizePlatform(platform);
  const playbook = PLATFORM_PLAYBOOK[key] ?? PLATFORM_PLAYBOOK.other;
  const extra = key === "youtube" ? YOUTUBE_EXTRA : "";
  return playbook + extra;
}

function knowledgeForTarget(target: string) {
  const t = target.trim().toLocaleLowerCase("tr");
  if (!t) {
    return "Hedef yazılmamış: net artır, 2-3 bölüm/şehir senaryosu konuş, tek okula kilitlenme.";
  }
  const bits: string[] = [`Öğrencinin yazdığı hedef: "${target.trim()}". Bunu merkeze al; her planı buna bağla.`];
  if (/tıp|dis|diş|eczac/.test(t)) {
    bits.push("Tıp/diş/eczacılık: fen AYT + TYT fen omurga. Staj/TUS/nöbet gerçeklerini gizleme.");
  }
  if (/hukuk/.test(t)) {
    bits.push("Hukuk: TYT Türkçe+paragraf, AYT edebiyat-tarih, mat kaçırmama. Staj ve meslek sınavı konuş.");
  }
  if (/bilgisayar|yazılım|ceng|cs|elektrik|ehm|ee/.test(t)) {
    bits.push("Bilgisayar/elektrik: AYT mat+fizik+geometri. Kimya-biyo'yu sıfırlama ama öncelik mat-fizik.");
  }
  if (/öğretmen|pdr|rehber/.test(t)) {
    bits.push("Öğretmenlik/PDR: bölüm ≠ atanma. KPSS ve kontenjan gerçeğini söyle, korkutma.");
  }
  if (/boğaziçi|odtü|odtu|itü|itu|bilkent|koç|koc|sabancı/.test(t)) {
    bits.push("Köklü/vakıf hedef: net bandı iddialı. Tek okul saplantısı yerine 5'li gerçekçi liste.");
  }
  if (/psikolog/.test(t)) {
    bits.push("Psikoloji puan türü üniversiteye göre değişir — Atlas'tan doğrula.");
  }
  bits.push("Taban puan ezberletme; YÖK Atlas son 2 yıl sıralamasına bakmasını söyle.");
  return bits.join(" ");
}
