export const WHATSAPP_NUMBER = "6285285865496";

export function buildWhatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export type MainProgramSession = {
  date: string;
  title: string;
  format: string;
};

export type PricingTier = {
  label: string;
  period: string;
  price: string;
  active: boolean;
};

export type IncludeItem = {
  icon: string;
  label: string;
};

export type MainProgram = {
  title: string;
  tagline: string;
  description: string;
  facilitators: { name: string; role: string; photo: string }[];
  period: string;
  sessions: MainProgramSession[];
  pricing: PricingTier[];
  includes: IncludeItem[];
  registrationLink: string;
  instagram: string;
  whatsapp: string;
  image: string;
};

/**
 * Program utama yang akan datang. Sumber: program/marriage_life/*.jpeg
 */
export const MAIN_PROGRAM: MainProgram = {
  title: "Marriage Life",
  tagline:
    "Setelah “sah”, berbagai pertanyaan baru justru bermunculan: tentang diri, pasangan, anak, keluarga, hingga mimpi yang ingin tetap kita perjuangkan.",
  description:
    "Because after “I do”... there’s still so much to navigate together. Coaching & journaling bersama dua konselor keluarga untuk pasangan yang ingin terus bertumbuh setelah menikah.",
  facilitators: [
    {
      name: "Ershy Rafanti, S.Psi. (Ezie)",
      role: "Wellness coach, essence of life practitioner, certified family counselor",
      photo: "/images/tim/ezie.jpg",
    },
    {
      name: "Anggit Oktafiania, S.T. (Anggit)",
      role: "Aktivis dakwah, alumnus Inspire-Psy, certified family counselor",
      photo: "/images/tim/anggit.jpg",
    },
  ],
  period: "10 Oktober – 28 November 2026",
  sessions: [
    {
      date: "10 Okt 2026",
      title: "Wanita Mandiri, Taat pada Suami, Bisakah?",
      format: "Online · Zoom",
    },
    {
      date: "24 Okt 2026",
      title: "Circle untuk Bertumbuh Setelah Menikah, Perlukah?",
      format: "Online · Zoom",
    },
    {
      date: "7 Nov 2026",
      title: "Menunda Punya Anak, Bijakkah?",
      format: "Online · Zoom",
    },
    {
      date: "28 Nov 2026",
      title:
        "Special Coffee Talk: Menikah & Ambisi, Bisa Seiring atau Harus Ada yang Dikorbankan?",
      format: "Hybrid · Women Gathering Jakarta",
    },
  ],
  pricing: [
    {
      label: "Founding Price",
      period: "15 – 31 Agustus 2026",
      price: "Rp 399.000",
      active: false,
    },
    {
      label: "Early Bird Price",
      period: "1 – 16 September 2026",
      price: "Rp 425.000",
      active: false,
    },
    {
      label: "Normal Price",
      period: "17 September – 9 Oktober 2026",
      price: "Rp 449.000",
      active: true,
    },
  ],
  includes: [
    { icon: "videocam", label: "3 live online sessions" },
    { icon: "groups", label: "1 offline women gathering" },
    { icon: "menu_book", label: "39 hari jurnal terpandu via Apps" },
    { icon: "fact_check", label: "Final self growth assessment" },
    { icon: "redeem", label: "Voucher WellScan" },
  ],
  registrationLink: "https://bit.ly/SelarasMarriage",
  instagram: "@selaras.life",
  whatsapp: "0852-8586-5496",
  image: "/images/program/marriage-life.jpg",
};

export type OpenClass = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  facilitator: { name: string; credentials: string; photo: string };
  schedule: string;
  audience: string;
  price: string;
  registrationLink: string;
  topics: string[];
  image: string;
};

/**
 * Kelas rutin yang selalu dibuka. Sumber: program/kelas_birth_in_fitrah,
 * program/kelas_prenatal_flow, program/kelas_breastfeeding.
 */
