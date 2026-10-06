import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { ADMIN_USERS } from "../src/data/admin-users";
import { ASSESSMENT_SETS, type AssessmentKind } from "../src/data/assessment";
import { getAssessmentResponses } from "../src/data/assessment-responses";
import { JOURNAL_PROMPTS } from "../src/data/journal-prompts";
import { getPromptResponses } from "../src/data/prompt-responses";
import { hashPassword } from "../src/lib/server/password";
import { ensureAdmin } from "./ensure-admin";

/**
 * Mengisi database dengan data contoh yang sama dengan tampilan admin sebelum ada backend
 * (src/data/*). Aman dijalankan ulang: data contoh hanya dibuat bila belum ada peserta;
 * akun admin dibuat bila emailnya belum ada (password tidak pernah ditimpa).
 *
 * Peserta dibuat lebih dulu agar id-nya cocok dengan kode contoh (U-001 …, P-001 …).
 */
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const KIND = { pre: "PRE", post: "POST" } as const;
const TYPE = { text: "TEXT", scale: "SCALE", choice: "CHOICE", mood: "MOOD" } as const;
const STATUS = { draf: "DRAF", terjadwal: "TERJADWAL", terbit: "TERBIT" } as const;
const ATTACHMENT = { image: "IMAGE", audio: "AUDIO", video: "VIDEO" } as const;

const numberOf = (code: string) => Number(code.replace(/\D/g, ""));

async function seedMembers() {
  // Semua peserta contoh memakai password yang sama agar mudah dites (ganti di .env).
  const passwordHash = await hashPassword(process.env.SEED_MEMBER_PASSWORD || "selaras123");
  for (const u of ADMIN_USERS) {
    await db.user.create({
      data: {
        name: u.name,
        email: u.email,
        whatsapp: u.whatsapp,
        passwordHash,
        role: "MEMBER",
        status: u.status === "active" ? "ACTIVE" : "PENDING",
        avatarUrl: u.avatar ?? null,
        skills: u.skills,
        joinedAt: new Date(`${u.joined}T08:00:00+07:00`),
        activatedAt: u.status === "active" ? new Date(`${u.joined}T09:00:00+07:00`) : null,
      },
    });
  }
}

async function seedAssessments() {
  const itemIds: Record<AssessmentKind, Map<string, number>> = { pre: new Map(), post: new Map() };
  for (const kind of ["pre", "post"] as const) {
    for (const [position, it] of ASSESSMENT_SETS[kind].entries()) {
      const row = await db.assessmentItem.create({
        data: {
          kind: KIND[kind],
          part: it.part === "mindset" ? "MINDSET" : "HABIT",
          dimension: it.dimension,
          text: it.text,
          position,
        },
      });
      itemIds[kind].set(it.id, row.id);
    }
    for (const r of getAssessmentResponses(kind)) {
      if (!r.answeredAt) continue;
      await db.assessmentResponse.create({
        data: {
          kind: KIND[kind],
          userId: numberOf(r.userId),
          answeredAt: new Date(`${r.answeredAt}T10:00:00+07:00`),
          answers: {
            create: Object.entries(r.answers).map(([sampleId, value]) => ({
              itemId: itemIds[kind].get(sampleId)!,
              value,
            })),
          },
        },
      });
    }
  }
}

async function seedPrompts() {
  const ordered = [...JOURNAL_PROMPTS].sort((a, b) => numberOf(a.id) - numberOf(b.id));
  for (const p of ordered) {
    const row = await db.journalPrompt.create({
      data: {
        title: p.title,
        subtitle: p.subtitle,
        date: new Date(`${p.date}T00:00:00Z`),
        status: STATUS[p.status],
        questions: {
          create: p.questions.map((q, position) => ({
            position,
            type: TYPE[q.type],
            label: q.label,
            options: q.options ?? [],
          })),
        },
      },
      include: { questions: { orderBy: { position: "asc" } } },
    });
    if (p.status !== "terbit") continue;

    for (const r of getPromptResponses(p)) {
      if (!r.answeredAt) continue;
      const [hh, mm] = r.answeredAt.replace(" WIB", "").split(".");
      await db.promptResponse.create({
        data: {
          promptId: row.id,
          userId: numberOf(r.userId),
          date: new Date(`${p.date}T00:00:00Z`),
          answeredAt: new Date(`${p.date}T${hh}:${mm}:00+07:00`),
          answers: {
            // Jawaban contoh berurutan sama dengan pertanyaannya.
            create: r.answers.map((a, i) => ({ questionId: row.questions[i].id, value: a.value })),
          },
          attachments: {
            create: r.attachments.map((a) => ({
              kind: ATTACHMENT[a.kind],
              title: a.title,
              src: "src" in a ? a.src : null,
              poster: "poster" in a ? a.poster : null,
              meta: "meta" in a ? a.meta : null,
            })),
          },
        },
      });
    }
  }
}

const HOUR = 3_600_000;

/** Notifikasi contoh untuk peserta aktif yang belum punya notifikasi sama sekali. */
async function seedNotifications() {
  const users = await db.user.findMany({
    where: { role: "MEMBER", status: "ACTIVE", notifications: { none: {} } },
    select: { id: true },
  });
  const now = Date.now();
  for (const u of users) {
    await db.notification.createMany({
      data: [
        {
          userId: u.id,
          kind: "REFLEKSI",
          title: "Jurnal Hari Ini Menunggu",
          body: "Luangkan beberapa menit untuk menulis jurnal hari ini.",
          detail:
            "Assalamu’alaikum. Prompt jurnal hari ini sudah tersedia.\n\nLuangkan sekitar 3 menit untuk menuliskan perasaanmu. Tidak perlu sempurna: yang terpenting jujur dan tanpa filter. Setiap rasa berharga untuk diselaraskan.",
          href: "/journal/tulis",
          actionLabel: "Tulis Jurnal Sekarang",
          createdAt: new Date(now - 2 * HOUR),
        },
        {
          userId: u.id,
          kind: "PESAN",
          title: "Pesan dari Fasilitator",
          body: "Jangan ragu menghubungi tim pendamping jika ada yang ingin didiskusikan.",
          detail:
            "Halo, kami dari tim pendamping Selaras Life.\n\nJika ada hal yang ingin kamu diskusikan, baik soal materi, jurnal, maupun kendala teknis, silakan hubungi kami kapan saja. Kami siap mendampingimu dengan hangat dan tanpa menghakimi.",
          createdAt: new Date(now - 26 * HOUR),
        },
        {
          userId: u.id,
          kind: "HADIS",
          title: "Hadis Harian Baru",
          body: "Sebaik-baik kalian adalah yang paling baik terhadap keluarganya.",
          detail:
            "“Sebaik-baik kalian adalah yang paling baik terhadap keluarganya.”\n\n(HR. Tirmidzi)\n\nTema hari ini: Refleksi Kelembutan. Coba satu tindakan kecil yang lembut kepada pasanganmu hari ini.",
          readAt: new Date(now - 24 * HOUR),
          createdAt: new Date(now - 50 * HOUR),
        },
      ],
    });
  }
  if (users.length) console.log(`Notifikasi contoh dibuat untuk ${users.length} peserta.`);
}

async function main() {
  if ((await db.user.count({ where: { role: "MEMBER" } })) === 0) {
    await seedMembers();
    await seedAssessments();
    await seedPrompts();
    console.log("Data contoh peserta, assessment, dan prompt dibuat.");
  } else {
    console.log("Data contoh sudah ada; dilewati.");
  }
  await seedNotifications();
  await ensureAdmin(db);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
