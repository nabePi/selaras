import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Menghasilkan server minimal di .next/standalone untuk image Docker yang kecil.
  output: "standalone",
};

export default nextConfig;
