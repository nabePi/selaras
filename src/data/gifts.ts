import { ADDITIONAL_GIFT_CONTENT } from "./gift-collection";

/** Fixed source texts for AI-authored personal gifts. Quotations are rendered from these records. */
export type GiftKind = "dua" | "story" | "quran" | "hadith";
export const GIFT_KINDS: Record<GiftKind, { label: string; icon: string }> = {
  dua: { label: "Doa untukmu", icon: "prayer_times" },
  story: { label: "Kisah yang menguatkan", icon: "auto_stories" },
  quran: { label: "Cahaya dari Al-Qur’an", icon: "menu_book" },
  hadith: { label: "Pesan dari hadis", icon: "wb_sunny" },
};
export type GiftContent = {
  id: string;
  kind: GiftKind;
  title: string;
  themes: string[];
  arabic?: string;
  latin?: string;
  meaning?: string;
  paragraphs?: string[];
  source: { label: string; url: string; note: string; additional?: { label: string; url: string }[] };
};

export const GIFT_CONTENT: readonly GiftContent[] = [
  {
    id: "dua-lapang", kind: "dua", title: "Memohon hati yang lapang", themes: ["cemas", "komunikasi", "tanggung jawab"],
    arabic: "رَبِّ اشْرَحْ لِي صَدْرِي ۝ وَيَسِّرْ لِي أَمْرِي ۝ وَاحْلُلْ عُقْدَةً مِنْ لِسَانِي ۝ يَفْقَهُوا قَوْلِي",
    latin: "Rabbisyraḥ lī ṣadrī. Wa yassir lī amrī. Waḥlul ‘uqdatan mil lisānī. Yafqahū qaulī.",
    meaning: "Ya Tuhanku, lapangkanlah dadaku, mudahkanlah urusanku, dan lepaskanlah kekakuan dari lidahku agar mereka memahami perkataanku.",
    source: { label: "Doa Nabi Musa · QS. Taha 20:25–28", url: "https://quran.com/20/25-28", note: "Bagian doa dari ayat 25–28. Arti ditulis sebagai terjemahan makna." },
  },
  {
    id: "dua-kebaikan", kind: "dua", title: "Kebaikan untuk hari ini dan kelak", themes: ["keluarga", "harapan", "keseimbangan"],
    arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    latin: "Rabbanā ātinā fid-dunyā ḥasanataw wa fil-ākhirati ḥasanataw wa qinā ‘ażāban-nār.",
    meaning: "Ya Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat, serta lindungilah kami dari azab neraka.",
    source: { label: "Penggalan QS. Al-Baqarah 2:201", url: "https://quran.com/2/201", note: "Bagian doa dalam ayat, bukan seluruh ayat. Arti merupakan terjemahan makna." },
  },
  {
    id: "dua-yunus", kind: "dua", title: "Kembali kepada-Nya dengan jujur", themes: ["penyesalan", "sesak", "memulai kembali"],
    arabic: "لَا إِلَٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ",
    latin: "Lā ilāha illā anta subḥānaka innī kuntu minaẓ-ẓālimīn.",
    meaning: "Tidak ada tuhan selain Engkau. Mahasuci Engkau. Sungguh, aku termasuk orang-orang yang zalim.",
    source: { label: "Doa Nabi Yunus · penggalan QS. Al-Anbiya 21:87", url: "https://quran.com/21/87", note: "Bagian doa dalam ayat. Arti merupakan terjemahan makna." },
  },
  {
    id: "quran-kemudahan", kind: "quran", title: "Ada kemudahan bersama kesulitan", themes: ["beban", "lelah", "harapan"],
    arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    latin: "Fa inna ma‘al-‘usri yusrā. Inna ma‘al-‘usri yusrā.",
    meaning: "Maka sesungguhnya bersama kesulitan ada kemudahan. Sesungguhnya bersama kesulitan ada kemudahan.",
    source: { label: "QS. Asy-Syarh 94:5–6", url: "https://quran.com/94/5-6", note: "Arti merupakan terjemahan makna, bukan tafsir atau janji bahwa semua urusan segera selesai." },
  },
  {
    id: "quran-tenang", kind: "quran", title: "Tempat hati menemukan ketenangan", themes: ["gelisah", "tenang", "zikir"],
    arabic: "الَّذِينَ آمَنُوا وَتَطْمَئِنُّ قُلُوبُهُمْ بِذِكْرِ اللَّهِ ۗ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
    latin: "Allażīna āmanū wa taṭma’innu qulūbuhum biżikrillāh. Alā biżikrillāhi taṭma’innul-qulūb.",
    meaning: "Orang-orang yang beriman dan hati mereka tenteram dengan mengingat Allah. Ingatlah, dengan mengingat Allah hati menjadi tenteram.",
    source: { label: "QS. Ar-Ra‘d 13:28", url: "https://quran.com/13/28", note: "Arti merupakan terjemahan makna. Zikir dapat berjalan bersama ikhtiar dan bantuan yang kamu butuhkan." },
  },
  {
    id: "quran-pertolongan", kind: "quran", title: "Meminta pertolongan dalam perjalanan", themes: ["sabar", "perubahan", "ketidakpastian"],
    arabic: "يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ ۚ إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
    latin: "Yā ayyuhallażīna āmanusta‘īnū biṣ-ṣabri waṣ-ṣalāh. Innallāha ma‘aṣ-ṣābirīn.",
    meaning: "Wahai orang-orang yang beriman, mintalah pertolongan dengan sabar dan salat. Sesungguhnya Allah bersama orang-orang yang sabar.",
    source: { label: "QS. Al-Baqarah 2:153", url: "https://quran.com/2/153", note: "Arti merupakan terjemahan makna. Bersabar tidak berarti membiarkan diri berada dalam bahaya." },
  },
  {
    id: "hadith-lembut", kind: "hadith", title: "Kelembutan itu memperindah", themes: ["relasi", "marah", "mengasihi diri"],
    arabic: "إِنَّ الرِّفْقَ لَا يَكُونُ فِي شَيْءٍ إِلَّا زَانَهُ وَلَا يُنْزَعُ مِنْ شَيْءٍ إِلَّا شَانَهُ",
    latin: "Innar-rifqa lā yakūnu fī syai’in illā zānahu, wa lā yunza‘u min syai’in illā syānahu.",
    meaning: "Kelembutan yang ada pada sesuatu akan memperindahnya. Ketika kelembutan dicabut darinya, sesuatu itu menjadi buruk.",
    source: { label: "Sahih Muslim 2594a · riwayat Aisyah", url: "https://sunnah.com/muslim:2594a", note: "Teks matan hadis; sanad tidak ditampilkan. Terjemahan makna." },
  },
  {
    id: "hadith-konsisten", kind: "hadith", title: "Sedikit, tetapi dijaga", themes: ["kebiasaan", "lelah", "merasa kurang"],
    arabic: "وَأَنَّ أَحَبَّ الْأَعْمَالِ أَدْوَمُهَا إِلَى اللَّهِ وَإِنْ قَلَّ",
    latin: "Wa anna aḥabbal-a‘māli adwamuhā ilallāhi wa in qalla.",
    meaning: "Amalan yang paling dicintai Allah adalah yang paling berkesinambungan, walaupun sedikit.",
    source: { label: "Penggalan Sahih al-Bukhari 6464", url: "https://sunnah.com/bukhari:6464", note: "Penggalan bagian akhir matan, bukan seluruh hadis. Terjemahan makna." },
  },
  {
    id: "hadith-syukur", kind: "hadith", title: "Ruang bagi syukur dan sabar", themes: ["syukur", "kecewa", "perubahan"],
    arabic: "عَجَبًا لِأَمْرِ الْمُؤْمِنِ إِنَّ أَمْرَهُ كُلَّهُ خَيْرٌ",
    latin: "‘Ajaban li amril-mu’min, inna amrahu kullahu khair.",
    meaning: "Sungguh menakjubkan urusan seorang mukmin. Sesungguhnya seluruh urusannya adalah kebaikan.",
    source: { label: "Penggalan Sahih Muslim 2999 · riwayat Shuhaib", url: "https://sunnah.com/muslim:2999", note: "Penggalan awal matan. Hadis lengkap menerangkan syukur saat lapang dan sabar saat sulit." },
  },
  {
    id: "story-khadijah", kind: "story", title: "Khadijah dan kehangatan yang menenangkan", themes: ["dukungan", "cemas", "relasi"],
    paragraphs: [
      "Seusai menerima wahyu pertama, Rasulullah ﷺ pulang dalam keadaan takut dan meminta untuk diselimuti. Khadijah radhiyallahu ‘anha mendampingi beliau sampai rasa takut itu mereda.",
      "Khadijah mengingatkan beliau pada kebaikan yang selama ini beliau lakukan: menjaga hubungan keluarga, menolong orang yang membutuhkan, dan memuliakan tamu. Setelah mendengarkan, ia menemani beliau bertemu Waraqah untuk mencari penjelasan.",
      "Kisah ini memperlihatkan dukungan yang hadir melalui mendengarkan, menenangkan, dan menemani mencari pertolongan. Kehangatan tidak selalu berupa jawaban panjang; kadang ia dimulai dari kesediaan untuk hadir.",
    ],
    source: { label: "Diringkas dari Sahih al-Bukhari 3", url: "https://sunnah.com/bukhari:3", note: "Penceritaan ulang berbahasa Indonesia, bukan kutipan harfiah. Paragraf terakhir adalah refleksi editorial." },
  },
  {
    id: "story-umm-salamah", kind: "story", title: "Ummu Salamah dan doa di tengah kehilangan", themes: ["kehilangan", "duka", "harapan"],
    paragraphs: [
      "Ummu Salamah radhiyallahu ‘anha meriwayatkan doa yang diajarkan Rasulullah ﷺ ketika seseorang ditimpa musibah: memohon pahala dalam musibah dan pengganti yang lebih baik dari Allah.",
      "Ketika Abu Salamah wafat, ia merasa berat membayangkan siapa yang lebih baik daripada suaminya. Meski begitu, ia tetap membaca doa tersebut. Dalam riwayatnya, ia menceritakan bahwa kemudian Allah mempertemukannya dalam pernikahan dengan Rasulullah ﷺ.",
      "Kisahnya memberi ruang bagi duka dan doa untuk hadir bersama. Ini bukan janji bahwa pengalaman setiap orang akan berakhir sama, melainkan pengingat bahwa kita boleh meminta pertolongan ketika belum sanggup melihat jalan di depan.",
    ],
    source: { label: "Diringkas dari Sahih Muslim 918a", url: "https://sunnah.com/muslim:918a", note: "Penceritaan ulang, bukan kutipan harfiah. Paragraf terakhir adalah refleksi editorial, bukan janji hasil tertentu." },
  },
  {
    id: "story-fatimah", kind: "story", title: "Fatimah dan lelah yang boleh diceritakan", themes: ["lelah", "rumah tangga", "tanggung jawab"],
    paragraphs: [
      "Fatimah radhiyallahu ‘anha mengalami kelelahan hingga tangannya melepuh karena menggiling. Ia datang untuk meminta bantuan kepada Rasulullah ﷺ. Riwayat ini mencatat bahwa lelah itu disampaikan, bukan disembunyikan.",
      "Pada malam harinya, Rasulullah ﷺ mendatangi Fatimah dan Ali. Beliau mengajarkan zikir sebelum tidur berupa takbir, tasbih, dan tahmid.",
      "Ada ruang untuk mengakui lelah dan merawat hubungan dengan Allah. Kisah ini bukan larangan meminta bantuan; beristirahat, berbagi tanggung jawab, dan mencari dukungan tetap merupakan ikhtiar yang dapat dijalani.",
    ],
    source: { label: "Diringkas dari Sahih al-Bukhari 6318", url: "https://sunnah.com/bukhari:6318", note: "Penceritaan ulang, bukan kutipan harfiah. Paragraf terakhir adalah refleksi editorial." },
  },
  ...ADDITIONAL_GIFT_CONTENT,
];

export type PersonalPrayer = { arabic: string; latin: string; meaning: string };
export type GiftComposition = { paragraphs: string[]; closing: string; sources: GiftContent[] };
export type GiftDto = {
  id: string;
  intro: string;
  personalTitle: string | null;
  reflection: string | null;
  smallStep: string | null;
  composition: GiftComposition | null;
  content: GiftContent;
  personalPrayer: PersonalPrayer | null;
  expiresAt: string;
  feedback: "LIKE" | "DISLIKE" | null;
};

export function giftShareText(gift: GiftDto) {
  const { content: c, personalPrayer: p } = gift;
  return [
    `Hadiah kecil dari Selaras Life\n${c.title}`,
    ...(p ? ["Doa pribadi (bukan kutipan Al-Qur’an atau hadis)", p.arabic, p.latin, p.meaning, "Doa bersumber untuk menemani:"] : []),
    c.arabic, c.latin, c.meaning, ...(c.paragraphs ?? []),
    `Referensi: ${c.source.label}\n${c.source.url}`, c.source.note,
    ...(c.source.additional ?? []).map((s) => `${s.label}\n${s.url}`),
    "selaras.life",
  ].filter(Boolean).join("\n\n");
}
