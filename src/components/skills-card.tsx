"use client";

import { useState } from "react";
import { api } from "@/lib/api-client";
import { Icon } from "./icon";
import { useToast } from "./toast-provider";

const MAX_SKILLS = 15;
const MAX_LENGTH = 30;

/** Input multi tag untuk potensi/keahlian; setiap perubahan langsung disimpan ke server. */
export function SkillsCard({ initialSkills }: { initialSkills: string[] }) {
  const { showToast } = useToast();
  const [skills, setSkills] = useState(initialSkills);
  const [draft, setDraft] = useState("");

  /** Tampilkan perubahan lebih dulu; kembalikan bila server menolak. */
  async function save(next: string[]) {
    const previous = skills;
    setSkills(next);
    const result = await api<{ skills: string[] }>("/api/profile", "PATCH", { skills: next });
    if (!result.ok) {
      setSkills(previous);
      showToast(result.error);
    }
  }

  /** Menambah satu atau beberapa tag (dipisah koma); duplikat diabaikan tanpa membedakan huruf. */
  function addTags(input: string) {
    const next = [...skills];
    for (const part of input.split(",")) {
      const tag = part.trim().replace(/\s+/g, " ").slice(0, MAX_LENGTH);
      if (!tag || next.length >= MAX_SKILLS) continue;
      if (next.some((s) => s.toLowerCase() === tag.toLowerCase())) continue;
      next.push(tag);
    }
    if (next.length !== skills.length) save(next);
    setDraft("");
  }

  const full = skills.length >= MAX_SKILLS;

  return (
    <section className="flex flex-col gap-3 rounded-4xl bg-surface-container-low p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon name="psychiatry" size={18} className="text-primary" />
          <h2 className="t-title-sm text-on-surface">Potensi &amp; Keahlian</h2>
        </div>
        <span className="t-label-sm text-text-muted">
          {skills.length}/{MAX_SKILLS}
        </span>
      </div>

      <div
        className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-surface-container-lowest p-2.5 shadow-xs focus-within:ring-2 focus-within:ring-primary"
        onClick={(e) => e.currentTarget.querySelector("input")?.focus()}
      >
        {skills.map((skill) => (
          <span
            key={skill}
            className="t-label-sm inline-flex items-center gap-1 rounded-full bg-sage-tint py-1 pr-1 pl-3 text-primary"
          >
            {skill}
            <button
              type="button"
              aria-label={`Hapus ${skill}`}
              onClick={() => save(skills.filter((s) => s !== skill))}
              className="flex size-5 items-center justify-center rounded-full transition-colors hover:bg-primary/15"
            >
              <Icon name="close" size={14} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={draft}
          maxLength={MAX_LENGTH}
          disabled={full}
          aria-label="Tambah potensi atau keahlian"
          placeholder={skills.length ? "Tambah lagi…" : "Contoh: Menulis, Memasak"}
          onChange={(e) => {
            if (e.target.value.includes(",")) addTags(e.target.value);
            else setDraft(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTags(draft);
            } else if (e.key === "Backspace" && !draft && skills.length) {
              save(skills.slice(0, -1));
            }
          }}
          onBlur={() => draft.trim() && addTags(draft)}
          className="t-body-md min-w-32 flex-1 bg-transparent px-1 py-1 text-on-surface outline-none placeholder:text-text-muted"
        />
      </div>
      <p className="t-body-sm text-text-muted">
        {full
          ? "Batas tag tercapai. Hapus salah satu untuk menambah yang baru."
          : "Ketik lalu tekan Enter atau koma untuk menambah tag."}
      </p>
    </section>
  );
}
