import "server-only";
import { createHash } from "node:crypto";
import type { GiftContent } from "@/data/gifts";

export const GIFT_GENERATION_VERSION = "journal-gift-v3";
export type GiftContext = {
  profil: { activities: string; skills: string[]; maritalStatus: string | null } | null;
  jurnal: { id: number; tanggal: string; isi: string; signals: string }[];
};

type Theme = {
  id: string; words: RegExp; tags: string[]; title: string;
  opening: string; companion: string; reflection: string; step: string;
};
// These are modest keyword signals for ranking and an offline fallback, not a diagnosis.
// Only participant answers are matched; question labels and profile never become evidence.
const THEMES: readonly Theme[] = [
  {
    id: "aman", words: /\b(kekerasan|dipukul|diancam|disakiti|bunuh diri|menyakiti diri|tidak (?:merasa )?aman|takut pulang)\b/i,
    tags: ["dukungan", "perlindungan", "pertolongan"], title: "Kamu layak mendapat rasa aman",
    opening: "Jika ada hal yang membuatmu merasa terancam atau disakiti, keselamatanmu layak didahulukan. Kamu tidak harus melewati keadaan itu sendirian.",
    companion: "Mencari tempat aman dan dukungan adalah bagian dari merawat dirimu.",
    reflection: "Siapa orang tepercaya yang bisa mendampingimu mencari tempat dan bantuan yang aman?",
    step: "Jika sedang dalam bahaya, utamakan menuju tempat aman dan hubungi orang tepercaya atau layanan darurat setempat. Kamu boleh meminta ditemani.",
  },
  {
    id: "duka", words: /\b(kehilangan|berduka|duka|meninggal|wafat|merindukan|rindu)\b/i,
    tags: ["kehilangan", "duka", "dukungan"], title: "Ada ruang untuk rindu dan harapan",
    opening: "Jika kehilangan atau rindu sedang hadir dalam ceritamu, kamu boleh memberi waktu bagi perasaan itu. Tidak ada kewajiban untuk segera terlihat kuat.",
    companion: "Rindu boleh diberi ruang tanpa menentukan kapan kamu harus merasa pulih.",
    reflection: "Apa yang ingin kamu kenang dengan lembut, dan dukungan apa yang kamu perlukan hari ini?",
    step: "Bila terasa sanggup, tulis satu kenangan atau ceritakan perasaanmu kepada seseorang yang bersedia mendengarkan.",
  },
  {
    id: "lelah", words: /\b(lelah|capek|letih|kewalahan|kelelahan|burnout|kurang tidur|beban|tanggung jawab)\b/i,
    tags: ["lelah", "beban", "istirahat", "keseimbangan", "tanggung jawab"], title: "Jeda kecil untuk dirimu",
    opening: "Ketika lelah dan tanggung jawab mengambil banyak ruang, kamu boleh berhenti sebentar. Nilai dirimu tidak ditentukan oleh seberapa banyak yang berhasil kamu selesaikan.",
    companion: "Kebutuhanmu akan jeda juga layak mendapat tempat.",
    reflection: "Tanggung jawab mana yang bisa ditunda, dibagi, atau dijalani dengan lebih sederhana?",
    step: "Pilih satu jeda yang memungkinkan hari ini: minum, beristirahat sebentar, atau meminta bantuan untuk satu tugas.",
  },
  {
    id: "cemas", words: /\b(cemas|khawatir|gelisah|takut|panik|overthinking|bingung|ketidakpastian)\b/i,
    tags: ["cemas", "gelisah", "tenang", "ketidakpastian", "pertolongan"], title: "Pelan-pelan di tengah ketidakpastian",
    opening: "Jika kekhawatiran sedang memenuhi pikiranmu, kamu tidak harus menemukan semua jawaban hari ini. Ada ruang untuk menenangkan diri sambil memilih satu hal yang bisa kamu upayakan.",
    companion: "Hal yang belum pasti boleh dihadapi satu bagian demi satu bagian.",
    reflection: "Apa yang masih bisa kamu upayakan hari ini, dan apa yang boleh kamu lepaskan sementara?",
    step: "Coba ambil jeda dan tulis satu hal yang ada dalam kendalimu. Pilih langkah paling kecil untuk menanganinya.",
  },
  {
    id: "relasi", words: /\b(marah|kesal|bertengkar|konflik|suami|istri|pasangan|komunikasi|tersinggung|hubungan)\b/i,
    tags: ["relasi", "marah", "komunikasi", "keluarga", "kelembutan"], title: "Memberi ruang sebelum merespons",
    opening: "Ketika hubungan membutuhkan perhatian, perasaanmu juga layak didengar. Kamu boleh mengambil jeda sebelum memilih kata-kata dan batas yang menjaga dirimu.",
    companion: "Kelembutan boleh berjalan bersama batas yang sehat dalam hubungan.",
    reflection: "Perasaan atau kebutuhan apa yang ingin kamu sampaikan dengan jujur dan tetap menjaga dirimu?",
    step: "Jika situasinya aman, tulis dahulu satu kalimat tentang kebutuhanmu. Kamu tidak harus langsung mengirim atau mengatakannya.",
  },
  {
    id: "rezeki", words: /\b(uang|utang|hutang|rezeki|penghasilan|gaji|keuangan|nafkah|biaya|pekerjaan|kerja|menganggur)\b/i,
    tags: ["rezeki", "ikhtiar", "tanggung jawab", "harapan"], title: "Menjaga harapan dalam ikhtiar",
    opening: "Saat urusan penghidupan membutuhkan banyak tenaga, kamu boleh mengakui beratnya sambil tetap merawat harapan. Satu upaya yang realistis sudah layak dihargai.",
    companion: "Ikhtiarmu boleh disesuaikan dengan tenaga dan bantuan yang tersedia.",
    reflection: "Upaya kecil apa yang paling mungkin kamu lakukan, dan bantuan apa yang bisa kamu cari?",
    step: "Pilih satu urusan yang paling mendesak, lalu tulis langkah kecil atau orang yang bisa membantumu memikirkannya.",
  },
  {
    id: "menyesal", words: /\b(menyesal|penyesalan|bersalah|memaafkan|kesalahan|berdosa|tobat|taubat)\b/i,
    tags: ["penyesalan", "memulai kembali", "ampunan", "harapan"], title: "Masih ada ruang untuk memulai lagi",
    opening: "Jika ada kesalahan yang masih kamu pikirkan, kamu boleh mengakuinya tanpa terus merendahkan dirimu. Memperbaiki satu hal bisa menjadi awal yang lembut untuk kembali melangkah.",
    companion: "Belajar dari kesalahan tidak mengharuskanmu menghukum diri terus-menerus.",
    reflection: "Apa satu hal yang bisa kamu perbaiki, dan kalimat baik apa yang ingin kamu sampaikan kepada dirimu?",
    step: "Tulis satu perbaikan yang realistis. Bila menyangkut orang lain, pertimbangkan cara bertanggung jawab yang aman dan sesuai keadaan.",
  },
  {
    id: "sendiri", words: /\b(sendiri|kesepian|sepi|tidak didengar|tidak dipahami|tak ada teman|ditinggalkan)\b/i,
    tags: ["dukungan", "kesepian", "kedekatan", "pertolongan"], title: "Kamu boleh mencari teman berjalan",
    opening: "Jika hari-hari terasa sepi atau sulit dibagikan, kebutuhanmu untuk didengar itu berarti. Kamu boleh mencari kehadiran yang membuatmu merasa lebih aman dan diterima.",
    companion: "Kamu boleh memilih kepada siapa dan seberapa banyak cerita ingin dibagikan.",
    reflection: "Siapa yang membuatmu cukup nyaman untuk berbagi sedikit cerita tanpa harus menjelaskan semuanya?",
    step: "Bila memungkinkan, sapa satu orang tepercaya dan tanyakan apakah ia punya waktu untuk mendengarkanmu.",
  },
  {
    id: "syukur", words: /\b(bersyukur|syukur|senang|bahagia|lega|tenang|damai|terima kasih|alhamdulillah)\b/i,
    tags: ["syukur", "tenang", "kebaikan", "harapan"], title: "Merawat hal baik yang hadir",
    opening: "Ketika ada rasa lega atau hal baik dalam ceritamu, kamu boleh menikmatinya tanpa harus menunggu semuanya sempurna. Hal kecil pun pantas diberi tempat dalam ingatan.",
    companion: "Hal baik boleh kamu syukuri tanpa meniadakan perasaan lain yang juga hadir.",
    reflection: "Hal baik apa yang ingin kamu ingat, dan bagaimana kamu ingin merawatnya?",
    step: "Catat satu hal yang kamu syukuri beserta alasannya, atau ucapkan terima kasih kepada seseorang yang berarti.",
  },
  {
    id: "bertumbuh", words: /\b(belajar|mencoba|kebiasaan|konsisten|gagal|kurang|membandingkan|berubah|perubahan|target|memulai)\b/i,
    tags: ["kebiasaan", "perubahan", "merasa kurang", "ikhtiar", "belajar"], title: "Langkah kecilmu tetap berarti",
    opening: "Dalam proses belajar dan berubah, langkah yang belum sempurna tetap memiliki arti. Kamu boleh menyesuaikan ritme tanpa menghapus usaha yang sudah kamu jalani.",
    companion: "Bertumbuh tidak harus selalu terlihat sebagai kemajuan besar.",
    reflection: "Usaha kecil apa yang sudah kamu lakukan, dan bagian mana yang perlu dibuat lebih ringan?",
    step: "Pilih satu kebiasaan yang bisa dijalani dalam versi paling sederhana. Cukup mulai dari yang sesuai tenagamu hari ini.",
  },
];

