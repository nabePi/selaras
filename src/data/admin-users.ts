import { MEMBER } from "@/data/member";

/**
 * Data contoh pengguna untuk halaman admin Users. Ganti dengan API.
 * Baris `current` adalah akun di /profil: nama, foto, dan keahliannya dibaca dari
 * penyimpanan peramban sehingga ikut berubah saat profil diedit.
 */
export type AdminUser = {
  id: string;
  name: string;
  avatar?: string;
  whatsapp: string;
  email: string;
  skills: string[];
  joined: string;
  status: "active" | "pending";
  current?: boolean;
};

export const ADMIN_USERS: AdminUser[] = [
  {
    id: "U-001",
    name: MEMBER.fullName,
    avatar: MEMBER.avatar,
    whatsapp: MEMBER.whatsapp,
    email: MEMBER.email,
    skills: [],
    joined: "2026-09-24",
    status: "active",
    current: true,
  },
  {
    id: "U-002",
    name: "Rizky Pratama",
    whatsapp: "0813 2211 4455",
    email: "rizky.pratama@email.com",
    skills: ["Desain Grafis", "Public Speaking"],
    joined: "2026-09-24",
    status: "active",
  },
  {
    id: "U-003",
    name: "Nabila Rahmawati",
    whatsapp: "0857 1020 3344",
    email: "nabila.rahma@email.com",
    skills: ["Menulis", "Memasak", "Parenting"],
    joined: "2026-09-25",
    status: "active",
  },
  {
    id: "U-004",
    name: "Fauzan Hakim",
    whatsapp: "0821 9087 6612",
    email: "fauzan.hakim@email.com",
    skills: ["Keuangan Keluarga"],
    joined: "2026-09-27",
    status: "pending",
  },
  {
    id: "U-005",
    name: "Aisyah Nurul",
    whatsapp: "0878 5543 2109",
    email: "aisyah.nurul@email.com",
    skills: [],
    joined: "2026-09-30",
    status: "pending",
  },
];
