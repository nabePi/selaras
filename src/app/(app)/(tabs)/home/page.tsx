import type { Metadata } from "next";
import { Icon } from "@/components/icon";
import { AssessmentCard } from "@/components/assessment-card";
import { JournalTodayCard } from "@/components/journal-today-card";
import { WisdomActions } from "@/components/wisdom-actions";
import { formatDateId } from "@/data/admin-prompts";
import { DAILY_WISDOM } from "@/data/member";
import { requireMemberPage } from "@/lib/server/session";
import { todayWib } from "@/lib/server/time";
import { isAssessmentVisible } from "@/server/admin/assessment";
import { getPromptForDate } from "@/server/admin/prompts";
import { hasCompletedAssessment } from "@/server/member/assessment";
import { getStreak, getTodayEntry, getWeek } from "@/server/member/journal";

export const metadata: Metadata = { title: "Home" };

const DAY_STYLES = {
  done: {
    cell: "bg-sage-tint text-primary",
    label: "font-medium text-primary",
    badge: "bg-primary text-on-primary shadow-xs",
    icon: "check",
  },
  pending: {
    cell: "bg-secondary-container text-secondary",
    label: "font-semibold text-secondary",
    badge: "bg-secondary text-on-secondary shadow-xs animate-pulse",
    icon: "hourglass_top",
  },
  upcoming: {
    cell: "bg-surface-container-low text-text-muted opacity-70",
    label: "font-normal",
    badge: "bg-surface-container-high",
    icon: null,
  },
  empty: {
    cell: "bg-surface-container-low text-text-muted opacity-70",
    label: "font-normal",
    badge: "bg-surface-container-high",
    icon: null,
  },
} as const;

const STATUS_TEXT = {
  done: "selesai",
  pending: "belum diisi, sedang berjalan",
  upcoming: "belum waktunya",
  empty: "tidak diisi",
} as const;

/** "5 – 11 Okt 2026"; bila melewati pergantian bulan/tahun: "29 Sep – 5 Okt 2026". */
function shortRange(from: string, to: string) {
  const [fd, fm, fy] = formatDateId(from).split(" ");
  const [td, tm, ty] = formatDateId(to).split(" ");
  const start = fy !== ty ? `${fd} ${fm} ${fy}` : fm !== tm ? `${fd} ${fm}` : fd;
  return `${start} – ${td} ${tm} ${ty}`;
}

