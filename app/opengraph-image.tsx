import { ImageResponse } from "next/og";
import { profile } from "@/content/profile";

export const alt = `${profile.name} — ${profile.title}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#0b0d10",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", height: 6, width: 120, background: "#e8734a" }} />
        <div style={{ display: "flex", marginTop: 48, fontSize: 104, color: "#e9ecf1", fontWeight: 700, letterSpacing: -4 }}>
          {profile.name}
        </div>
        <div style={{ display: "flex", marginTop: 20, fontSize: 40, color: "#e8734a" }}>
          {profile.title}
        </div>
        <div style={{ display: "flex", marginTop: 28, fontSize: 28, color: "#98a1ac" }}>
          {profile.location} · Next.js · Node.js · Terraform · AWS
        </div>
      </div>
    ),
    size,
  );
}
