"use client";

import { useCallback, useEffect, useState } from "react";
import type { BlogCommentView } from "@/lib/blog-content";
import { api } from "@/lib/api-client";
import { Icon } from "../icon";
import { useToast } from "../toast-provider";

const dateFmt = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" });

/** Daftar komentar dan formulirnya. Pengunjung belum masuk berkomentar "Anonim" dengan captcha hitung. */
export function CommentSection({ slug, initial, userName }: { slug: string; initial: BlogCommentView[]; userName: string | null }) {
  const { showToast } = useToast();
  const [comments, setComments] = useState(initial);
  const [body, setBody] = useState("");
  const [captcha, setCaptcha] = useState<{ token: string; question: string } | null>(null);
  const [answer, setAnswer] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const loadCaptcha = useCallback(async () => {
    const res = await api<{ token: string; question: string }>("/api/blog/captcha", "GET");
    if (res.ok) setCaptcha(res.data);
    setAnswer("");
  }, []);

  useEffect(() => {
    if (userName) return;
    let alive = true;
    void api<{ token: string; question: string }>("/api/blog/captcha", "GET").then((res) => {
      if (alive && res.ok) setCaptcha(res.data);
    });
    return () => {
      alive = false;
    };
  }, [userName]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (sending) return;
    setError("");
    if (body.trim().length < 2) return setError("Tulis komentar dulu.");
    if (!userName && !answer.trim()) return setError("Jawab captcha dulu.");
    setSending(true);
    const res = await api<BlogCommentView>(`/api/blog/${slug}/comments`, "POST", {
      body,
      captchaToken: captcha?.token,
      captchaAnswer: answer.trim(),
    });
    setSending(false);
    if (res.ok) {
      setComments((c) => [...c, res.data]);
      setBody("");
      showToast("Komentar terkirim.", { tone: "success" });
    } else {
      setError(res.error);
    }
    if (!userName) void loadCaptcha();
  }

  return (
    <section aria-label="Komentar" className="flex flex-col gap-4">
      <h2 className="t-title-lg flex items-center gap-2 text-on-surface">
        <Icon name="chat_bubble" size={20} className="text-primary" />
        Komentar ({comments.length})
      </h2>

      {comments.length > 0 && (
        <ul className="flex flex-col gap-3">
          {comments.map((c) => (
            <li key={c.id} className="flex flex-col gap-1 rounded-2xl bg-surface-container-low px-4 py-3">
              <p className="t-label-md flex flex-wrap items-center gap-x-2 text-on-surface">
                <span className="font-semibold">{c.authorName}</span>
                <span className="t-label-sm font-normal text-text-muted">{dateFmt.format(new Date(c.createdAt))}</span>
              </p>
              <p className="t-body-md whitespace-pre-line break-words text-on-surface">{c.body}</p>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={submit} noValidate className="flex flex-col gap-3 rounded-3xl bg-surface-container-low p-4">
        <label htmlFor="comment-body" className="t-label-md text-on-surface">
          {userName ? `Berkomentar sebagai ${userName}` : "Berkomentar sebagai Anonim"}
        </label>
        <textarea
          id="comment-body"
          value={body}
          maxLength={1000}
          rows={3}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Tulis komentar…"
          className="t-body-md w-full rounded-2xl border border-outline-variant bg-surface px-4 py-3 text-on-surface focus-visible:border-sage-medium focus-visible:outline-none"
        />
        {!userName && (
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="comment-captcha" className="t-label-md text-on-surface">
              Berapa hasil <span className="font-semibold tabular-nums">{captcha?.question ?? "…"}</span>
            </label>
            <input
              id="comment-captcha"
              inputMode="numeric"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="t-body-md w-20 rounded-xl border border-outline-variant bg-surface px-3 py-2 text-center text-on-surface focus-visible:border-sage-medium focus-visible:outline-none"
            />
            <button type="button" onClick={() => void loadCaptcha()} aria-label="Ganti soal captcha" className="rounded-full p-1.5 text-text-muted hover:bg-surface-container">
              <Icon name="refresh" size={18} />
            </button>
          </div>
        )}
        {error && (
          <p role="alert" className="t-body-sm text-error">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={sending}
          className="t-title-sm flex w-fit items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-on-primary shadow-md transition-colors hover:bg-primary-container disabled:opacity-70"
        >
          <Icon name="send" size={16} />
          {sending ? "Mengirim…" : "Kirim komentar"}
        </button>
      </form>
    </section>
  );
}
