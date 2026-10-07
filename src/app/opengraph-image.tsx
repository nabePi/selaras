import { ImageResponse } from "next/og";

export const alt = "Selaras Life — Your companion for every season of life";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Gambar pratinjau saat tautan dibagikan (WhatsApp, Instagram, Facebook, X, dsb.). */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 90px",
          background: "linear-gradient(135deg, #fff8f5 0%, #e9f0e4 100%)",
          color: "#2d3a2a",
        }}
      >
        <div style={{ fontSize: 34, letterSpacing: 6, color: "#4e6148", textTransform: "uppercase" }}>Selaras Life</div>
        <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.1, marginTop: 24 }}>
          Your companion for every season of life
        </div>
        <div style={{ fontSize: 34, marginTop: 36, color: "#5c4b3e", lineHeight: 1.4 }}>
          Kelas & konseling pernikahan, kehamilan, menyusui, dan keluarga muslim — hidup selaras wahyu.
        </div>
        <div style={{ fontSize: 28, marginTop: 40, color: "#4e6148" }}>selaras.life</div>
      </div>
    ),
    size,
  );
}
