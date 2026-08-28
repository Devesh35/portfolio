/** Site-wide constants. Change these in one place. */

export const site = {
  url: "https://deveshsingh.in",
  name: "Devesh Singh",
  title: "Devesh Singh — Full Stack & DevOps Engineer",
  description:
    "Full Stack & DevOps Engineer in Pune. Next.js and React Native front ends, Node.js services, and the Docker, Terraform and CI/CD pipelines that ship them on AWS and Azure.",
  locale: "en_IN",
} as const;

export const nav = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/skills", label: "Skills" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;
