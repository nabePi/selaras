import { MAIN_PROGRAM, OPEN_CLASSES, WHATSAPP_NUMBER } from "@/data/programs";
import { TEAM } from "@/data/team";

export const SITE_URL = "https://selaras.life";
export const SITE_NAME = "Selaras Life";

/** Judul dan deskripsi utama situs; kata kunci utama ada di depan agar muncul di hasil pencarian. */
export const SITE_TITLE = "Selaras Life — Kelas & Konseling Pernikahan, Kehamilan, Menyusui, dan Keluarga Muslim";
export const SITE_DESCRIPTION =
  "Selaras Life membersamai keluarga muslim hidup selaras wahyu dan kembali kepada fitrah: kelas & konseling pernikahan, kehamilan, melahirkan, menyusui, menjadi orang tua, kesehatan mental, dan women wellness bersama konselor bersertifikat.";

/** Dipakai di meta keywords (diabaikan Google, tetap berguna untuk mesin pencari lain). */
export const SITE_KEYWORDS = [
  "Selaras Life",
  "Selaras Fitrah",
  "Selaras Wahyu",
  "hidup selaras wahyu",
  "hidup selaras",
  "Selaras Laktasi",
  "Selaras Moments",
  "kelas pernikahan",
  "konseling pernikahan",
  "konseling keluarga muslim",
  "kelas kehamilan",
  "persalinan fitrah",
  "birth in fitrah",
  "kelas menyusui",
  "konselor menyusui",
  "pijat laktasi",
  "menjadi orang tua",
  "parenting islami",
  "kesehatan mental",
  "women wellness",
  "prenatal yoga",
  "keluarga sakinah",
  "marriage life",
];

export const INSTAGRAM_URLS = [
  "https://www.instagram.com/selaras.life/",
  "https://www.instagram.com/selaraslaktasi/",
  "https://www.instagram.com/selarasmoments/",
];

const abs = (path: string) => `${SITE_URL}${path}`;

/** Organisasi induk beserta merek di bawahnya. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: ["Selaras", "Selaras Fitrah", "Selaras Laktasi", "Selaras Moments", "Hidup Selaras Wahyu"],
    url: SITE_URL,
    logo: abs("/images/logo-mark.png"),
    image: abs("/images/logo-header.png"),
    description: SITE_DESCRIPTION,
    slogan: "Your companion for every season of life",
    areaServed: { "@type": "Country", name: "Indonesia" },
    knowsAbout: [
      "Pernikahan",
      "Konseling keluarga",
      "Kehamilan",
      "Persalinan",
      "Menyusui",
      "Parenting",
      "Kesehatan mental",
      "Women wellness",
    ],
    sameAs: INSTAGRAM_URLS,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      telephone: `+${WHATSAPP_NUMBER}`,
      availableLanguage: "Indonesian",
      url: `https://wa.me/${WHATSAPP_NUMBER}`,
    },
    member: TEAM.map((m) => ({
      "@type": "Person",
      name: m.name,
      jobTitle: m.role,
      description: m.credentials,
      image: abs(m.photo),
    })),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    inLanguage: "id-ID",
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

/** Program utama dan kelas rutin sebagai Course (provider: Selaras Life). */
export function coursesJsonLd() {
  const provider = { "@type": "Organization", name: SITE_NAME, sameAs: SITE_URL };
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Course",
        name: MAIN_PROGRAM.title,
        description: MAIN_PROGRAM.description,
        provider,
        image: abs(MAIN_PROGRAM.image),
        url: abs("/program"),
        inLanguage: "id-ID",
        hasCourseInstance: {
          "@type": "CourseInstance",
          courseMode: "Online",
          instructor: MAIN_PROGRAM.facilitators.map((f) => ({ "@type": "Person", name: f.name })),
        },
      },
      ...OPEN_CLASSES.map((c) => ({
        "@type": "Course",
        name: c.title,
        description: c.description,
        provider,
        image: abs(c.image),
        url: abs("/program"),
        inLanguage: "id-ID",
        audience: { "@type": "Audience", audienceType: c.audience },
        hasCourseInstance: {
          "@type": "CourseInstance",
          instructor: { "@type": "Person", name: c.facilitator.name, description: c.facilitator.credentials },
        },
      })),
    ],
  };
}
