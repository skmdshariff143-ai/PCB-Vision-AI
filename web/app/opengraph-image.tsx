import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "PCB Vision AI — Intelligent PCB Defect Inspection & Classification";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#090d16",
          padding: "60px 80px",
          fontFamily: "system-ui, sans-serif",
          color: "#ffffff",
          border: "4px solid #1e293b",
        }}
      >
        {/* Top Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "14px",
                backgroundColor: "rgba(16, 185, 129, 0.15)",
                border: "2px solid rgba(16, 185, 129, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                fontWeight: "bold",
                color: "#10b981",
              }}
            >
              PCB
            </div>
            <div style={{ fontSize: "36px", fontWeight: "800", color: "#ffffff", letterSpacing: "-0.02em" }}>
              PCB Vision AI
            </div>
          </div>
          <div
            style={{
              padding: "8px 20px",
              borderRadius: "999px",
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              color: "#34d399",
              fontSize: "18px",
              fontWeight: "600",
            }}
          >
            YOLOv8n • ONNX WebAssembly
          </div>
        </div>

        {/* Main Title & Subtitle */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              fontSize: "52px",
              fontWeight: "900",
              lineHeight: 1.15,
              color: "#ffffff",
              letterSpacing: "-0.03em",
            }}
          >
            Intelligent Bare PCB Defect Detection & Classical DIP
          </div>
          <div
            style={{
              fontSize: "24px",
              color: "#94a3b8",
              lineHeight: 1.4,
              maxWidth: "1000px",
            }}
          >
            Real-time client-side optical inspection covering 6 defect categories with 95.64% mAP@50 on DeepPCB. 100% private in-browser inference.
          </div>
        </div>

        {/* Bottom Metrics Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "32px",
            borderTop: "2px solid #1e293b",
          }}
        >
          <div style={{ display: "flex", gap: "48px" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "14px", color: "#64748b", textTransform: "uppercase", fontWeight: "600" }}>
                mAP @ 0.50
              </span>
              <span style={{ fontSize: "32px", fontWeight: "800", color: "#10b981" }}>95.64%</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "14px", color: "#64748b", textTransform: "uppercase", fontWeight: "600" }}>
                Recall (Coverage)
              </span>
              <span style={{ fontSize: "32px", fontWeight: "800", color: "#14b8a6" }}>94.48%</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "14px", color: "#64748b", textTransform: "uppercase", fontWeight: "600" }}>
                Privacy Mode
              </span>
              <span style={{ fontSize: "32px", fontWeight: "800", color: "#38bdf8" }}>Zero Uploads</span>
            </div>
          </div>

          <div style={{ fontSize: "18px", color: "#64748b", fontFamily: "monospace" }}>
            pcb-vision-ai-ten.vercel.app
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
