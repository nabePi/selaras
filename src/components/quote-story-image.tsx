import { ImageResponse } from "next/og";

export function quoteStoryImage({ quote, background, logo }: { quote: string; background: string; logo: string }) {
  return new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%", background: "#3c2d22", color: "#fff8f5" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={background} alt="" width={1080} height={1920} style={{ position: "absolute", inset: 0, objectFit: "cover" }} />
      <div style={{ display: "flex", position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "linear-gradient(to top, rgba(60,45,34,0.90), rgba(60,45,34,0.65), rgba(60,45,34,0.45))" }} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", height: "100%", padding: "240px 100px 230px" }}>
        <div style={{ display: "flex", background: "#fff8f5", padding: "22px 32px", borderRadius: 24 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} alt="Selaras Life" width={260} height={117} style={{ objectFit: "contain" }} />
        </div>
        <div style={{ display: "flex", flex: 1, alignItems: "center", textAlign: "center", fontSize: 70, fontStyle: "italic", lineHeight: 1.5 }}>“{quote}”</div>
        <div style={{ display: "flex", fontSize: 30, letterSpacing: 3, color: "#ffede2" }}>selaras.life</div>
      </div>
    </div>,
    { width: 1080, height: 1920, headers: { "Cache-Control": "no-store" } },
  );
}
