import { ImageResponse } from "next/og";

import { profile } from "@/content/profile";
import { projects } from "@/content/projects";
import { site } from "@/content/site";
import { yearsSinceCareerStart } from "@/lib/experience";

export const alt = `${profile.name} — ${profile.title}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const C = {
  ground: "#0b0d10",
  line: "#222831",
  text: "#e9ecf1",
  muted: "#98a1ac",
  dim: "#6b7480",
  ember: "#e8734a",
};

/** The link-preview card recruiters see in Slack, Teams and ATS notes. */
export default function OpenGraphImage() {
  const stats = [
    { value: `${yearsSinceCareerStart()} yrs`, label: "BUILDING" },
    { value: String(projects.length), label: "PROJECTS" },
    { value: "AWS · AZURE", label: "SHIPPED ON" },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: C.ground,
          padding: "72px 80px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* hairline frame accents */}
        <div style={{ position: "absolute", left: 80, top: 0, bottom: 0, width: 1, background: C.line, display: "flex" }} />
        <div style={{ position: "absolute", right: 80, top: 0, bottom: 0, width: 1, background: C.line, display: "flex" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 560, height: 1, background: C.line, display: "flex" }} />

        <div style={{ display: "flex", flexDirection: "column", paddingLeft: 24 }}>
          <div style={{ display: "flex", height: 6, width: 120, background: C.ember }} />
          <div
            style={{
              display: "flex",
              marginTop: 44,
              fontSize: 100,
              color: C.text,
              fontWeight: 700,
              letterSpacing: -4,
            }}
          >
            {profile.name}
          </div>
          <div style={{ display: "flex", marginTop: 16, fontSize: 40, color: C.ember }}>
            {profile.title}
          </div>
          <div style={{ display: "flex", marginTop: 24, fontSize: 26, color: C.muted }}>
            {profile.location} · Next.js · React Native · Node.js · Terraform · CI/CD
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", paddingLeft: 24 }}>
          <div style={{ display: "flex", gap: 56 }}>
            {stats.map((stat) => (
              <div key={stat.label} style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", fontSize: 34, color: C.text, fontWeight: 700 }}>{stat.value}</div>
                <div style={{ display: "flex", marginTop: 6, fontSize: 18, color: C.dim, letterSpacing: 3 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", fontSize: 22, color: C.dim }}>
            {site.url.replace(/^https?:\/\//, "")}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