export default async function HomePage() {
  const user = await requireMemberPage();
  const today = todayWib();
  const prompt = await getPromptForDate(today);
  const [entry, week, streak, preVisible, preDone, postVisible, postDone] = await Promise.all([
    getTodayEntry(user.id, prompt),
    getWeek(user.id),
    getStreak(user.id),
    isAssessmentVisible("pre"),
    hasCompletedAssessment(user.id, "pre"),
    isAssessmentVisible("post"),
    hasCompletedAssessment(user.id, "post"),
  ]);
  const firstName = user.name.split(" ")[0];
  const weekRange = shortRange(week.days[0].date, week.days[6].date);

  return (
    <div className="flex w-full flex-col gap-6">
      {/* 1. Sapaan & streak */}
      <section className="mt-1 flex flex-col gap-1">
        <div className="mt-1">
          <h1 className="t-headline-lg-mobile text-on-surface">
            Assalamu’alaikum, {firstName} 🌿
          </h1>
        </div>
      </section>

      {/* 2. Hadis harian */}
      <section
        className="relative w-full overflow-hidden rounded-4xl bg-surface-container shadow-md"
        aria-label="Nasihat hari ini"
      >
        <div
          className="relative flex h-52 w-full flex-col justify-between bg-cover bg-center p-5"
          style={{ backgroundImage: "url('/images/wisdom-bg.jpg')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/90 via-inverse-surface/60 to-inverse-surface/30" />
          <div className="relative z-10 flex items-center justify-between">
            <span className="t-label-sm inline-flex items-center gap-1.5 rounded-full bg-surface-bright/90 px-3 py-1 text-on-surface backdrop-blur-md">
              <Icon name="auto_stories" size={14} filled className="text-primary" />
              Hadis Harian
            </span>
            <WisdomActions shareText={DAILY_WISDOM.shareText} />
          </div>
          <div className="relative z-10 flex flex-col gap-1.5">
            <p className="t-quote leading-relaxed text-surface-bright italic">
              “{DAILY_WISDOM.quote}”
            </p>
            <div className="flex items-center justify-between pt-1 text-surface-container-high/90">
              <span className="t-label-sm tracking-wide">
                {DAILY_WISDOM.source} • Nasihat Hari Ini
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-accent-sunray uppercase">
                {DAILY_WISDOM.theme}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Assessment (hilang setelah diisi). Post hanya tampil bila admin menyalakannya. */}
      {preVisible && !preDone && (
        <AssessmentCard
          kind="pre"
          minutes={7}
          heading="Mulai dengan mengenali titik awalmu"
          body="Isi pre assessment singkat agar perjalanan refleksimu bisa dibandingkan dan terasa lebih bermakna."
        />
      )}
      {postVisible && !postDone && (
        <AssessmentCard
          kind="post"
          minutes={7}
          heading="Saatnya melihat perjalanan bertumbuhmu"
          body="Isi post assessment agar jawabanmu bisa dibandingkan dengan pre assessment dan perubahanmu terlihat."
        />
      )}

      {/* 3. Kalender streak jurnal */}
      <section
        aria-label="Streak jurnal"
        className="flex flex-col gap-2 rounded-4xl bg-surface-container-lowest p-4 shadow-sm"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <Icon name="calendar_month" size={18} className="text-primary" />
              <h2 className="t-title-sm text-on-surface">Streak Jurnal</h2>
            </div>
            <span className="t-label-sm text-text-muted">
              {weekRange} · {week.doneCount}/7 hari
            </span>
          </div>
          <span
            className={`t-label-md inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1 font-semibold ${
              streak > 0 ? "bg-secondary-container text-secondary" : "bg-surface-container text-text-muted"
            }`}
          >
            <Icon name="local_fire_department" size={16} filled={streak > 0} />
            {streak} hari beruntun
          </span>
        </div>
        <ul className="grid grid-cols-7 gap-1.5 pt-1">
          {week.days.map((d) => {
            const s = DAY_STYLES[d.status];
            return (
              <li
                key={d.date}
                aria-current={d.date === today ? "date" : undefined}
                className={`flex flex-col items-center gap-1 rounded-2xl p-2 ${s.cell} ${
                  d.date === today ? "ring-2 ring-primary ring-offset-1 ring-offset-surface-container-lowest" : ""
                }`}
              >
                <span className={`t-label-sm ${s.label}`}>
                  {d.label}
                  <span className="sr-only">
                    , {formatDateId(d.date)}, {STATUS_TEXT[d.status]}
                    {d.date === today ? ", hari ini" : ""}
                  </span>
                </span>
                <span aria-hidden="true" className={`t-title-sm leading-none ${d.date === today ? "font-bold text-primary" : "text-on-surface"}`}>
                  {Number(d.date.slice(8))}
                </span>
                <span
                  className={`flex size-7 items-center justify-center rounded-full ${s.badge}`}
                >
                  {s.icon ? (
                    <Icon name={s.icon} size={15} />
                  ) : (
                    <span className="size-1.5 rounded-full bg-text-muted/60" />
                  )}
                </span>
              </li>
            );
          })}
        </ul>
        <div className="mt-1 flex items-center gap-1.5 pt-2">
          <Icon name="spa" size={15} className="shrink-0 text-accent-coral" />
          <p className="t-body-sm text-text-muted">
            {entry
              ? streak > 1
                ? `Alhamdulillah, streak ${streak} harimu terjaga. Sampai jumpa besok.`
                : "Alhamdulillah, jurnal hari ini sudah tersimpan. Sampai jumpa besok."
              : streak > 0
                ? `Tulis jurnal hari ini untuk menjaga streak ${streak} harimu.`
                : "Mulai streak barumu dengan menulis jurnal hari ini."}
          </p>
        </div>
      </section>

      {/* 4. Jurnal hari ini */}
      <section aria-label="Jurnal hari ini" className="flex flex-col gap-2">
        <JournalTodayCard prompt={prompt} written={entry !== null} todayLabel={formatDateId(today)} />
      </section>
    </div>
  );
}
