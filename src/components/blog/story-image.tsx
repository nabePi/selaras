import { ImageResponse } from "next/og";

/** Keep important content inside the Story's top/bottom interface safe area. */
export function blogStoryImage({ title, author, cover, logo }: { title: string; author: string; cover?: string; logo: string }) {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", padding: "210px 88px", background: "#fff8f5", color: "#26190e" }}>
      <div style={{ display: "flex", alignItems: "center", height: 135 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} alt="Selaras Life" width={300} height={135} style={{ objectFit: "contain" }} />
      </div>
      <div style={{ display: "flex", marginTop: 48, width: "100%", height: 520, borderRadius: 36, overflow: "hidden", background: "#e8efe5", alignItems: "center", justifyContent: "center" }}>
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" width={904} height={520} style={{ objectFit: "cover" }} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", padding: 64, fontSize: 58, lineHeight: 1.3, color: "#4e6148" }}>
            Ruang bertumbuh,<br />hidup lebih selaras.
          </div>
        )}
      </div>
      <div style={{ display: "flex", marginTop: 48, fontSize: 26, letterSpacing: 4, color: "#7c5450" }}>CATATAN SELARAS</div>
      <div style={{ display: "flex", marginTop: 22, fontSize: title.length > 110 ? 60 : 70, fontWeight: 700, lineHeight: 1.15, letterSpacing: -2 }}>{title}</div>
      <div style={{ display: "flex", marginTop: 28, fontSize: 28, color: "#715644" }}>{author}</div>
      <div style={{ display: "flex", marginTop: "auto", paddingTop: 40, borderTop: "2px solid #dccebf", justifyContent: "space-between", alignItems: "center", color: "#4e6148", fontSize: 30 }}>
        <span>Baca cerita lengkapnya</span><span>selaras.life/blog</span>
      </div>
    </div>,
    { width: 1080, height: 1920, headers: { "Cache-Control": "public, max-age=300" } },
  );
}
