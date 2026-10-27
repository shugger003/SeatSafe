import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "A toilet seat sanitizer store. Details are published by the business.";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f4f0e8",
          color: "#1c1915",
          padding: "72px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              border: "2px solid #1e3f38",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ width: 16, height: 16, borderRadius: 8, border: "2px solid #1e3f38" }} />
          </div>
          <div style={{ fontSize: 28, color: "#1e3f38" }}>SitSafe</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 860 }}>
          <div style={{ fontSize: 76, lineHeight: 0.95, letterSpacing: -2 }}>A toilet seat sanitizer, ready when the details are.</div>
          <div style={{ marginTop: 28, fontSize: 28, color: "#3f3a34", maxWidth: 720 }}>
            Prices, instructions, and claims appear only after the business confirms them.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
