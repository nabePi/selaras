import "server-only";

/**
 * Belum ada layanan email. Untuk sementara tautan dicetak ke log server agar alur reset
 * password bisa diuji; ganti isi fungsi ini dengan SMTP/provider email saat tersedia.
 */
export async function sendPasswordResetEmail(to: string, link: string) {
  console.info(`[mailer] Tautan reset password untuk ${to}: ${link}`);
}
