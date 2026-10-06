"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { formatDateId } from "@/data/admin-prompts";
import {
  ASSESSMENT_KINDS,
  ASSESSMENT_PARTS,
  scoreBand,
  type AssessmentItem,
  type AssessmentKind,
  type AssessmentPart,
} from "@/data/assessment";
import type { AssessmentResponse } from "@/data/assessment-responses";
import { deleteAssessmentItem, saveAssessmentItem, setAssessmentVisibility } from "@/lib/admin-actions";
import { Dialog, DialogActions, FieldLabel, fieldClass } from "../dialog";
import { Icon } from "../icon";
import { useToast } from "../toast-provider";
import { PageHeader, btnPrimary } from "./page-header";

type Tab = "soal" | "peserta";
const PARTS: AssessmentPart[] = ["mindset", "habit"];

export function AssessmentManager({
  kind,
  items: initialItems,
  responses,
  visible: initialVisible,
}: {
  kind: AssessmentKind;
  items: AssessmentItem[];
  responses: AssessmentResponse[];
  visible: boolean;
}) {
  const { showToast } = useToast();
  const meta = ASSESSMENT_KINDS[kind];
  const [tab, setTab] = useState<Tab>("soal");
  const [items, setItems] = useState<AssessmentItem[]>(initialItems);
  // `null` = dialog tertutup; `{}` tanpa id = soal baru.
  const [editing, setEditing] = useState<Partial<AssessmentItem> | null>(null);
  const [deleting, setDeleting] = useState<AssessmentItem | null>(null);
  const [busy, setBusy] = useState(false);
  const [visible, setVisible] = useState(initialVisible);
  const [togglingVisible, setTogglingVisible] = useState(false);

  const done = responses.filter((r) => r.answeredAt).length;

  async function save(values: Omit<AssessmentItem, "id">) {
    const result = await saveAssessmentItem(kind, {
      id: editing?.id,
      ...values,
    });
    if (!result.ok) return showToast(result.error);
    const saved = result.data;
    if (editing?.id) {
      setItems((list) => list.map((it) => (it.id === saved.id ? saved : it)));
      showToast("Soal berhasil diperbarui.", { tone: "success" });
    } else {
      setItems((list) => [...list, saved]);
      showToast(`Soal baru ditambahkan ke ${meta.title}.`, { tone: "success" });
    }
    setEditing(null);
  }

  async function toggleVisible() {
    const next = !visible;
    setTogglingVisible(true);
    const result = await setAssessmentVisibility(kind, next);
    setTogglingVisible(false);
    if (!result.ok) return showToast(result.error);
    setVisible(next);
    showToast(
      next
        ? `${meta.title} sekarang tampil di halaman Home peserta.`
        : `${meta.title} disembunyikan dari peserta.`,
      { tone: "success" },
    );
  }

  async function confirmDelete() {
    if (!deleting) return;
    setBusy(true);
    const result = await deleteAssessmentItem(kind, deleting.id);
    setBusy(false);
    if (!result.ok) return showToast(result.error);
    setItems((list) => list.filter((it) => it.id !== deleting.id));
    showToast("Soal dihapus.", { tone: "success" });
    setDeleting(null);
  }

  return (
    <div className="mx-auto w-full max-w-[1720px] space-y-8 px-4 py-8 sm:px-8 lg:p-10">
      <PageHeader
        pill={meta.title}
        pulse={false}
        meta={`${items.length} soal · ${done}/${responses.length} peserta sudah mengisi`}
        title={`Kelola ${meta.title}`}
        description={`Soal di sini tampil di halaman /${kind}-assessment milik peserta. Pantau juga siapa yang sudah dan belum mengisi beserta jawabannya.`}
        actions={
          tab === "soal" && (
            <button
              type="button"
              onClick={() => setEditing({})}
              className={btnPrimary}
            >
              <Icon name="add" size={18} />
              <span>Tambah Soal</span>
            </button>
          )
        }
      />

      {kind === "post" && (
        <section className="flex items-center justify-between gap-4 rounded-3xl bg-canvas-ivory p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sage-tint text-primary">
              <Icon name={visible ? "visibility" : "visibility_off"} size={20} />
            </span>
            <div>
              <h2 id="visible-label" className="t-title-sm text-on-surface">
                Tampilkan ke peserta
              </h2>
              <p className={`t-body-sm ${visible ? "font-medium text-primary" : "text-text-muted"}`}>
                {visible
                  ? "Aktif · section Post Assessment tampil di Home peserta yang belum mengisi."
                  : "Nonaktif · peserta belum melihat Post Assessment."}
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={visible}
            aria-labelledby="visible-label"
            disabled={togglingVisible}
            onClick={toggleVisible}
            className={`relative h-7 w-12 shrink-0 rounded-full p-0.5 transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60 ${
              visible ? "bg-primary" : "bg-canvas-sand"
            }`}
          >
            <span
              className={`block size-6 rounded-full bg-surface-container-lowest shadow-sm transition-transform duration-300 ${
                visible ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </section>
      )}

      <div role="tablist" aria-label="Bagian halaman" className="flex gap-2">
        {(
          [
            ["soal", "Soal"],
            ["peserta", "Jawaban Peserta"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            onClick={() => setTab(value)}
            className={`t-label-md rounded-full px-5 py-2 transition-colors ${
              tab === value
                ? "bg-primary text-on-primary shadow-sm"
                : "bg-canvas-ivory text-on-surface hover:bg-surface-container-low"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "soal" ? (
        <div className="space-y-6">
          <p className="t-body-sm rounded-2xl bg-canvas-ivory p-4 text-text-muted shadow-sm">
            Soal Pre dan Post sebaiknya identik agar skor bisa dibandingkan.
            Mengubah soal setelah ada peserta yang mengisi akan memengaruhi
            perbandingan tersebut.
          </p>
          {PARTS.map((part) => {
            const list = items.filter((it) => it.part === part);
            return (
              <section
                key={part}
                className="overflow-hidden rounded-3xl bg-canvas-ivory shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-4">
                  <h2 className="t-title-md text-on-surface">
                    {ASSESSMENT_PARTS[part].title} ({list.length})
                  </h2>
                  <span className="t-label-sm text-text-muted">
                    Skala: {ASSESSMENT_PARTS[part].scale[0]} →{" "}
                    {ASSESSMENT_PARTS[part].scale[4]}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <caption className="sr-only">
                      Soal {ASSESSMENT_PARTS[part].title}
                    </caption>
                    <thead>
                      <tr className="t-label-sm bg-surface-container-low tracking-wider text-text-muted uppercase">
                        <th scope="col" className="py-3 pr-4 pl-6">
                          No
                        </th>
                        <th scope="col" className="px-4 py-3">
                          Dimensi
                        </th>
                        <th scope="col" className="px-4 py-3">
                          Pernyataan
                        </th>
                        <th scope="col" className="py-3 pr-6 pl-4 text-right">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="t-body-md divide-y divide-surface-container">
                      {list.length === 0 && (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-6 py-8 text-center text-text-muted"
                          >
                            Belum ada soal di bagian ini.
                          </td>
                        </tr>
                      )}
                      {list.map((it, i) => (
                        <tr key={it.id} className="align-top">
                          <td className="t-body-sm py-3.5 pr-4 pl-6 text-text-muted">
                            {i + 1}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="t-label-sm rounded-full bg-sage-tint px-2.5 py-1 whitespace-nowrap text-primary">
                              {it.dimension}
                            </span>
                          </td>
                          <td className="t-body-sm px-4 py-3.5 text-on-surface">
                            {it.text}
                          </td>
                          <td className="py-3.5 pr-6 pl-4">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                aria-label={`Edit soal ${i + 1} ${ASSESSMENT_PARTS[part].title}`}
                                onClick={() => setEditing(it)}
                                className="rounded-full p-2 text-text-muted transition-colors hover:bg-surface-container-low hover:text-on-surface"
                              >
                                <Icon name="edit" size={18} />
                              </button>
                              <button
                                type="button"
                                aria-label={`Hapus soal ${i + 1} ${ASSESSMENT_PARTS[part].title}`}
                                onClick={() => setDeleting(it)}
                                className="rounded-full p-2 text-text-muted transition-colors hover:bg-surface-container-low hover:text-error"
                              >
                                <Icon name="delete" size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <Participants kind={kind} responses={responses} />
      )}

      <Dialog
        open={editing !== null}
        onClose={() => setEditing(null)}
        eyebrow={meta.title}
        title={editing?.id ? "Edit Soal" : "Tambah Soal"}
      >
        <ItemForm
          initial={editing ?? {}}
          onCancel={() => setEditing(null)}
          onSave={save}
        />
      </Dialog>

      <Dialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        eyebrow={meta.title}
        title="Hapus Soal"
        size="sm"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void confirmDelete();
          }}
          className="space-y-4"
        >
          <p className="t-body-md text-text-muted">
            Soal berikut akan dihapus dari {meta.title}:
          </p>
          <p className="t-body-md rounded-2xl bg-canvas-ivory p-3 text-on-surface">
            “{deleting?.text}”
          </p>
          <DialogActions
            onCancel={() => setDeleting(null)}
            submitLabel="Hapus Soal"
            submitting={busy}
          />
        </form>
      </Dialog>
    </div>
  );
}

function ItemForm({
  initial,
  onCancel,
  onSave,
}: {
  initial: Partial<AssessmentItem>;
  onCancel: () => void;
  onSave: (values: Omit<AssessmentItem, "id">) => Promise<void>;
}) {
  const [part, setPart] = useState<AssessmentPart>(initial.part ?? "mindset");
  const [dimension, setDimension] = useState(initial.dimension ?? "");
  const [text, setText] = useState(initial.text ?? "");
  const [errors, setErrors] = useState<{ dimension?: string; text?: string }>(
    {},
  );
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (dimension.trim().length < 3) next.dimension = "Isi nama dimensi.";
    if (text.trim().length < 10)
      next.text = "Tulis pernyataan minimal 10 karakter.";
    setErrors(next);
    if (next.dimension || next.text) return;
    setSaving(true);
    await onSave({ part, dimension: dimension.trim(), text: text.trim() });
    setSaving(false);
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div className="space-y-1">
        <span className="t-label-sm text-text-muted">Bagian</span>
        <div role="radiogroup" aria-label="Bagian soal" className="flex gap-2">
          {PARTS.map((p) => (
            <button
              key={p}
              type="button"
              role="radio"
              aria-checked={part === p}
              onClick={() => setPart(p)}
              className={`t-label-md rounded-full px-4 py-2 transition-colors ${
                part === p
                  ? "bg-primary text-on-primary shadow-sm"
                  : "bg-canvas-ivory text-on-surface hover:bg-surface-container-low"
              }`}
            >
              {ASSESSMENT_PARTS[p].title}
            </button>
          ))}
        </div>
        <p className="t-body-sm text-text-muted">
          {ASSESSMENT_PARTS[part].hint}
        </p>
      </div>

      <div className="space-y-1">
        <FieldLabel htmlFor="item-dimension">Dimensi</FieldLabel>
        <input
          id="item-dimension"
          value={dimension}
          maxLength={50}
          onChange={(e) => setDimension(e.target.value)}
          placeholder="cth: Circle Awareness"
          className={`${fieldClass} ${errors.dimension ? "ring-2 ring-error" : ""}`}
        />
        {errors.dimension && (
          <p role="alert" className="t-body-sm text-error">
            {errors.dimension}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <FieldLabel htmlFor="item-text">Pernyataan</FieldLabel>
        <textarea
          id="item-text"
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Saya …"
          className={`${fieldClass} resize-none ${errors.text ? "ring-2 ring-error" : ""}`}
        />
        {errors.text && (
          <p role="alert" className="t-body-sm text-error">
            {errors.text}
          </p>
        )}
      </div>

      <DialogActions
        onCancel={onCancel}
        submitLabel={initial.id ? "Simpan Perubahan" : "Tambah Soal"}
        submitting={saving}
      />
    </form>
  );
}

function Participants({
  kind,
  responses,
}: {
  kind: AssessmentKind;
  responses: AssessmentResponse[];
}) {
  const done = responses.filter((r) => r.answeredAt).length;
  const rate = responses.length
    ? Math.round((done / responses.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          {
            label: "Total peserta",
            value: responses.length,
            tone: "text-on-surface",
          },
          { label: "Sudah mengisi", value: done, tone: "text-primary" },
          {
            label: "Belum mengisi",
            value: responses.length - done,
            tone: "text-secondary",
          },
          {
            label: "Tingkat pengisian",
            value: `${rate}%`,
            tone: "text-on-surface",
          },
        ].map((c) => (
          <div
            key={c.label}
            className="rounded-3xl bg-canvas-ivory p-5 shadow-sm"
          >
            <dt className="t-label-sm text-text-muted">{c.label}</dt>
            <dd className={`t-headline-md mt-1 ${c.tone}`}>{c.value}</dd>
          </div>
        ))}
      </dl>

      <div className="overflow-hidden rounded-3xl bg-canvas-ivory shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">
              Status pengisian assessment per peserta
            </caption>
            <thead>
              <tr className="t-label-sm bg-surface-container-low tracking-wider text-text-muted uppercase">
                <th scope="col" className="py-4 pr-4 pl-6">
                  Peserta
                </th>
                <th scope="col" className="px-4 py-4">
                  Status
                </th>
                <th scope="col" className="px-4 py-4">
                  Tanggal Mengisi
                </th>
                <th scope="col" className="px-4 py-4">
                  Mindset
                </th>
                <th scope="col" className="px-4 py-4">
                  Daily Habit
                </th>
                <th scope="col" className="py-4 pr-6 pl-4 text-right">
                  Jawaban
                </th>
              </tr>
            </thead>
            <tbody className="t-body-md divide-y divide-surface-container">
              {responses.map((r) => (
                <tr key={r.userId} className="align-middle">
                  <td className="py-3.5 pr-4 pl-6">
                    <div className="flex items-center gap-3">
                      <Avatar name={r.name} src={r.avatar} size={36} />
                      <span className="t-title-sm text-on-surface">
                        {r.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`t-label-sm rounded-full px-3 py-1 font-semibold ${
                        r.answeredAt
                          ? "bg-sage-tint text-primary"
                          : "bg-secondary-container text-secondary"
                      }`}
                    >
                      {r.answeredAt ? "Sudah mengisi" : "Belum mengisi"}
                    </span>
                  </td>
                  <td className="t-body-sm px-4 py-3.5 whitespace-nowrap text-text-muted">
                    {r.answeredAt ? formatDateId(r.answeredAt) : "-"}
                  </td>
                  <td className="px-4 py-3.5">
                    <Score value={r.scores.mindset} />
                  </td>
                  <td className="px-4 py-3.5">
                    <Score value={r.scores.habit} />
                  </td>
                  <td className="py-3.5 pr-6 pl-4 text-right">
                    {r.answeredAt ? (
                      <Link
                        href={`/admin/assessment/${kind}/${r.userId}`}
                        className="t-label-md inline-flex items-center gap-1.5 rounded-full bg-surface-container-low px-4 py-2 whitespace-nowrap text-on-surface transition-colors hover:bg-surface-container"
                      >
                        Lihat Jawaban
                        <Icon name="arrow_forward" size={16} />
                      </Link>
                    ) : (
                      <span className="t-body-sm text-text-muted">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function Avatar({
  name,
  src,
  size,
}: {
  name: string;
  src?: string;
  size: number;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className="t-label-md flex shrink-0 items-center justify-center rounded-full bg-sage-tint text-primary"
      style={{ width: size, height: size }}
    >
      {name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()}
    </span>
  );
}

function Score({ value }: { value: number | null }) {
  if (value === null)
    return <span className="t-body-sm text-text-muted">-</span>;
  const band = scoreBand(value);
  return (
    <div className="flex flex-col items-start gap-1">
      <span className="t-title-sm text-on-surface">{value.toFixed(1)}</span>
      <span
        className={`t-label-sm rounded-full px-2.5 py-0.5 whitespace-nowrap ${band.tone}`}
      >
        {band.label}
      </span>
    </div>
  );
}
