import Image from "next/image";

/** Footer yang hanya muncul saat dicetak/disimpan PDF; harus diletakkan di dalam `PrintPage`. */
export function PrintFooter() {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-outline-variant pt-3">
      <Image src="/images/logo-header.png" alt="Selaras Life" width={720} height={323} sizes="120px" className="h-9 w-auto" />
      <p className="text-right text-[11px] leading-snug text-text-muted">
        <span className="font-semibold text-on-surface">selaras.life</span>
        <br />
        Your companion for every season of life
      </p>
    </div>
  );
}

/**
 * Pembungkus konten yang dicetak: di layar berupa blok biasa, saat dicetak menjadi tabel sungguhan
 * dengan `<tfoot>` yang diulang di setiap halaman PDF dan menyisakan ruang agar tidak menimpa isi.
 */
export function PrintPage({ children }: { children: React.ReactNode }) {
  return (
    <table className="block w-full print:table print:min-h-[94vh]">
      <tbody className="block print:table-row-group">
        <tr className="block print:table-row">
          <td className="block p-0 align-top print:table-cell">{children}</td>
        </tr>
      </tbody>
      <tfoot className="hidden print:table-footer-group">
        <tr>
          <td className="p-0">
            <PrintFooter />
          </td>
        </tr>
      </tfoot>
    </table>
  );
}
