export type TeamMember = {
  slug: string;
  name: string;
  nickname?: string;
  role: string;
  credentials: string;
  photo: string;
};

export const TEAM: TeamMember[] = [
  {
    slug: "laras",
    name: "Laras Adhianti, S.T., AMANI",
    role: "Founder Selaras Laktasi",
    credentials:
      "Certified breastfeeding counselor, AMANI childbirth educator, Arugaan lactation massage practitioner",
    photo: "/images/tim/laras.jpg",
  },
  {
    slug: "anggit",
    name: "Anggit Oktafiania, S.T.",
    role: "Co-founder Selaras Life",
    credentials:
      "Certified marriage & family counselor, alumnus Inspire-Psy (Imanic Spiritual Education Psychology), alumnus Sekolah Pemberdayaan Aktivis Muslimah Jurusan Penggerak Opini Islam dan Geostrategi Dakwah Islam, aktivis dakwah",
    photo: "/images/tim/anggit.jpg",
  },
  {
    slug: "ezie",
    name: "Ershy Rafanti, S.Psi., LCPC",
    nickname: "Ezie",
    role: "Konselor Pernikahan & Keluarga",
    credentials:
      "Certified marriage & family counselor, wellness coach, essence of life practitioner, Maxwell Leadership Certified Team",
    photo: "/images/tim/ezie.jpg",
  },
  {
    slug: "anis",
    name: "Apt. Nisrina, S.Farm",
    nickname: "Anis",
    role: "Konselor Menyusui",
    credentials: "Certified breastfeeding counselor",
    photo: "/images/tim/anis.jpg",
  },
  {
    slug: "embun",
    name: "Ramdhania Wukufianti, SKM., CPYT",
    nickname: "Embun",
    role: "Prenatal Yoga & Pendamping Persalinan",
    credentials:
      "Certified prenatal yoga teacher, breastfeeding counselor, doula, hypnobirthing practitioner",
    photo: "/images/tim/embun.jpg",
  },
  {
    slug: "andini",
    name: "Andini Lestari, S.Si.",
    role: "Business Operations",
    credentials: "Finance lead, strategic partnership",
    photo: "/images/tim/andini.jpg",
  },
  {
    slug: "mei",
    name: "Meidivira Halimatussa'diyah",
    nickname: "Mei",
    role: "Creative Impact Strategist",
    credentials: "Photographer, videographer, editor, content creator",
    photo: "/images/tim/mei.jpg",
  },
  {
    slug: "fiqih",
    name: "Fiqih Utami Lesmantary",
    role: "Visual Designer",
    credentials: "Customer engagement lead",
    photo: "/images/tim/fiqih.jpg",
  },
];
