import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ScrollReveal } from "@/components/scroll-reveal";
import { SiteSearch } from "@/components/site-search";
import { buildSearchIndex } from "@/lib/search-index";
import { ConsoleSignature } from "@/components/console-signature";
import { ResumeProvider } from "@/components/resume-modal";
import { profile } from "@/content/profile";
import { site } from "@/content/site";

/**
 * Fonts come from the `geist` package rather than next/font/google: the files
 * are vendored, so no build step ever depends on reaching Google's servers.
 */

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s — ${profile.name}` },
  description: site.description,
  keywords: [
    "Full Stack Developer", "DevOps Engineer", "Next.js", "React Native",
    "Node.js", "Terraform", "AWS", "Pune", "Devesh Singh",
  ],
  authors: [{ name: profile.name, url: site.url }],
  creator: profile.name,
  openGraph: {
    type: "website",
    locale: site.locale,
    url: site.url,
    siteName: profile.name,
    title: site.title,
    description: site.description,
  },
  twitter: { card: "summary_large_image", title: site.title, description: site.description },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.title,
  email: `mailto:${profile.email}`,
  url: site.url,
  address: { "@type": "PostalAddress", addressLocality: "Pune", addressCountry: "IN" },
  alumniOf: { "@type": "CollegeOrUniversity", name: profile.education.school },
  worksFor: { "@type": "Organization", name: "Nirmitee.io" },
  sameAs: [profile.links.github, profile.links.linkedin, profile.links.devtools],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-dvh">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-ember focus:px-4 focus:py-2 focus:font-mono focus:text-sm focus:text-void"
        >
          Skip to content
        </a>

        <ResumeProvider>
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter />
        </ResumeProvider>

        <ScrollReveal />
        <SiteSearch index={buildSearchIndex()} />
        <ConsoleSignature />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </body>
    </html>
  );
}
