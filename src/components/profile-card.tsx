"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { api } from "@/lib/api-client";
import { isEmail } from "@/lib/validation";
import type { Profile } from "@/server/member/profile";
import { Dialog, DialogActions, FieldLabel, fieldClass } from "./dialog";
import { Icon } from "./icon";
import { useToast } from "./toast-provider";

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const AVATAR_SIZE = 512;

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new window.Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Foto tidak dapat dibaca."));
    };
    image.src = url;
  });
}

async function prepareAvatar(file: File) {
  const image = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = AVATAR_SIZE;
  canvas.height = AVATAR_SIZE;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Foto tidak dapat diproses.");

  const sourceSize = Math.min(image.naturalWidth, image.naturalHeight);
  const sourceX = (image.naturalWidth - sourceSize) / 2;
  const sourceY = (image.naturalHeight - sourceSize) / 2;

  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceSize,
    sourceSize,
    0,
    0,
    AVATAR_SIZE,
    AVATAR_SIZE,
  );

  return canvas.toDataURL("image/webp", 0.84);
}

const initialsOf = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

function Avatar({ src, name, size, className }: { src: string | null; name: string; size: number; className: string }) {
  if (src) {
    return (
      <Image
        unoptimized={src.startsWith("data:")}
        src={src}
        alt={`Foto profil ${name}`}
        width={size}
        height={size}
        className={`size-full rounded-full object-cover ${className}`}
      />
    );
  }
  return (
    <span
      role="img"
      aria-label={`Foto profil ${name}`}
      className="t-headline-md flex size-full items-center justify-center rounded-full bg-sage-tint text-primary"
    >
      {initialsOf(name)}
    </span>
  );
}

