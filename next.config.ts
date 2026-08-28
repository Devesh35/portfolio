import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Short links land on the file, which is named what it downloads as.
      { source: "/resume", destination: "/Devesh_Singh_Resume.pdf", permanent: false },
      { source: "/resume.pdf", destination: "/Devesh_Singh_Resume.pdf", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: "/projects/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=3600, stale-while-revalidate=86400" }],
      },
      {
        source: "/Devesh_Singh_Resume.pdf",
        headers: [
          { key: "Cache-Control", value: "public, max-age=3600, must-revalidate" },
          // Names the file at the HTTP level, so a browser that ignores the
          // `download` attribute still saves it correctly. `inline` keeps the
          // PDF previewable when the URL is opened directly.
          {
            key: "Content-Disposition",
            value: 'inline; filename="Devesh_Singh_Resume.pdf"',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
