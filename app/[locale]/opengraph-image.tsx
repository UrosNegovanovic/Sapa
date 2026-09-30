import { ImageResponse } from "next/og";

import messages from "@/i18n/messages/sr-Latn.json";
import { brandColors } from "@/lib/design/tokens";

export const alt = messages.Metadata.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 72,
        background: brandColors.cream,
        color: brandColors.ink,
      }}
    >
      <div style={{ fontSize: 34, color: brandColors.action, fontWeight: 700 }}>
        {messages.Header.brand}
      </div>
      <div
        style={{
          marginTop: 28,
          maxWidth: 960,
          fontSize: 78,
          lineHeight: 1.05,
          fontWeight: 700,
        }}
      >
        {messages.Metadata.description}
      </div>
      <div
        style={{
          marginTop: 38,
          width: 210,
          height: 12,
          borderRadius: 999,
          background: brandColors.brand,
        }}
      />
    </div>,
    size,
  );
}