export type GiftPattern = { theme: string; score: number; dates: string[] };
function signalText(text: string) {
  // Avoid obvious negated signals (e.g. "tidak cemas lagi"). The AI still sees the original.
  return text.toLowerCase().replace(/\b(tidak|tak|bukan|nggak|enggak|ga|gak)\s+(?:lagi\s+)?(?:merasa\s+)?(cemas|khawatir|gelisah|takut|marah|lelah|capek|senang|bahagia|tenang|bersalah|sendiri)\b/g, "");
}

export function journalPatterns(context: GiftContext): GiftPattern[] {
  return THEMES.map((theme) => {
    // An explicit update about feeling better takes precedence over older worry signals.
    const newest = context.jurnal[0]?.signals ?? "";
    if (theme.id === "cemas" && !theme.words.test(signalText(newest)) && /\b(tidak|tak|nggak|enggak|gak)\s+(?:lagi\s+)?(?:merasa\s+)?(cemas|khawatir|gelisah|takut)\b/i.test(newest)) {
      return { theme: theme.id, dates: [], score: 0 };
    }
    const matches = context.jurnal.flatMap((j, index) => theme.words.test(signalText(j.signals)) ? [{ date: j.tanggal, weight: 5 - index }] : []);
    return { theme: theme.id, dates: matches.map((m) => m.date), score: matches.reduce((sum, m) => sum + m.weight, 0) + matches.length * 2 };
  }).filter((p) => p.score > 0).sort((a, b) => (a.theme === "aman" ? -1 : b.theme === "aman" ? 1 : b.score - a.score));
}

