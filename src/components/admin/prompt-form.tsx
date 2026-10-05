"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
  QUESTION_TYPES,
  type JournalPrompt,
  type PromptQuestion,
  type QuestionType,
} from "@/data/journal-prompts";
import { savePromptJurnal } from "@/lib/admin-actions";
import { fieldClass, FieldLabel } from "../dialog";
import { Icon } from "../icon";
import { PromptQuestions } from "../prompt-questions";
import { useToast } from "../toast-provider";
import { btnPrimary, btnSoft } from "./page-header";

type Errors = {
  title?: string;
  date?: string;
  form?: string;
  questions: Record<string, string>;
};

/** Tambah prompt baru, atau edit prompt yang belum terbit bila `initial` diberikan. */
export function PromptForm({ initial }: { initial?: JournalPrompt }) {
  const router = useRouter();
  const { showToast } = useToast();
  const nextId = useRef(initial ? initial.questions.length + 100 : 2);
  const newQuestion = (type: QuestionType): PromptQuestion => ({
    id: `q${nextId.current++}`,
    type,
    label: "",
    options: type === "choice" ? ["", ""] : undefined,
  });

  const [title, setTitle] = useState(initial?.title ?? "");
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? "");
  const [date, setDate] = useState(initial?.date ?? "");
  const [questions, setQuestions] = useState<PromptQuestion[]>(
    () =>
      initial?.questions.map((q) => ({
        ...q,
        options: q.options && [...q.options],
      })) ?? [{ id: "q1", type: "text", label: "" }],
  );
  const [errors, setErrors] = useState<Errors>({ questions: {} });
  const [saving, setSaving] = useState(false);

  const update = (id: string, patch: Partial<PromptQuestion>) =>
    setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, ...patch } : q)));

  function changeType(q: PromptQuestion, type: QuestionType) {
    update(q.id, {
      type,
      options: type === "choice" ? (q.options ?? ["", ""]) : undefined,
    });
  }

  function move(index: number, dir: -1 | 1) {
    setQuestions((qs) => {
      const next = [...qs];
      const target = index + dir;
      if (target < 0 || target >= next.length) return qs;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function validate(): Errors {
    const e: Errors = { questions: {} };
    if (title.trim().length < 3) e.title = "Isi judul minimal 3 karakter.";
    if (!date) e.date = "Pilih tanggal tayang.";
    if (questions.length === 0) e.form = "Tambahkan minimal satu pertanyaan.";
    for (const q of questions) {
      if (q.label.trim().length < 5)
        e.questions[q.id] = "Tulis pertanyaan minimal 5 karakter.";
      else if (
        q.type === "choice" &&
        (q.options ?? []).filter((o) => o.trim()).length < 2
      )
        e.questions[q.id] = "Opsi ganda butuh minimal 2 pilihan yang terisi.";
    }
    return e;
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (e.title || e.date || e.form || Object.keys(e.questions).length) return;
    setSaving(true);
    const result = await savePromptJurnal({ title, subtitle, date, questions });
    setSaving(false);
    if (!result.ok) return showToast(result.error);
    showToast(
      initial
        ? `Perubahan prompt “${title.trim()}” disimpan.`
        : `Prompt “${title.trim()}” disimpan dan akan tayang pada tanggal yang dipilih.`,
      { tone: "success" },
    );
    router.push("/admin/prompt");
  }

  const errorText = (msg?: string) =>
    msg && (
      <p role="alert" className="t-body-sm text-error">
        {msg}
      </p>
    );

  return (
    <div className="mx-auto w-full max-w-[1720px] space-y-8 px-4 py-8 sm:px-8 lg:p-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="t-label-sm inline-flex items-center gap-1.5 rounded-full bg-sage-tint px-3 py-1 tracking-wide text-primary">
            <span className="size-1.5 rounded-full bg-primary" />
            {initial ? "Edit Prompt" : "Tambah Prompt"}
          </span>
          {initial && (
            <>
              <span className="t-body-sm text-text-muted" aria-hidden="true">
                •
              </span>
              <span className="t-body-sm text-text-muted">{initial.id}</span>
            </>
          )}
        </div>
        <Link
          href={initial ? `/admin/prompt/${initial.id}` : "/admin/prompt"}
          className={btnSoft}
        >
          <Icon name="arrow_back" size={18} />
          <span>{initial ? "Kembali ke Detail" : "Kembali ke Daftar"}</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-7">
          <header className="max-w-3xl space-y-2">
            <h1 className="t-headline-lg tracking-tight text-on-surface">
              {initial ? initial.title : "Tambah Prompt"}
            </h1>
            <p className="t-body-md leading-relaxed text-text-muted">
              Prompt akan muncul di halaman tulis jurnal peserta pada tanggal
              yang dipilih.
            </p>
          </header>

          <form onSubmit={submit} noValidate className="space-y-6">
            <section className="space-y-4 rounded-3xl bg-canvas-ivory p-6 shadow-sm">
              <div className="space-y-1">
                <FieldLabel htmlFor="prompt-title">Judul</FieldLabel>
                <input
                  id="prompt-title"
                  value={title}
                  maxLength={80}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="cth: Hal Kecil yang Dihargai"
                  className={`${fieldClass} ${errors.title ? "ring-2 ring-error" : ""}`}
                />
                {errorText(errors.title)}
              </div>
              <div className="space-y-1">
                <FieldLabel htmlFor="prompt-subtitle">Subjudul</FieldLabel>
                <input
                  id="prompt-subtitle"
                  value={subtitle}
                  maxLength={140}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Catatan singkat di bawah judul (opsional)"
                  className={fieldClass}
                />
              </div>
              <div className="space-y-1">
                <FieldLabel htmlFor="prompt-date">Tanggal tayang</FieldLabel>
                <input
                  id="prompt-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`${fieldClass} ${errors.date ? "ring-2 ring-error" : ""}`}
                />
                {errorText(errors.date)}
              </div>
            </section>

            <section className="space-y-4" aria-label="Daftar pertanyaan">
              <h2 className="t-title-md text-on-surface">
                Pertanyaan ({questions.length})
              </h2>
              {questions.map((q, i) => (
                <div
                  key={q.id}
                  className="space-y-4 rounded-3xl bg-canvas-ivory p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="t-label-md font-semibold text-primary">
                      Pertanyaan {i + 1}
                    </span>
                    <div className="flex items-center">
                      <button
                        type="button"
                        aria-label="Naikkan pertanyaan"
                        disabled={i === 0}
                        onClick={() => move(i, -1)}
                        className="rounded-full p-1.5 text-text-muted transition-colors hover:bg-surface-container-low disabled:opacity-30"
                      >
                        <Icon name="arrow_upward" size={18} />
                      </button>
                      <button
                        type="button"
                        aria-label="Turunkan pertanyaan"
                        disabled={i === questions.length - 1}
                        onClick={() => move(i, 1)}
                        className="rounded-full p-1.5 text-text-muted transition-colors hover:bg-surface-container-low disabled:opacity-30"
                      >
                        <Icon name="arrow_downward" size={18} />
                      </button>
                      <button
                        type="button"
                        aria-label="Hapus pertanyaan"
                        onClick={() =>
                          setQuestions((qs) => qs.filter((x) => x.id !== q.id))
                        }
                        className="rounded-full p-1.5 text-text-muted transition-colors hover:bg-surface-container-low hover:text-error"
                      >
                        <Icon name="delete" size={18} />
                      </button>
                    </div>
                  </div>

                  <div
                    role="radiogroup"
                    aria-label="Tipe pertanyaan"
                    className="flex flex-wrap gap-2"
                  >
                    {QUESTION_TYPES.map((t) => {
                      const active = q.type === t.value;
                      return (
                        <button
                          key={t.value}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => changeType(q, t.value)}
                          className={`t-label-md flex items-center gap-1.5 rounded-full px-3.5 py-2 transition-colors ${
                            active
                              ? "bg-primary text-on-primary shadow-sm"
                              : "bg-canvas-cream text-on-surface hover:bg-surface-container-low"
                          }`}
                        >
                          <Icon name={t.icon} size={16} />
                          {t.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="space-y-1">
                    <FieldLabel htmlFor={`label-${q.id}`}>
                      Teks pertanyaan
                    </FieldLabel>
                    <textarea
                      id={`label-${q.id}`}
                      rows={2}
                      value={q.label}
                      onChange={(e) => update(q.id, { label: e.target.value })}
                      placeholder="Tulis pertanyaan untuk peserta…"
                      className={`${fieldClass} resize-none ${errors.questions[q.id] ? "ring-2 ring-error" : ""}`}
                    />
                    {errorText(errors.questions[q.id])}
                  </div>

                  {q.type === "choice" && (
                    <div className="space-y-2">
                      <span className="t-label-sm text-text-muted">
                        Pilihan jawaban
                      </span>
                      {(q.options ?? []).map((o, oi) => (
                        <div key={oi} className="flex items-center gap-2">
                          <input
                            aria-label={`Pilihan ${oi + 1}`}
                            value={o}
                            onChange={(e) =>
                              update(q.id, {
                                options: (q.options ?? []).map((x, xi) =>
                                  xi === oi ? e.target.value : x,
                                ),
                              })
                            }
                            placeholder={`Pilihan ${oi + 1}`}
                            className={fieldClass}
                          />
                          <button
                            type="button"
                            aria-label={`Hapus pilihan ${oi + 1}`}
                            disabled={(q.options ?? []).length <= 2}
                            onClick={() =>
                              update(q.id, {
                                options: (q.options ?? []).filter(
                                  (_, xi) => xi !== oi,
                                ),
                              })
                            }
                            className="rounded-full p-1.5 text-text-muted transition-colors hover:text-error disabled:opacity-30"
                          >
                            <Icon name="close" size={18} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() =>
                          update(q.id, { options: [...(q.options ?? []), ""] })
                        }
                        className="t-label-md flex items-center gap-1 text-primary hover:underline"
                      >
                        <Icon name="add" size={16} />
                        Tambah pilihan
                      </button>
                    </div>
                  )}

                  {q.type === "scale" && (
                    <p className="t-body-sm text-text-muted">
                      Peserta memilih angka 1 sampai 10.
                    </p>
                  )}
                  {q.type === "mood" && (
                    <p className="t-body-sm text-text-muted">
                      Peserta memilih salah satu dari lima perasaan (Sedih
                      sampai Bahagia).
                    </p>
                  )}
                </div>
              ))}

              {errorText(errors.form)}

              <div className="space-y-2 rounded-3xl bg-canvas-ivory p-5 shadow-sm">
                <span className="t-label-sm text-text-muted">
                  Tambah pertanyaan
                </span>
                <div className="flex flex-wrap gap-2">
                  {QUESTION_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() =>
                        setQuestions((qs) => [...qs, newQuestion(t.value)])
                      }
                      className={btnSoft}
                    >
                      <Icon name={t.icon} size={18} className="text-primary" />
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <div className="flex items-center justify-end gap-3">
              <Link
                href="/admin/prompt"
                className="t-title-sm rounded-full px-5 py-2.5 text-on-surface-variant hover:bg-canvas-ivory"
              >
                Batal
              </Link>
              <button type="submit" disabled={saving} className={btnPrimary}>
                {saving
                  ? "Menyimpan..."
                  : initial
                    ? "Simpan Perubahan"
                    : "Simpan Prompt"}
              </button>
            </div>
          </form>
        </div>

        <aside
          aria-label="Pratinjau"
          className="space-y-3 xl:sticky xl:top-24 xl:col-span-5"
        >
          <div className="flex items-center gap-2 px-1">
            <Icon name="smartphone" size={20} className="text-primary" />
            <span className="t-title-sm font-semibold text-on-surface">
              Pratinjau di Jurnal Peserta
            </span>
          </div>
          <div className="mx-auto max-h-[75dvh] w-full max-w-[420px] space-y-4 overflow-y-auto rounded-4xl bg-surface p-4 shadow-md">
            <div className="space-y-1 px-1">
              <h2 className="t-headline-md leading-snug text-on-surface">
                {title.trim() || "Judul prompt"}
              </h2>
              {subtitle.trim() && (
                <p className="t-body-sm text-text-muted">{subtitle}</p>
              )}
            </div>
            <PromptQuestions questions={questions} />
          </div>
        </aside>
      </div>
    </div>
  );
}