export const OPEN_CLASSES: OpenClass[] = [
  {
    id: "birth-in-fitrah",
    title: "Introduction to Birth in Fitrah",
    subtitle: "Understand the body. Trust the process. Surrender to Allah.",
    description:
      "Eksplorasi persalinan sebagai pengalaman ilahiah, insting, dan spiritual. Selaras Laktasi memadukan sains, spiritualitas, dan kebijaksanaan praktis agar orang tua menyambut kelahiran sebagai amanah yang suci.",
    facilitator: {
      name: "Laras Adhianti, S.T., AMANI",
      credentials:
        "Founder Selaras Laktasi, certified breastfeeding counselor, AMANI childbirth educator",
      photo: "/images/tim/laras.jpg",
    },
    schedule: "Sabtu, 10.00 – 12.00 WIB",
    audience: "Ibu hamil & pasangan",
    price: "Rp 100.000 / couple",
    registrationLink: "https://bit.ly/SelarasBirth",
    topics: [
      "Memahami fitrah & desain tubuh dalam proses kelahiran",
      "Mengenali tanda dan tahapan persalinan",
      "Bagaimana ibu & bayi bekerja bersama selama proses lahir",
      "Active birth: gerakan & posisi yang mendukung persalinan",
      "Peran ayah sebagai pendamping aktif selama persalinan",
      "Ikhtiar, tawakal & surrender dalam menyambut kelahiran",
    ],
    image: "/images/program/birth-in-fitrah.jpg",
  },
  {
    id: "prenatal-flow",
    title: "Prenatal Flow",
    subtitle: "Breathe · Stretch · Reflect",
    description:
      "Slow exercise online class yang dirancang untuk menenangkan tubuh dan pikiran sebelum tidur. Lewat gerakan pelan, napas penuh kesadaran, dan refleksi, kelas ini menjadi ruang lembut untuk terhubung kembali dengan diri, janin, dan Allah.",
    facilitator: {
      name: "Ramdhania Wukufianti, SKM., CPYT (Embun)",
      credentials:
        "Certified prenatal yoga teacher, breastfeeding counselor, doula, hypnobirthing practitioner",
      photo: "/images/tim/embun.jpg",
    },
    schedule: "Setiap Jumat malam, 19.15 – 20.30 WIB",
    audience: "Ibu hamil",
    price: "Rp 75.000/orang (drop in) · Rp 260.000/orang (4 minggu)",
    registrationLink: "https://bit.ly/SelarasFlow",
    topics: [
      "Week 1 — Trust My Body: mengenal & mempercayai tubuh yang berubah",
      "Week 2 — Connecting with My Baby: bonding & komunikasi ibu-bayi",
      "Week 3 — Release & Surrender: dari kekhawatiran menuju tawakal",
      "Week 4 — Preparing My Heart for Birth: mempersiapkan hati menjalani persalinan",
    ],
    image: "/images/program/prenatal-flow.jpg",
  },
  {
    id: "breastfeeding",
    title: "Sacred Nourishment: Breastfeeding as a Family Amanah",
    subtitle: "Child's Right · Mother's Fitrah · Father's Provision",
    description:
      "Menyusui bukan sekadar memberi hak nutrisi anak, melainkan menunaikan fitrah ibu dan mengharmoniskan peran ayah dalam memberi nafkah pertamanya kepada sang buah hati. Terbuka juga bagi yang belum hamil dan tertarik menjadi support system ibu menyusui.",
    facilitator: {
      name: "Apt. Nisrina, S.Farm",
      credentials: "Certified breastfeeding counselor",
      photo: "/images/tim/anis.jpg",
    },
    schedule: "Sabtu, 09.00 – 13.00 WIB",
    audience: "Ibu hamil & pasangan",
    price: "Rp 150.000 / couple",
    registrationLink: "https://bit.ly/bahagiamenyusui",
    topics: [
      "Kupas tuntas makna dalil perintah menyusui",
      "Keserasian peran ibu dan ayah",
      "Breastfeeding made simple, menyusui adalah fitrah",
      "Fakta ilmiah seputar ASI dan menyusui",
      "Tips & trick ikhtiar bahagia menyusui",
      "Hands on: posisi menyusui & pelekatan",
      "Tanda kecukupan ASI pada bayi",
      "Tantangan menyusui & ikhtiar penanganannya",
    ],
    image: "/images/program/breastfeeding.jpg",
  },
];

