import { ImageResponse } from "next/og";
export const alt =
  "D&G Studio — Criamos experiências digitais para pessoas e empresas.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px",
        background: "#080b16",
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ fontSize: 30, display: "flex", marginBottom: 65 }}>
        D&G <span style={{ color: "#18d6a3", marginLeft: 12 }}>STUDIO</span>
      </div>
      <div
        style={{
          fontSize: 68,
          fontWeight: 700,
          lineHeight: 1.1,
          display: "flex",
        }}
      >
        Criamos experiências digitais
      </div>
      <div
        style={{
          fontSize: 68,
          fontWeight: 700,
          color: "#a99bff",
          display: "flex",
          marginTop: 8,
        }}
      >
        para pessoas e empresas.
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 21,
          color: "#9ea6bc",
          marginTop: 48,
        }}
      >
        ESTRATÉGIA. DESIGN. TECNOLOGIA.
      </div>
    </div>,
    size,
  );
}
