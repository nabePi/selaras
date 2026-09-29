"use client";

import { useState } from "react";
import { SCALE_LABELS, type Dimension, type Question, type ScaleKind } from "@/data/admin-curriculum";
import { saveQuestion } from "@/lib/admin-actions";
import { Dialog, DialogActions, FieldLabel, fieldClass } from "../dialog";

export type QuestionDraft = Pick<Question, "statement" | "description" | "dimension" | "subDimension" | "scale">;

export function QuestionDialog({
  open,
  onClose,
  editing,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  editing: Question | null;
  onSave: (draft: QuestionDraft) => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} size="lg" eyebrow="Bank Soal Pre/Post" title={editing ? `Ubah Butir ${String(editing.no).padStart(2, "0")}` : "Tambah Butir Soal"}>
      <QuestionForm onClose={onClose} editing={editing} onSave={onSave} />
    </Dialog>
  );
}

function QuestionForm({ onClose, editing, onSave }: { onClose: () => void; editing: Question | null; onSave: (d: QuestionDraft) => void }) {
  const [statement, setStatement] = useState(editing?.statement ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [dimension, setDimension] = useState<Dimension>(editing?.dimension ?? "mindset");
  const [subDimension, setSubDimension] = useState(editing?.subDimension ?? "");
  const [scale, setScale] = useState<ScaleKind>(editing?.scale ?? "agreement");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (statement.trim().length < 15) next.statement = "Tulis pernyataan minimal 15 karakter.";
    if (statement.trim().length > 200) next.statement = "Pernyataan maksimal 200 karakter.";
    if (subDimension.trim().length < 3) next.subDimension = "Isi sub-dimensi (mis. Keterbukaan).";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    const draft: QuestionDraft = { statement: statement.trim(), description: description.trim(), dimension, subDimension: subDimension.trim(), scale };
    const result = await saveQuestion(draft);
    setSaving(false);
    if (!result.ok) return setErrors({ form: result.error });
    onSave(draft);
    onClose();
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div className="space-y-1">
        <FieldLabel htmlFor="q-statement" hint={<span>{statement.length}/200</span>}>Butir pernyataan reflektif</FieldLabel>
        <textarea id="q-statement" rows={3} maxLength={200} value={statement} onChange={(e) => { setStatement(e.target.value); setErrors((x) => ({ ...x, statement: "" })); }} placeholder="Saya merasa aman mengutarakan…" className={`${fieldClass} resize-none leading-relaxed`} aria-invalid={!!errors.statement} />
        {errors.statement && <p role="alert" className="t-body-sm text-error">{errors.statement}</p>}
      </div>
      <div className="space-y-1">
        <FieldLabel htmlFor="q-desc">Keterangan pengukuran (opsional)</FieldLabel>
        <input id="q-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Mengukur…" className={fieldClass} />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <FieldLabel htmlFor="q-dimension">Dimensi</FieldLabel>
          <select id="q-dimension" value={dimension} onChange={(e) => setDimension(e.target.value as Dimension)} className={`${fieldClass} cursor-pointer`}>
            <option value="mindset">Mindset Pasutri</option>
            <option value="habit">Habit Rumah Tangga</option>
          </select>
        </div>
        <div className="space-y-1">
          <FieldLabel htmlFor="q-sub">Sub-dimensi</FieldLabel>
          <input id="q-sub" value={subDimension} onChange={(e) => { setSubDimension(e.target.value); setErrors((x) => ({ ...x, subDimension: "" })); }} placeholder="Keterbukaan" className={fieldClass} aria-invalid={!!errors.subDimension} />
          {errors.subDimension && <p role="alert" className="t-body-sm text-error">{errors.subDimension}</p>}
        </div>
        <div className="space-y-1">
          <FieldLabel htmlFor="q-scale">Format skala</FieldLabel>
          <select id="q-scale" value={scale} onChange={(e) => setScale(e.target.value as ScaleKind)} className={`${fieldClass} cursor-pointer`}>
            <option value="agreement">Likert 1–5 · Setuju</option>
            <option value="frequency">Likert 1–5 · Frekuensi</option>
          </select>
        </div>
      </div>
      <p className="t-body-sm text-text-muted">Label skala: {SCALE_LABELS[scale]}</p>
      {errors.form && <p role="alert" className="t-body-sm rounded-xl bg-error-container px-3 py-2 text-error">{errors.form}</p>}
      <DialogActions onCancel={onClose} submitLabel={editing ? "Simpan Perubahan" : "Tambah Butir"} submitting={saving} />
    </form>
  );
}
