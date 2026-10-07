import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Menghasilkan server minimal di .next/standalone untuk image Docker yang kecil.
  output: "standalone",
  // Pendaftaran mandiri sementara ditutup: akun dibuat admin. Hapus redirect ini untuk membukanya lagi.
  async redirects() {
    return [{ source: "/daftar", destination: "/masuk", permanent: false }];
  },
};

export default nextConfig;