export type PastProgram = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  period: string;
  location?: string;
  highlights: string[];
  image: string;
};

/**
 * Program yang sudah berlalu, tetap ditampilkan sebagai rekam jejak Selaras Life.
 * Sumber: program/kelas_step_back, program/melahirkan_selaras_fitrah,
 * program/from_womb_to_world.
 */
export const PAST_PROGRAMS: PastProgram[] = [
  {
    id: "from-womb-to-world",
    title: "From Womb to World",
    subtitle:
      "A gentle staycation for expecting couples preparing pregnancy, birth, breastfeeding, and newborn care with faith, love, and expert guidance.",
    description:
      "Staycation 2D1N di hotel bintang 4 berisi rangkaian kelas Birth & Breastfeeding in Fitrah, Womb & Awareness, Aligning Care Provider with Your Fitrah, Move with Grace (couple prenatal exercise), hingga Little Hands: Gentle Care & Touch, didampingi para praktisi dan bidan.",
    period: "20 – 21 Desember 2025",
    location: "Trembesi Hotel, BSD, Tangerang Selatan",
    highlights: [
      "Laras Adhianti — Birth & Breastfeeding in Fitrah",
      "Vidya Permadiputri — Womb & Awareness: Reconnect with Self & Baby",
      "Bidan Amel — Aligning Care Provider with Your Fitrah",
      "Sinta Joy — Move with Grace: Couple Prenatal Exercise",
      "Diah Rohmatullailah — Little Hands, Gentle Care & Touch",
      "Ershy Rafanti & Andi Shalini — Journey Companion",
    ],
    image: "/images/program/from-womb-to-world.jpg",
  },
  {
    id: "step-back",
    title: "Step Back",
    subtitle:
      "Pemahaman dan Penguatan Aqidah Dalam Menjalani Hidup Selaras Wahyu",
    description:
      "Kajian rutin khusus akhwat bersama Anggit Oktafiania, S.T., membahas konsep ketuhanan dalam Islam, jalan menuju iman, eksistensi Al-Qur'an, syariat, hingga kedudukan wanita dalam syariat Islam.",
    period: "21 Februari – 16 Mei 2026",
    highlights: [
      "Pentingnya Berilmu",
      "Konsep Ketuhanan dalam Islam",
      "Jalan Menuju Iman",
      "Eksistensi Al-Qur'an & Konsekuensi Iman kepadanya",
      "Syariat, Mengimani Perkara Ghaib, Qada dan Qadar",
      "Wanita dalam Syariat Islam",
    ],
    image: "/images/program/step-back.jpg",
  },
  {
    id: "melahirkan-selaras-fitrah",
    title: "Melahirkan Selaras Fitrah",
    subtitle: "Intimate Iftar Talk – Special Ramadhan",
    description:
      "Ruang untuk memahami fitrah wanita dalam kehamilan, melahirkan, dan menyusui, serta mengenal lebih dalam fitrah lelaki sebagai qawwam dalam menjaga dan menerangi keluarga.",
    period: "Ramadhan 2026",
    highlights: [
      "Introduction to Birth in Fitrah — Laras Adhianti, S.T., AMANI",
      "Intimate Birth Story — Hira & Lutfi (content creator & YouTuber)",
      "Iftar Talk, The Qawwam: A Father's Sacred Leadership — Ustadz Mohammad Syam'un, M.Ag (Peneliti INSISTS)",
    ],
    image: "/images/program/melahirkan-selaras-fitrah.jpg",
  },
];
