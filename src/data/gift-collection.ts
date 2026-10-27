import type { GiftContent } from "./gifts";
import { TANZIL_GIFT_VERSES } from "./tanzil-gift-verses";

const quranSource = (verse: string, label: string, note = "") => ({
  label, url: `https://quran.com/${verse.replace(":", "/")}`,
  note: `Ayat lengkap. Teks Arab: Tanzil Project, Simple 1.1, digunakan tanpa perubahan. Latin adalah panduan pelafalan; arti merupakan terjemahan makna editorial. ${note}`.trim(),
  additional: [{ label: "Sumber teks Arab · Tanzil Project", url: "https://tanzil.net" }],
});
const hadithSource = (ref: string, label: string, note = "") => ({
  label, url: `https://sunnah.com/${ref}`,
  note: `Penggalan matan, bukan seluruh riwayat. Latin adalah panduan pelafalan; arti merupakan terjemahan makna editorial. ${note}`.trim(),
});
const storySource = (ref: string, label: string) => ({
  label, url: `https://quran.com/${ref}`,
  note: "Penceritaan ulang berdasarkan ayat yang dirujuk, bukan kutipan harfiah atau tafsir lengkap. Paragraf terakhir adalah refleksi editorial.",
});

/** Source-checked additions. Sacred texts are fixed; AI only selects and accompanies them. */
export const ADDITIONAL_GIFT_CONTENT: readonly GiftContent[] = [
  {
    id: "dua-hati", kind: "dua", title: "Memohon hati yang tetap terarah", themes: ["perubahan", "ketidakpastian", "harapan"],
    arabic: TANZIL_GIFT_VERSES["3:8"],
    latin: "Rabbanā lā tuzigh qulūbanā ba‘da iż hadaitanā wa hab lanā mil ladunka raḥmah, innaka antal-wahhāb.",
    meaning: "Ya Tuhan kami, janganlah Engkau palingkan hati kami setelah Engkau memberi petunjuk kepada kami. Anugerahkanlah rahmat dari sisi-Mu. Sungguh, Engkaulah Yang Maha Pemberi.",
    source: quranSource("3:8", "QS. Ali ‘Imran 3:8"),
  },
  {
    id: "dua-rahmat", kind: "dua", title: "Memohon ampun dan kasih sayang", themes: ["ampunan", "penyesalan", "memulai kembali"],
    arabic: TANZIL_GIFT_VERSES["23:118"],
    latin: "Wa qur rabbighfir warḥam wa anta khairur-rāḥimīn.",
    meaning: "Dan katakanlah, ‘Ya Tuhanku, ampunilah dan rahmatilah. Engkaulah sebaik-baik pemberi rahmat.’",
    source: quranSource("23:118", "QS. Al-Mu’minun 23:118", "Ayat menyertakan perintah untuk mengucapkan doa."),
  },
  {
    id: "dua-musa-rezeki", kind: "dua", title: "Mengakui kebutuhan kepada-Nya", themes: ["rezeki", "ikhtiar", "pertolongan"],
    arabic: TANZIL_GIFT_VERSES["28:24"],
    latin: "Fa saqā lahumā ṡumma tawallā ilaẓ-ẓilli fa qāla rabbi innī limā anzalta ilayya min khairin faqīr.",
    meaning: "Maka Musa memberi minum ternak keduanya, lalu ia beranjak ke tempat teduh dan berkata, ‘Ya Tuhanku, sungguh aku membutuhkan kebaikan apa pun yang Engkau turunkan kepadaku.’",
    source: quranSource("28:24", "Doa Nabi Musa · QS. Al-Qasas 28:24", "Doa ditampilkan bersama konteks ayat. Bukan janji memperoleh pekerjaan atau pasangan tertentu."),
  },
  {
    id: "dua-petunjuk", kind: "dua", title: "Memohon rahmat dan arah yang baik", themes: ["perlindungan", "ketidakpastian", "pertolongan"],
    arabic: TANZIL_GIFT_VERSES["18:10"],
    latin: "Iż awal-fityatu ilal-kahfi fa qālū rabbanā ātinā mil ladunka raḥmataw wa hayyi’ lanā min amrinā rasyadā.",
    meaning: "Ketika para pemuda berlindung ke dalam gua, mereka berkata, ‘Ya Tuhan kami, berilah kami rahmat dari sisi-Mu dan siapkanlah petunjuk yang benar bagi kami dalam urusan kami.’",
    source: quranSource("18:10", "Doa para pemuda · QS. Al-Kahf 18:10", "Ayat menyertakan konteks para pemuda mencari perlindungan."),
  },
  {
    id: "dua-keluarga", kind: "dua", title: "Menitipkan keluarga dalam doa", themes: ["keluarga", "relasi", "harapan"],
    arabic: TANZIL_GIFT_VERSES["25:74"],
    latin: "Wallażīna yaqūlūna rabbanā hab lanā min azwājinā wa żurriyyātinā qurrata a‘yuniw waj‘alnā lil-muttaqīna imāmā.",
    meaning: "Dan orang-orang yang berkata, ‘Ya Tuhan kami, anugerahkanlah kepada kami pasangan dan keturunan sebagai penyejuk mata, dan jadikanlah kami teladan bagi orang-orang yang bertakwa.’",
    source: quranSource("25:74", "QS. Al-Furqan 25:74", "Berdoa untuk keluarga tidak menghapus hak atas keselamatan dan dukungan."),
  },
  {
    id: "dua-adam", kind: "dua", title: "Kembali dengan mengakui kesalahan", themes: ["penyesalan", "ampunan", "memulai kembali"],
    arabic: TANZIL_GIFT_VERSES["7:23"],
    latin: "Qālā rabbanā ẓalamnā anfusanā wa il lam taghfir lanā wa tarḥamnā lanakūnanna minal-khāsirīn.",
    meaning: "Keduanya berkata, ‘Ya Tuhan kami, kami telah menzalimi diri kami sendiri. Jika Engkau tidak mengampuni dan merahmati kami, niscaya kami termasuk orang-orang yang rugi.’",
    source: quranSource("7:23", "Doa Adam dan istrinya · QS. Al-A‘raf 7:23"),
  },
  {
    id: "dua-ibrahim", kind: "dua", title: "Memohon keteguhan untuk keluarga", themes: ["kebiasaan", "keluarga", "harapan"],
    arabic: TANZIL_GIFT_VERSES["14:40"],
    latin: "Rabbij‘alnī muqīmaṣ-ṣalāti wa min żurriyyatī, rabbanā wa taqabbal du‘ā’.",
    meaning: "Ya Tuhanku, jadikanlah aku dan sebagian keturunanku orang yang tetap mendirikan salat. Ya Tuhan kami, perkenankanlah doaku.",
    source: quranSource("14:40", "Doa Nabi Ibrahim · QS. Ibrahim 14:40"),
  },
  {
    id: "dua-sulaiman", kind: "dua", title: "Memohon kemampuan untuk bersyukur", themes: ["syukur", "kebaikan", "keluarga"],
    arabic: TANZIL_GIFT_VERSES["27:19"],
    latin: "Fa tabassama ḍāḥikam min qaulihā wa qāla rabbi auzi‘nī an asykura ni‘matakallatī an‘amta ‘alayya wa ‘alā wālidayya wa an a‘mala ṣāliḥan tarḍāhu wa adkhilnī biraḥmatika fī ‘ibādikaṣ-ṣāliḥīn.",
    meaning: "Maka Sulaiman tersenyum tertawa karena perkataan semut itu, lalu berkata, ‘Ya Tuhanku, ilhamkanlah aku untuk mensyukuri nikmat-Mu yang Engkau anugerahkan kepadaku dan kedua orang tuaku, serta mengerjakan kebajikan yang Engkau ridai. Masukkanlah aku dengan rahmat-Mu ke dalam golongan hamba-hamba-Mu yang saleh.’",
    source: quranSource("27:19", "Doa Nabi Sulaiman · QS. An-Naml 27:19", "Doa ditampilkan bersama konteks ayat."),
  },
  {
    id: "quran-rahmat", kind: "quran", title: "Jangan berputus asa dari rahmat-Nya", themes: ["ampunan", "harapan", "memulai kembali"],
    arabic: TANZIL_GIFT_VERSES["39:53"],
    latin: "Qul yā ‘ibādiyallażīna asrafū ‘alā anfusihim lā taqnaṭū mir raḥmatillāh, innallāha yaghfiruż-żunūba jamī‘ā, innahū huwal-ghafūrur-raḥīm.",
    meaning: "Katakanlah, ‘Wahai hamba-hamba-Ku yang melampaui batas terhadap diri mereka sendiri, janganlah berputus asa dari rahmat Allah. Sungguh, Allah mengampuni dosa-dosa semuanya. Sungguh, Dialah Yang Maha Pengampun, Maha Penyayang.’",
    source: quranSource("39:53", "QS. Az-Zumar 39:53", "Baca bersama ajakan kembali kepada Allah pada ayat berikutnya; bukan pembenaran untuk menyakiti diri atau orang lain."),
  },
  {
    id: "quran-dekat", kind: "quran", title: "Ada ruang untuk berdoa", themes: ["kedekatan", "kesepian", "pertolongan"],
    arabic: TANZIL_GIFT_VERSES["2:186"],
    latin: "Wa iżā sa’alaka ‘ibādī ‘annī fa innī qarīb, ujību da‘watad-dā‘i iżā da‘ān, falyastajībū lī wal yu’minū bī la‘allahum yarsyudūn.",
    meaning: "Apabila hamba-hamba-Ku bertanya kepadamu tentang Aku, sesungguhnya Aku dekat. Aku mengabulkan permohonan orang yang berdoa apabila ia berdoa kepada-Ku. Maka hendaklah mereka memenuhi perintah-Ku dan beriman kepada-Ku agar memperoleh petunjuk.",
    source: quranSource("2:186", "QS. Al-Baqarah 2:186", "Bukan janji bahwa setiap permintaan terwujud dengan cara atau waktu yang kita tentukan."),
  },
  {
    id: "quran-tawakal", kind: "quran", title: "Bersandar sambil tetap berikhtiar", themes: ["rezeki", "ikhtiar", "ketidakpastian"],
    arabic: TANZIL_GIFT_VERSES["65:3"],
    latin: "Wa yarzuqhu min ḥaiṡu lā yaḥtasib, wa may yatawakkal ‘alallāhi fa huwa ḥasbuh, innallāha bālighu amrih, qad ja‘alallāhu likulli syai’in qadrā.",
    meaning: "Dan Dia memberinya rezeki dari arah yang tidak disangkanya. Barang siapa bertawakal kepada Allah, niscaya Allah mencukupinya. Sungguh, Allah melaksanakan urusan-Nya. Allah telah menetapkan ukuran bagi segala sesuatu.",
    source: quranSource("65:3", "QS. At-Talaq 65:3", "Baca bersama ayat 2 tentang ketakwaan. Tawakal berjalan bersama ikhtiar; bukan jaminan uang atau penyelesaian seketika."),
  },
  {
    id: "quran-syukur", kind: "quran", title: "Mengingat nikmat dengan syukur", themes: ["syukur", "kebaikan", "harapan"],
    arabic: TANZIL_GIFT_VERSES["14:7"],
    latin: "Wa iż ta’ażżana rabbukum la’in syakartum la’azīdannakum wa la’in kafartum inna ‘ażābī lasyadīd.",
    meaning: "Dan ketika Tuhanmu memaklumkan, ‘Jika kamu bersyukur, niscaya Aku akan menambah nikmat kepadamu. Tetapi jika kamu mengingkari nikmat-Ku, sesungguhnya azab-Ku sangat berat.’",
    source: quranSource("14:7", "QS. Ibrahim 14:7", "Syukur tidak berarti menolak rasa sedih atau menganggap kesulitan sebagai bukti kurang bersyukur."),
  },
  {
    id: "quran-mengenal", kind: "quran", title: "Saling mengenal tanpa merendahkan", themes: ["relasi", "merasa kurang", "kedekatan"],
    arabic: TANZIL_GIFT_VERSES["49:13"],
    latin: "Yā ayyuhan-nāsu innā khalaqnākum min żakariw wa unṡā wa ja‘alnākum syu‘ūbaw wa qabā’ila lita‘ārafū, inna akramakum ‘indallāhi atqākum, innallāha ‘alīmun khabīr.",
    meaning: "Wahai manusia, sungguh Kami menciptakan kamu dari seorang laki-laki dan seorang perempuan, dan menjadikan kamu berbangsa-bangsa serta bersuku-suku agar saling mengenal. Sungguh, yang paling mulia di antara kamu di sisi Allah ialah yang paling bertakwa. Sungguh, Allah Maha Mengetahui, Mahateliti.",
    source: quranSource("49:13", "QS. Al-Hujurat 49:13", "Bukan dasar untuk menilai ketakwaan seseorang dari kondisi atau cerita jurnalnya."),
  },
  {
    id: "quran-usaha", kind: "quran", title: "Memberi tempat bagi usaha", themes: ["ikhtiar", "belajar", "kebiasaan"],
    arabic: TANZIL_GIFT_VERSES["53:39"],
    latin: "Wa al laisa lil-insāni illā mā sa‘ā.",
    meaning: "Dan bahwa manusia hanya memperoleh apa yang telah diusahakannya.",
    source: quranSource("53:39", "QS. An-Najm 53:39", "Baca konteks ayat 38–42 tentang tanggung jawab dan balasan amal. Bukan jaminan bahwa semua target dunia pasti tercapai atau alasan menyalahkan orang yang kesulitan."),
  },
  {
    id: "quran-duha", kind: "quran", title: "Merenungkan penghiburan untuk Nabi", themes: ["kesepian", "duka", "harapan"],
    arabic: TANZIL_GIFT_VERSES["93:3"],
    latin: "Mā wadda‘aka rabbuka wa mā qalā.",
    meaning: "Tuhanmu tidak meninggalkanmu dan tidak pula membencimu.",
    source: quranSource("93:3", "QS. Ad-Duha 93:3", "Ayat ini ditujukan kepada Nabi Muhammad ﷺ. Hadiah mengajak merenungkan penghiburan tersebut, bukan mengklaim wahyu atau janji khusus untuk pembaca."),
  },
  {
    id: "quran-mengingat", kind: "quran", title: "Menyediakan jeda untuk mengingat-Nya", themes: ["zikir", "syukur", "tenang"],
    arabic: TANZIL_GIFT_VERSES["2:152"],
    latin: "Fażkurūnī ażkurkum wasykurū lī wa lā takfurūn.",
    meaning: "Maka ingatlah kepada-Ku, Aku pun akan mengingatmu. Bersyukurlah kepada-Ku dan janganlah kamu mengingkari-Ku.",
    source: quranSource("2:152", "QS. Al-Baqarah 2:152", "Mengingat Allah dapat berjalan bersama istirahat dan mencari dukungan yang dibutuhkan."),
  },
  {
    id: "hadith-ikhtiar", kind: "hadith", title: "Mengupayakan yang bermanfaat", themes: ["ikhtiar", "belajar", "harapan"],
    arabic: "احْرِصْ عَلَى مَا يَنْفَعُكَ وَاسْتَعِنْ بِاللَّهِ وَلاَ تَعْجِزْ",
    latin: "Iḥriṣ ‘alā mā yanfa‘uka wasta‘in billāhi wa lā ta‘jaz.",
    meaning: "Bersungguh-sungguhlah pada hal yang bermanfaat bagimu, mintalah pertolongan Allah, dan jangan menyerah.",
    source: { ...hadithSource("muslim:2664", "Penggalan Sahih Muslim 2664 · riwayat Abu Hurairah", "Bukan tuntutan untuk terus bekerja saat membutuhkan istirahat."), additional: [{ label: "Rujukan silang dan penilaian · Dorar, Sahih Muslim 2664", url: "https://dorar.net/h/Ov16uqG0" }] },
  },
  {
    id: "hadith-hak-diri", kind: "hadith", title: "Dirimu juga memiliki hak", themes: ["istirahat", "keseimbangan", "lelah"],
    arabic: "إِنَّ لِرَبِّكَ عَلَيْكَ حَقًّا، وَلِنَفْسِكَ عَلَيْكَ حَقًّا، وَلأَهْلِكَ عَلَيْكَ حَقًّا، فَأَعْطِ كُلَّ ذِي حَقٍّ حَقَّهُ",
    latin: "Inna lirabbika ‘alaika ḥaqqan, wa linafsika ‘alaika ḥaqqan, wa li’ahlika ‘alaika ḥaqqan, fa a‘ṭi kulla żī ḥaqqin ḥaqqah.",
    meaning: "Tuhanmu memiliki hak atasmu, dirimu memiliki hak atasmu, dan keluargamu memiliki hak atasmu. Maka berikanlah kepada setiap pemilik hak, haknya.",
    source: hadithSource("bukhari:1968", "Sahih al-Bukhari 1968 · nasihat Salman yang dibenarkan Nabi ﷺ", "Ini perkataan Salman dalam riwayat; Nabi ﷺ membenarkannya."),
  },
  {
    id: "hadith-kata-baik", kind: "hadith", title: "Kata baik pun berarti", themes: ["komunikasi", "kelembutan", "kebaikan"],
    arabic: "وَالْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ",
    latin: "Wal-kalimaṭuṭ-ṭayyibatu ṣadaqah.",
    meaning: "Dan perkataan yang baik adalah sedekah.",
    source: hadithSource("bukhari:2989", "Penggalan Sahih al-Bukhari 2989 · riwayat Abu Hurairah"),
  },
  {
    id: "hadith-dukungan", kind: "hadith", title: "Kebaikan dalam saling membantu", themes: ["dukungan", "pertolongan", "kesepian"],
    arabic: "وَاللَّهُ فِي عَوْنِ الْعَبْدِ مَا كَانَ الْعَبْدُ فِي عَوْنِ أَخِيهِ",
    latin: "Wallāhu fī ‘aunil-‘abdi mā kānal-‘abdu fī ‘auni akhīh.",
    meaning: "Allah menolong seorang hamba selama hamba itu menolong saudaranya.",
    source: hadithSource("muslim:2699a", "Penggalan Sahih Muslim 2699a · riwayat Abu Hurairah", "Membantu sesama tetap memperhatikan kemampuan dan keselamatan diri."),
  },
  {
    id: "hadith-jeda-marah", kind: "hadith", title: "Menjaga respons saat marah", themes: ["marah", "komunikasi", "relasi"],
    arabic: "لاَ تَغْضَبْ",
    latin: "Lā taghḍab.", meaning: "Jangan marah.",
    source: hadithSource("bukhari:6116", "Penggalan Sahih al-Bukhari 6116 · riwayat Abu Hurairah", "Nasihat untuk menjaga diri dari kemarahan; bukan larangan mengakui emosi atau membela diri dari kekerasan."),
  },
  {
    id: "hadith-hati-amal", kind: "hadith", title: "Memandang hati dan usaha", themes: ["merasa kurang", "memulai kembali", "ikhtiar"],
    arabic: "إِنَّ اللَّهَ لاَ يَنْظُرُ إِلَى صُوَرِكُمْ وَأَمْوَالِكُمْ وَلَكِنْ يَنْظُرُ إِلَى قُلُوبِكُمْ وَأَعْمَالِكُمْ",
    latin: "Innallāha lā yanẓuru ilā ṣuwarikum wa amwālikum wa lākin yanẓuru ilā qulūbikum wa a‘mālikum.",
    meaning: "Sesungguhnya Allah tidak melihat rupa dan harta kalian, tetapi melihat hati dan amal kalian.",
    source: hadithSource("muslim:2564c", "Matan Sahih Muslim 2564c · riwayat Abu Hurairah"),
  },
  {
    id: "hadith-kecil", kind: "hadith", title: "Jangan meremehkan kebaikan kecil", themes: ["kebaikan", "kebiasaan", "merasa kurang"],
    arabic: "لاَ تَحْقِرَنَّ مِنَ الْمَعْرُوفِ شَيْئًا وَلَوْ أَنْ تَلْقَى أَخَاكَ بِوَجْهٍ طَلْقٍ",
    latin: "Lā taḥqiranna minal-ma‘rūfi syai’an wa lau an talqā akhāka biwajhin ṭalq.",
    meaning: "Jangan meremehkan kebaikan sedikit pun, walaupun hanya menemui saudaramu dengan wajah yang ramah.",
    source: hadithSource("muslim:2626", "Matan Sahih Muslim 2626 · riwayat Abu Dzar", "Bukan kewajiban menutupi kesedihan dengan senyum."),
  },
  {
    id: "hadith-niat", kind: "hadith", title: "Kembali merawat niat", themes: ["memulai kembali", "kebiasaan", "belajar"],
    arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
    latin: "Innamal-a‘mālu bin-niyyāt, wa innamā likullimri’in mā nawā.",
    meaning: "Sesungguhnya amal bergantung pada niat, dan setiap orang mendapatkan sesuai apa yang diniatkannya.",
    source: hadithSource("bukhari:1", "Penggalan Sahih al-Bukhari 1 · riwayat Umar bin al-Khattab", "Tentang niat dalam amal; bukan janji bahwa setiap keinginan pasti menjadi kenyataan."),
  },
  {
    id: "story-yunus", kind: "story", title: "Yunus dan doa dalam kegelapan", themes: ["penyesalan", "sesak", "pertolongan"],
    paragraphs: [
      "Al-Qur’an menceritakan Yunus yang pergi dalam keadaan marah, lalu berseru dalam kegelapan. Ia mengakui kesalahannya dan memuji kesucian Allah.",
      "Ayat berikutnya menyebutkan bahwa Allah memperkenankan doanya dan menyelamatkannya dari kedukaan. Kisah ini memperlihatkan doa yang lahir dari keadaan yang sangat sulit.",
      "Refleksi editorial: kamu boleh jujur tentang kesulitan dan meminta pertolongan. Kisah ini bukan janji bahwa setiap masalah akan selesai dalam waktu atau cara yang sama.",
    ],
    source: storySource("21/87-88", "Kisah Nabi Yunus · QS. Al-Anbiya 21:87–88"),
  },
  {
    id: "story-yaqub", kind: "story", title: "Yaqub: duka dan harapan dapat berdampingan", themes: ["duka", "kehilangan", "harapan"],
    paragraphs: [
      "Dalam Surah Yusuf, Yaqub menyampaikan bahwa ia mengadukan kesusahan dan kesedihannya hanya kepada Allah. Kesedihan itu diungkapkan, bukan diingkari.",
      "Ia juga meminta anak-anaknya mencari kabar Yusuf dan saudaranya, serta mengingatkan agar tidak berputus asa dari rahmat Allah.",
      "Refleksi editorial: harapan tidak mengharuskanmu meniadakan duka. Ada ruang untuk mengakui rasa sedih sambil mencari dukungan dan menjalani upaya yang masih mungkin.",
    ],
    source: storySource("12/86-87", "Kisah Nabi Yaqub · QS. Yusuf 12:86–87"),
  },
  {
    id: "story-musa", kind: "story", title: "Musa: berbuat baik dan mengakui kebutuhan", themes: ["rezeki", "ikhtiar", "pertolongan"],
    paragraphs: [
      "Ketika sampai di sumber air Madyan, Musa melihat dua perempuan yang menahan ternaknya. Mereka menjelaskan bahwa mereka belum dapat memberi minum ternak sampai para penggembala selesai.",
      "Musa membantu memberi minum ternak keduanya. Setelah itu ia beranjak ke tempat teduh dan berdoa, mengakui kebutuhannya akan kebaikan dari Allah.",
      "Refleksi editorial: membantu orang lain dan mengakui kebutuhan sendiri dapat berjalan bersama. Doa ini bukan rumus untuk memperoleh pekerjaan atau pasangan tertentu.",
    ],
    source: storySource("28/23-24", "Kisah Nabi Musa · QS. Al-Qasas 28:23–24"),
  },
  {
    id: "story-perlindungan", kind: "story", title: "Para pemuda yang mencari perlindungan", themes: ["perlindungan", "dukungan", "ketidakpastian"],
    paragraphs: [
      "Surah Al-Kahf menceritakan para pemuda yang berlindung di sebuah gua. Mereka memohon rahmat dari Allah dan petunjuk yang baik dalam urusan mereka.",
      "Ayat-ayat berikutnya menceritakan bahwa Allah menidurkan mereka selama beberapa tahun, lalu membangunkan mereka. Mereka diperkenalkan sebagai para pemuda yang beriman dan mendapat tambahan petunjuk.",
      "Refleksi editorial: mencari tempat aman dan teman yang mendukung dapat menjadi bagian dari ikhtiar. Kisah ini tidak mengharuskanmu bertahan di tempat yang menyakitimu atau menunggu tanpa mencari bantuan.",
    ],
    source: storySource("18/10-13", "Kisah para pemuda · QS. Al-Kahf 18:10–13"),
  },
];
