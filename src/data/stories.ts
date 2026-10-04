/**
 * Semua konten di file ini diambil dari unggahan resmi Instagram
 * @selaraslaktasi dan @selaras.life (bukan data rekaan), sesuai permintaan
 * untuk menampilkan cerita/testimoni nyata di halaman Cerita.
 */

export type FeaturedStory = {
  source: string;
  sourceAccount: string;
  cover: string;
  coverAlt: string;
  people: string;
  title: string;
  subtitle: string;
  summary: string;
  quote: string;
  quoteAuthor: string;
  context: string;
  likes: string;
  comments: number;
};

/**
 * Sumber: https://www.instagram.com/p/DWly0KKE6jS/ (@selaraslaktasi)
 * Bagian dari rangkaian "Melahirkan Selaras Fitrah" — lihat juga
 * PAST_PROGRAMS di data/programs.ts.
 */
export const FEATURED_STORY: FeaturedStory = {
  source: "https://www.instagram.com/p/DWly0KKE6jS/",
  sourceAccount: "@selaraslaktasi",
  cover: "/images/stories/hira-lutfi-birth-story.png",
  coverAlt: "Amma Hira dan Abba Lutfi berbagi kisah kelahiran putrinya",
  people: "Amma Hira & Abba Lutfi",
  title: "Melahirkan: Ketika Hati Belajar Benar-Benar Berserah",
  subtitle: "Kisah tentang ikhtiar, ilmu, dan kuasa Allah",
  summary:
    "Di usia kehamilan 34 minggu, pemeriksaan menunjukkan plasenta Hira mengalami pengapuran dini, air ketuban sedikit, dan berat janin dinilai kecil — dokter menyarankan kehamilan segera diselesaikan. Berbekal ilmu dari kelas Childbirth Education di Selaras Laktasi, Hira & Lutfi memilih mencari second opinion, memperbaiki ikhtiar nutrisi, dan memantapkan hati lewat istikharah bersama care provider dari Klinik Cikal Mulia. Di usia 38 minggu, kontraksi datang dengan sendirinya. Putri mereka, Aisyah, lahir dalam posisi sungsang — dengan cara yang Allah pilihkan.",
  quote:
    "Allah menetapkan sesuatu sesuai takarannya, sesuai kapasitas kita yang menerima. Mungkin kita belum mengerti saat itu, tapi pada akhirnya... kita akan memahami.",
  quoteAuthor: "Hira",
  context: "Dibagikan dalam rangkaian acara Melahirkan Selaras Fitrah",
  likes: "1,4 rb",
  comments: 9,
};

export type MentorQuote = {
  quote: string;
  name: string;
  role: string;
  source: string;
};

/**
 * Kutipan ini muncul dalam carousel cerita Hira & Lutfi di atas, dari bidan
 * yang mendampingi persalinan mereka.
 */
export const MENTOR_QUOTE: MentorQuote = {
  quote:
    "Alam rahim itu hak prerogatif Allah... kita hanya bisa mengusahakan yang terbaik, namun penjagaan Allah itu Maha Sempurna. Keputusan ada di tangan ibu dan ayah, sebab ayah adalah qawwam. Lakukan istikharah agar Allah memantapkan hati — ingin mengikuti tanda dari manusia, atau menunggu tanda langsung dari Allah?",
  name: "Bidan Fatimah",
  role: "Klinik Cikal Mulia — mitra praktisi Selaras Laktasi",
  source: "https://www.instagram.com/p/DWly0KKE6jS/",
};

export type CommunityReflection = {
  id: string;
  name: string;
  handle: string;
  source: string;
  summary: string;
  quote: string;
  responseQuote: string;
  responseAuthor: string;
  likes: string;
};

/**
 * Sumber: https://www.instagram.com/p/DdMBL-9Ezhn/ dan
 * https://www.instagram.com/p/DdR3xy8kjKD/ — dibagikan ulang dan ditandai ke
 * @selaraslaktasi / @selaras.life.
 */
export const COMMUNITY_REFLECTIONS: CommunityReflection[] = [
  {
    id: "ladhian-taaruf",
    name: "Laras Adhianti",
    handle: "@ladhian",
    source: "https://www.instagram.com/p/DdMBL-9Ezhn/",
    summary:
      "Laras Adhianti — Founder Selaras Laktasi — membaca ulang CV ta'arufnya sendiri dan tersadar bahwa pasangan yang Allah pilihkan punya wawasan jauh lebih luas dari yang pernah ia bayangkan, meski dulu ia menuliskan syarat pendidikan minimal S1.",
    quote:
      "Ternyata ada doa-doa lama yang baru kusadari sekarang: Oh... ternyata ini sudah Allah jawab.",
    responseQuote:
      "Ternyata dengan ilmu, pernikahan tidak semengerikan apa yang digaungkan selama ini.",
    responseAuthor: "Anggit Oktafiania, Co-founder Selaras Life",
    likes: "90an",
  },
  {
    id: "meidivira-selaras",
    name: "Meidivira",
    handle: "@meidivira",
    source: "https://www.instagram.com/p/DdR3xy8kjKD/",
    summary:
      "Meidivira, bagian dari tim yang bekerja bersama Laras Adhianti, merefleksikan setahun penuh rezeki: menikah dengan suaminya pada Oktober 2024, dan menemukan Selaras sebagai jawaban doanya akan lingkungan kerja yang islami setelah lama skeptis hal itu mungkin ditemukan.",
    quote:
      "Bertemu dengan SELARAS adalah rezeki yang datangnya dari Allah. Jujur, aku sudah skeptis dengan lingkungan kerja yang 'berandingannya islami', tapi bertemu SELARAS betul-betul menamparku bahwa kuasa Allah itu jauh lebih besar dari yang kita bayangkan.",
    responseQuote: "Ana uhibukk fillah meimeiii 🫶",
    responseAuthor: "Anggit Oktafiania, Co-founder Selaras Life",
    likes: "Laras Adhianti & lainnya",
  },
];