export function rankGiftCandidates(context: GiftContext, recentIds: readonly string[], collection: readonly GiftContent[]) {
  const patterns = journalPatterns(context);
  const unused = collection.filter((c) => !recentIds.includes(c.id));
  const pool = unused.length ? unused : [...collection];
  const safety = patterns.some((p) => p.theme === "aman");
  const safePool = safety ? pool.filter((c) => c.themes.some((t) => ["dukungan", "perlindungan", "pertolongan"].includes(t))) : pool;
  const ranked = (safePool.length ? safePool : pool).map((content) => ({
    content,
    score: patterns.length ? patterns.reduce((sum, p) => {
      const tags = THEMES.find((t) => t.id === p.theme)!.tags;
      return sum + p.score * content.themes.filter((t) => tags.includes(t)).length;
    }, 0) : content.themes.filter((t) => ["harapan", "kebaikan", "dukungan", "tenang"].includes(t)).length,
  })).sort((a, b) => b.score - a.score || a.content.id.localeCompare(b.content.id));
  return { patterns, ranked };
}

export function fallbackGift(context: GiftContext, candidates: readonly GiftContent[], patterns: readonly GiftPattern[], seed: string) {
  if (!candidates.length) throw new Error("Gift collection is empty");
  const primary = THEMES.find((t) => t.id === patterns[0]?.theme);
  const secondary = primary?.id === "aman" ? undefined : THEMES.find((t) => t.id === patterns[1]?.theme);
  // Ranking determines relevance. A stable tie-break only adds variety among equally relevant texts.
  const index = createHash("sha256").update(seed).digest().readUInt32BE(0) % candidates.length;
  const content = candidates[index];
  const opening = primary?.opening ?? "Kamu boleh memberi ruang bagi apa pun yang sedang dirasakan, tanpa harus segera menemukan jawabannya. Semoga jeda kecil ini menemani langkahmu dengan lebih lembut.";
  return {
    contentId: content.id, personalTitle: primary?.title ?? "Ruang kecil untuk merawat harapan",
    intro: `${opening}${secondary ? ` ${secondary.companion}` : ""}\n\nBacaan “${content.title}” dipilih untuk menemani jedamu. Bacalah perlahan, sesuai ruang yang kamu punya hari ini.`,
    reflection: primary?.reflection ?? "Apa yang sedang kamu butuhkan hari ini, dan hal kecil apa yang ingin kamu beri ruang?",
    smallStep: primary?.step ?? "Ambil jeda sebentar. Jika ingin, tulis satu perasaan dan satu kebutuhanmu tanpa harus menilainya.",
    personalPrayer: null, composition: null, basedOnDates: context.jurnal.map((j) => j.tanggal),
    provider: primary ? "theme-fallback" : "neutral-fallback",
  };
}
