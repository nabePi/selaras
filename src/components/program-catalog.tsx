"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  MAIN_PROGRAM,
  OPEN_CLASSES,
  PAST_PROGRAMS,
  buildWhatsappLink,
  type OpenClass,
  type PastProgram,
} from "@/data/programs";
import { FilterPills } from "./filter-pills";
import { Icon } from "./icon";

const SECTION_FILTERS = [
  { value: "all", label: "Semua Program" },
  { value: "utama", label: "Program Utama" },
  { value: "rutin", label: "Kelas Rutin" },
  { value: "arsip", label: "Arsip Program" },
] as const;

type SectionFilter = (typeof SECTION_FILTERS)[number]["value"];

export function ProgramCatalog() {
  const [filter, setFilter] = useState<SectionFilter>("all");

  const showMain = filter === "all" || filter === "utama";
  const showOpen = filter === "all" || filter === "rutin";
  const showPast = filter === "all" || filter === "arsip";

  return (
    <>
      <section className="flex flex-col pb-6">
        <FilterPills
          label="Filter kategori program"
          options={[...SECTION_FILTERS]}
          value={filter}
          onChange={setFilter}
        />
      </section>

      {showMain && (
        <section className="flex flex-col pb-8">
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="t-title-md font-semibold text-on-surface">
              Program Utama Terdekat
            </h2>
            <span className="t-label-sm flex items-center gap-1 font-medium text-primary">
              <span className="size-2 animate-pulse rounded-full bg-primary" />
              Pendaftaran Dibuka
            </span>
          </div>

          <MainProgramCard />
        </section>
      )}

      {showOpen && (
        <section className="flex flex-col pb-8">
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="t-title-md font-semibold text-on-surface">
              Kelas Rutin — Selalu Dibuka
            </h2>
            <span className="t-body-sm text-text-muted">Selaras Laktasi</span>
          </div>
          <ul className="flex flex-col gap-4">
            {OPEN_CLASSES.map((c) => (
              <li key={c.id}>
                <OpenClassCard openClass={c} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {showPast && (
        <section className="flex flex-col pb-8">
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="t-title-md font-semibold text-on-surface">
              Arsip Program
            </h2>
            <span className="t-body-sm text-text-muted">Sudah Berlangsung</span>
          </div>
          <p className="t-body-sm mb-3 px-1 text-text-muted">
            Jejak program yang pernah diselenggarakan Selaras Life agar Anda
            tahu perjalanan kami sejauh ini.
          </p>
          <ul className="flex flex-col gap-4">
            {PAST_PROGRAMS.map((p) => (
              <li key={p.id}>
                <PastProgramCard program={p} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

function MainProgramCard() {
  const F = MAIN_PROGRAM;
  const activeTier = F.pricing.find((t) => t.active) ?? F.pricing[F.pricing.length - 1];

  return (
    <article className="flex flex-col overflow-hidden rounded-3xl bg-canvas-ivory shadow-sm">
      <div className="relative h-56 w-full overflow-hidden">
        <Image
          src={F.image}
          alt={`Poster program ${F.title}`}
          fill
          sizes="(max-width: 480px) 100vw, 440px"
          className="object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-canvas-ivory via-transparent to-black/10" />
        <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5">
          <span className="t-label-sm flex items-center gap-1 rounded-full bg-surface/90 px-3 py-1 font-semibold text-primary shadow-sm backdrop-blur-md">
            <Icon name="event_available" size={14} /> {F.period}
          </span>
        </div>
      </div>

      <div className="relative -mt-4 flex flex-col rounded-t-3xl bg-canvas-ivory p-5">
        <h3 className="t-headline-sm mb-1 font-medium text-on-surface">
          {F.title}
        </h3>
        <p className="t-body-sm mb-3 leading-relaxed text-text-muted italic">
          “{F.tagline}”
        </p>
        <p className="t-body-md mb-4 leading-relaxed text-text-muted">
          {F.description}
        </p>

        <div className="mb-4 flex flex-col gap-2.5 rounded-2xl bg-surface p-3.5">
          <span className="t-title-sm flex items-center gap-1.5 font-semibold text-on-surface">
            <Icon name="menu_book" size={18} className="text-primary" />
            Rangkaian Sesi
          </span>
          <ol className="t-body-sm flex flex-col gap-2 text-text-muted">
            {F.sessions.map((s, i) => (
              <li key={s.title} className="flex items-start gap-2">
                <span className="t-label-sm mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-sage-tint font-bold text-primary">
                  {i + 1}
                </span>
                <span>
                  <strong className="font-medium text-on-surface">
                    {s.date}:
                  </strong>{" "}
                  {s.title}{" "}
                  <span className="text-text-muted">· {s.format}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="mb-4 flex flex-col gap-3 rounded-2xl bg-surface-container-low p-3.5">
          <span className="t-title-sm flex items-center gap-1.5 font-semibold text-on-surface">
            <Icon name="diversity_1" size={18} className="text-secondary" />
            Fasilitator
          </span>
          {F.facilitators.map((f) => (
            <div key={f.name} className="flex items-center gap-2.5">
              <Image
                src={f.photo}
                alt={f.name}
                width={40}
                height={40}
                className="size-10 shrink-0 rounded-full object-cover object-top"
              />
              <div className="t-body-sm text-text-muted">
                <strong className="font-medium text-on-surface">
                  {f.name}
                </strong>
                <br />
                {f.role}
              </div>
            </div>
          ))}
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2">
          {F.includes.map((inc) => (
            <div
              key={inc.label}
              className="flex items-center gap-2 rounded-xl bg-surface-container-low p-2.5"
            >
              <Icon name={inc.icon} size={20} className="text-primary" />
              <span className="t-body-sm font-medium text-on-surface">
                {inc.label}
              </span>
            </div>
          ))}
        </div>

        <div className="mb-4 flex flex-col gap-1.5 rounded-2xl bg-surface p-3.5">
          {F.pricing.map((tier) => (
            <div
              key={tier.label}
              className={`flex items-center justify-between gap-2 rounded-xl px-2.5 py-1.5 ${
                tier.active ? "bg-sage-tint" : ""
              }`}
            >
              <div className="flex flex-col">
                <span
                  className={`t-label-sm font-semibold ${
                    tier.active ? "text-primary" : "text-text-muted"
                  }`}
                >
                  {tier.label}
                </span>
                <span className="t-body-sm text-text-muted">{tier.period}</span>
              </div>
              <span
                className={`t-title-sm font-bold ${
                  tier.active ? "text-primary" : "text-text-muted line-through"
                }`}
              >
                {tier.price}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 pt-1">
          <div className="flex items-baseline justify-between gap-2">
            <div className="flex flex-col">
              <span className="t-label-sm text-text-muted">
                Investasi Saat Ini
              </span>
              <span className="t-title-lg font-bold text-primary">
                {activeTier.price}
              </span>
            </div>
            <span className="t-label-sm text-text-muted">
              IG {F.instagram} · WA {F.whatsapp}
            </span>
          </div>
          <div className="flex flex-col gap-2.5 pt-1">
            <Link
              href={F.registrationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="t-title-sm flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-on-primary shadow-md transition-all hover:bg-primary-container active:scale-[0.98]"
            >
              <span>Daftar {F.title}</span>
              <Icon name="arrow_forward" size={18} />
            </Link>
            <Link
              href={buildWhatsappLink(
                `Halo Selaras Life, saya ingin tahu lebih lanjut tentang program ${F.title}.`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="t-title-sm flex min-h-11 items-center justify-center gap-2 rounded-full bg-surface px-4 py-3 text-on-surface shadow-sm transition-colors hover:bg-surface-container-low"
            >
              <Icon name="chat" size={18} className="text-primary" />
              <span>Tanya via WhatsApp</span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function OpenClassCard({ openClass: c }: { openClass: OpenClass }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-3xl bg-surface-container-low shadow-sm">
      <div className="relative h-44 w-full overflow-hidden">
        <Image
          src={c.image}
          alt={`Poster kelas ${c.title}`}
          fill
          sizes="(max-width: 480px) 100vw, 440px"
          className="object-cover object-top"
        />
        <span className="t-label-sm absolute top-3 left-3 rounded-full bg-sage-tint/95 px-3 py-1 font-semibold text-primary shadow-sm backdrop-blur-md">
          Selalu Dibuka
        </span>
      </div>
      <div className="flex flex-col p-4">
        <h3 className="t-title-md font-semibold text-on-surface">{c.title}</h3>
        <p className="t-label-sm mb-2 font-medium text-secondary">
          {c.subtitle}
        </p>
        <p className="t-body-sm mb-3 text-text-muted">{c.description}</p>

        <ul className="t-body-sm mb-3 flex flex-col gap-1.5 text-text-muted">
          {c.topics.map((t) => (
            <li key={t} className="flex items-start gap-1.5">
              <Icon
                name="check_circle"
                size={16}
                filled
                className="mt-0.5 shrink-0 text-primary"
              />
              <span>{t}</span>
            </li>
          ))}
        </ul>

        <div className="mb-3 flex items-center gap-2.5 rounded-xl bg-surface p-3">
          <Image
            src={c.facilitator.photo}
            alt={c.facilitator.name}
            width={40}
            height={40}
            className="size-10 shrink-0 rounded-full object-cover object-top"
          />
          <div className="flex flex-col">
            <span className="t-label-sm font-semibold text-on-surface">
              {c.facilitator.name}
            </span>
            <span className="t-body-sm text-text-muted">
              {c.facilitator.credentials}
            </span>
          </div>
        </div>

        <div className="t-body-sm mb-3 flex flex-col gap-1 text-text-muted">
          <span className="flex items-center gap-1.5">
            <Icon name="schedule" size={16} /> {c.schedule}
          </span>
          <span className="flex items-center gap-1.5">
            <Icon name="group" size={16} /> {c.audience}
          </span>
        </div>

        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="t-title-sm font-bold text-primary">{c.price}</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={buildWhatsappLink(
              `Halo Selaras Life, saya ingin tahu lebih lanjut tentang kelas ${c.title}.`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="t-title-sm flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-on-surface shadow-sm transition-all active:scale-95"
          >
            <Icon name="chat" size={16} className="text-primary" />
            <span>Tanya via WA</span>
          </Link>
          <Link
            href={c.registrationLink}
            target="_blank"
            rel="noopener noreferrer"
            className="t-title-sm flex min-h-11 flex-1 items-center justify-center rounded-full bg-primary px-3 py-1.5 text-on-primary shadow-sm transition-all active:scale-95"
          >
            Daftar Kelas
          </Link>
        </div>
      </div>
    </article>
  );
}

function PastProgramCard({ program: p }: { program: PastProgram }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-3xl bg-surface-container-low opacity-90 shadow-sm">
      <div className="relative h-40 w-full overflow-hidden">
        <Image
          src={p.image}
          alt={`Dokumentasi program ${p.title}`}
          fill
          sizes="(max-width: 480px) 100vw, 440px"
          className="object-cover object-top grayscale-[15%]"
        />
        <span className="t-label-sm absolute top-3 left-3 rounded-full bg-surface-dim/95 px-3 py-1 font-medium text-text-muted shadow-sm backdrop-blur-md">
          Program Telah Selesai
        </span>
      </div>
      <div className="flex flex-col p-4">
        <h3 className="t-title-md font-semibold text-on-surface">{p.title}</h3>
        <p className="t-label-sm mb-2 font-medium text-secondary">
          {p.subtitle}
        </p>
        <p className="t-body-sm mb-3 text-text-muted">{p.description}</p>
        <ul className="t-body-sm mb-3 flex flex-col gap-1 text-text-muted">
          {p.highlights.map((h) => (
            <li key={h} className="flex items-start gap-1.5">
              <Icon
                name="history_edu"
                size={16}
                className="mt-0.5 shrink-0 text-text-muted"
              />
              <span>{h}</span>
            </li>
          ))}
        </ul>
        <div className="t-body-sm mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-text-muted">
          <span className="flex items-center gap-1.5">
            <Icon name="calendar_month" size={16} /> {p.period}
          </span>
          {p.location && (
            <span className="flex items-center gap-1.5">
              <Icon name="location_on" size={16} /> {p.location}
            </span>
          )}
        </div>
        <Link
          href={buildWhatsappLink(
            `Halo Selaras Life, saya ingin tahu lebih lanjut tentang program ${p.title}.`,
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="t-title-sm flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-surface px-4 py-1.5 text-on-surface shadow-sm transition-all active:scale-95"
        >
          <Icon name="chat" size={16} className="text-primary" />
          <span>Tanya Program Ini</span>
        </Link>
      </div>
    </article>
  );
}
