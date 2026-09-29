"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useToast } from "./toast-provider";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const STANDALONE = "(display-mode: standalone)";

function subscribeStandalone(callback: () => void) {
  const mq = window.matchMedia(STANDALONE);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

export function InstallPwa() {
  const { showToast } = useToast();
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const [justInstalled, setInstalled] = useState(false);
  const standalone = useSyncExternalStore(
    subscribeStandalone,
    () => window.matchMedia(STANDALONE).matches,
    () => false,
  );
  const installed = standalone || justInstalled;

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as InstallPromptEvent);
    };
    const onInstalled = () => setInstalled(true);

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install() {
    if (!prompt) {
      showToast("Buka menu peramban lalu pilih “Tambahkan ke layar utama”.");
      return;
    }
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setPrompt(null);
  }

  return (
    <button
      type="button"
      onClick={install}
      disabled={installed}
      className={`t-label-sm rounded-full px-3 py-1.5 shadow-xs transition-transform active:scale-95 ${
        installed ? "bg-sage-tint text-primary" : "bg-primary text-on-primary"
      }`}
    >
      {installed ? "Terpasang ✓" : "Pasang"}
    </button>
  );
}