export function ProfileCard({ profile }: { profile: Profile }) {
  const router = useRouter();
  const { showToast } = useToast();
  const fullName = profile.name;
  const avatar = profile.avatar;

  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(fullName);
  const [draftAvatar, setDraftAvatar] = useState<string | null>(avatar);
  const [draftEmail, setDraftEmail] = useState(profile.email ?? "");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [processingPhoto, setProcessingPhoto] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  function openEditor() {
    setDraftName(fullName);
    setDraftAvatar(avatar);
    setDraftEmail(profile.email ?? "");
    setEmailError("");
    setNameError("");
    setPhotoError("");
    setEditing(true);
  }

  async function pickPhoto(file?: File) {
    if (!file) return;
    setPhotoError("");

    if (!file.type.startsWith("image/")) {
      setPhotoError("Pilih berkas gambar yang valid.");
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      setPhotoError("Ukuran foto maksimal 5 MB.");
      return;
    }

    setProcessingPhoto(true);
    try {
      setDraftAvatar(await prepareAvatar(file));
    } catch {
      setPhotoError("Foto tidak dapat dibaca. Coba pilih foto lain.");
    } finally {
      setProcessingPhoto(false);
    }
  }

  async function saveProfile() {
    const nextName = draftName.trim().replace(/\s+/g, " ");
    if (nextName.length < 2) {
      setNameError("Nama lengkap minimal 2 karakter.");
      nameInputRef.current?.focus();
      return;
    }
    if (nextName.length > 80) {
      setNameError("Nama lengkap maksimal 80 karakter.");
      nameInputRef.current?.focus();
      return;
    }

    const nextEmail = draftEmail.trim().toLowerCase();
    if (nextEmail && !isEmail(nextEmail)) {
      setEmailError("Format email tidak valid.");
      return;
    }

    setSaving(true);
    const result = await api<Profile>("/api/profile", "PATCH", {
      name: nextName,
      email: nextEmail,
      ...(draftAvatar && draftAvatar !== avatar ? { avatar: draftAvatar } : {}),
    });
    setSaving(false);
    if (!result.ok) {
      if (result.fields?.name) setNameError(result.fields.name);
      else if (result.fields?.email) setEmailError(result.fields.email);
      else if (result.fields?.avatar) setPhotoError(result.fields.avatar);
      showToast(result.error);
      return;
    }

    setEditing(false);
    router.refresh();
    showToast("Data profil Anda sudah diperbarui.", {
      title: "Profil berhasil disimpan",
      tone: "success",
    });
  }

  return (
    <>
      <section className="relative overflow-hidden rounded-4xl bg-surface-container-low p-4 shadow-sm">
        <div className="pointer-events-none absolute -right-6 -bottom-6 size-32 rounded-full bg-sage-tint/40" />
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="relative mb-2">
            <div className="flex size-20 items-center justify-center rounded-full bg-surface-bright p-1 shadow-sm">
              <Avatar src={avatar} name={fullName} size={72} className="" />
            </div>
            <button
              type="button"
              onClick={openEditor}
              aria-label="Ganti foto profil"
              className="absolute right-0 bottom-0 flex size-7 items-center justify-center rounded-full bg-primary text-on-primary shadow-sm transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <Icon name="photo_camera" size={15} filled />
            </button>
          </div>
          <h1 className="t-headline-md text-on-surface">{fullName}</h1>
          <div className="mt-3 flex w-full flex-col gap-1.5">
            <div className="t-body-sm flex items-center justify-center gap-1.5 text-text-muted">
              <Icon name="chat" size={15} />
              {profile.whatsapp}
            </div>
            <div className="t-body-sm flex items-center justify-center gap-1.5 text-text-muted">
              <Icon name="mail" size={15} />
              {profile.email ?? (
                <button type="button" onClick={openEditor} className="font-medium text-primary underline-offset-2 hover:underline">
                  Tambah email
                </button>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={openEditor}
            className="t-title-sm mt-4 flex items-center gap-1.5 rounded-full bg-surface-container-lowest px-4 py-2 text-primary shadow-xs transition-colors hover:bg-sage-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Icon name="edit" size={17} />
            Edit Profil
          </button>
        </div>
      </section>

      <Dialog
        open={editing}
        onClose={() => setEditing(false)}
        eyebrow="Akun Saya"
        title="Edit Profil"
        size="sm"
      >
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            saveProfile();
          }}
          className="space-y-5"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="relative size-24 overflow-hidden rounded-full bg-surface-container p-1 shadow-sm">
              <Avatar src={draftAvatar} name={fullName} size={88} className="" />
            </div>
            <label className="t-title-sm flex cursor-pointer items-center gap-1.5 rounded-full bg-sage-tint px-4 py-2 text-primary transition-colors hover:bg-primary-fixed focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary">
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                disabled={processingPhoto}
                onChange={(event) => {
                  void pickPhoto(event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
              <Icon name="add_a_photo" size={17} />
              {processingPhoto ? "Memproses foto..." : "Pilih Foto Baru"}
            </label>
            <p className="t-body-sm text-center text-text-muted">
              JPG, PNG, atau WebP · Maksimal 5 MB
            </p>
            {photoError && (
              <p role="alert" className="t-body-sm text-center text-error">
                {photoError}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <FieldLabel htmlFor="profile-full-name">Nama lengkap</FieldLabel>
            <input
              ref={nameInputRef}
              id="profile-full-name"
              name="fullName"
              type="text"
              autoComplete="name"
              maxLength={80}
              required
              value={draftName}
              aria-invalid={Boolean(nameError)}
              aria-describedby={nameError ? "profile-name-error" : undefined}
              onChange={(event) => {
                setDraftName(event.target.value);
                if (nameError) setNameError("");
              }}
              className={`${fieldClass} ${nameError ? "ring-2 ring-error" : ""}`}
            />
            {nameError && (
              <p id="profile-name-error" role="alert" className="t-body-sm px-1 text-error">
                {nameError}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <FieldLabel htmlFor="profile-email">Email</FieldLabel>
            <input
              id="profile-email"
              name="email"
              type="email"
              autoComplete="email"
              maxLength={120}
              placeholder="nama@email.com"
              value={draftEmail}
              aria-invalid={Boolean(emailError)}
              aria-describedby={emailError ? "profile-email-error" : undefined}
              onChange={(event) => {
                setDraftEmail(event.target.value);
                if (emailError) setEmailError("");
              }}
              className={`${fieldClass} ${emailError ? "ring-2 ring-error" : ""}`}
            />
            {emailError && (
              <p id="profile-email-error" role="alert" className="t-body-sm px-1 text-error">
                {emailError}
              </p>
            )}
          </div>

          <DialogActions
            onCancel={() => setEditing(false)}
            submitLabel="Simpan Perubahan"
            submitting={processingPhoto || saving}
          />
        </form>
      </Dialog>
    </>
  );
}
