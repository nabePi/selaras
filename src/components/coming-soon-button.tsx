"use client";

import { useToast } from "./toast-provider";

type Props = Omit<React.ComponentProps<"button">, "onClick" | "type"> & {
  /** Nama fitur, ditampilkan sebagai "<feature> akan hadir pada fase berikutnya" */
  feature: string;
};

/** Tombol untuk fitur yang belum tersedia: menampilkan toast, bukan tombol mati. */
export function ComingSoonButton({ feature, ...props }: Props) {
  const { showToast } = useToast();
  return (
    <button
      type="button"
      onClick={() => showToast(`${feature} akan hadir pada fase berikutnya ✨`)}
      {...props}
    />
  );
}
