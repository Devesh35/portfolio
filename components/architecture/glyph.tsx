/**
 * Line glyphs per node kind, drawn to the site's hairline weight. Unknown
 * kinds get a plain ring, so a new registry entry never breaks rendering.
 */
const GLYPH: Record<string, React.ReactNode> = {
  web: <><rect x="3" y="4.8" width="18" height="12.4" rx="1.2" /><path d="M9.4 20.8h5.2M12 17.2v3.6" /></>,
  mobile: <><rect x="7" y="2.8" width="10" height="18.4" rx="1.6" /><path d="M11 18.2h2" /></>,
  desktop: <><rect x="4" y="5" width="16" height="10.5" rx="1.2" /><path d="M2.5 18.5h19" /></>,
  api: <><rect x="3.5" y="4" width="17" height="6.5" rx="1" /><rect x="3.5" y="13.5" width="17" height="6.5" rx="1" /><path d="M7 7.2h.01M7 16.7h.01" /></>,
  events: <path d="M3.5 7h11M3.5 12h17M3.5 17h8M17 4l3 3-3 3M13 14l3 3-3 3" />,
  cache: <path d="M13 2.5 5 13.5h6l-1 8 8-11h-6z" />,
  database: <><ellipse cx="12" cy="6" rx="7.5" ry="2.8" /><path d="M4.5 6v12c0 1.55 3.36 2.8 7.5 2.8s7.5-1.25 7.5-2.8V6M4.5 12c0 1.55 3.36 2.8 7.5 2.8s7.5-1.25 7.5-2.8" /></>,
  identity: <><circle cx="8" cy="12" r="4.2" /><path d="M12.2 12h9M17.5 12v3.5M20.5 12v2.5" /></>,
  external: <><path d="M9 3.6v4.2M15 3.6v4.2M6.6 7.8h10.8v3.4a5.4 5.4 0 0 1-10.8 0Z" /><path d="M12 16.6v3.8" /></>,
  automation: <><circle cx="12" cy="12" r="8.5" /><path d="m10 8.5 5.5 3.5-5.5 3.5z" /></>,
  pipeline: <><circle cx="6" cy="5" r="2.2" /><circle cx="6" cy="19" r="2.2" /><circle cx="18" cy="9" r="2.2" /><path d="M6 7.2v9.6M18 11.2c0 3.5-3 4.5-6 5.5-2 .7-4 1.3-4 1.3" /></>,
  iac: <path d="M8.5 4c-2 0-3 1-3 3v2.5c0 1.5-1 2.5-2.5 2.5 1.5 0 2.5 1 2.5 2.5V17c0 2 1 3 3 3M15.5 4c2 0 3 1 3 3v2.5c0 1.5 1 2.5 2.5 2.5-1.5 0-2.5 1-2.5 2.5V17c0 2-1 3-3 3" />,
  source: <><circle cx="6" cy="6" r="2.2" /><circle cx="6" cy="18" r="2.2" /><circle cx="18" cy="6" r="2.2" /><path d="M6 8.2v7.6M18 8.2c0 4-4 5-8 6.3" /></>,
  designsystem: <><rect x="3.5" y="3.5" width="7" height="7" rx="1" /><rect x="13.5" y="3.5" width="7" height="7" rx="1" /><rect x="3.5" y="13.5" width="7" height="7" rx="1" /><path d="M17 13.5v7M13.5 17h7" /></>,
  native: <><rect x="4" y="2.8" width="16" height="18.4" rx="2" /><path d="M9 8l-2.5 4L9 16M15 8l2.5 4L15 16" /></>,
  canvas: <><rect x="3" y="4" width="18" height="16" rx="1.2" /><path d="M7 15l3.5-4 3 3 2.5-2 2 3" /></>,
  sim: <><circle cx="12" cy="12" r="8.5" /><path d="M12 3.5v17M3.5 12h17" /><circle cx="12" cy="12" r="3" /></>,
  mobilebuild: <><path d="m12 3.4 8 4.2v8.8l-8 4.2-8-4.2V7.6Z" /><path d="M4 7.6l8 4.2 8-4.2M12 11.8v8.8" /></>,
  nxcloud: <path d="M7 18.4a4.2 4.2 0 0 1-.6-8.36 6 6 0 0 1 11.5 1.7 3.6 3.6 0 0 1-.6 6.66Z" />,
  lint: <><path d="M4 6h10M4 12h7M4 18h9" /><path d="m14.5 16.5 2.5 2.5 4.5-5" /></>,
  test: <><path d="M9 3h6M10 3v5.5L4.5 18a2 2 0 0 0 1.7 3h11.6a2 2 0 0 0 1.7-3L14 8.5V3" /><path d="M7.5 15h9" /></>,
  build: <><path d="m12 3.4 8 4.2v8.8l-8 4.2-8-4.2V7.6Z" /><path d="M4 7.6l8 4.2 8-4.2M12 11.8v8.8" /></>,
  release: <path d="M12 3.5c3 2.5 4.5 6 4.5 10L12 16l-4.5-2.5c0-4 1.5-7.5 4.5-10ZM7.5 13.5 5 17l3.5-.5M16.5 13.5 19 17l-3.5-.5M12 16v4.5" />,
  compute: <><rect x="6" y="6" width="12" height="12" rx="1.2" /><rect x="9.5" y="9.5" width="5" height="5" /><path d="M9 2.5v3.5M15 2.5v3.5M9 18v3.5M15 18v3.5M2.5 9h3.5M2.5 15h3.5M18 9h3.5M18 15h3.5" /></>,
  edge: <><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.8 2.6 4 5.4 4 8.5s-1.2 5.9-4 8.5c-2.8-2.6-4-5.4-4-8.5s1.2-5.9 4-8.5Z" /></>,
  storage: <><path d="M4 7h16l-1.5 13h-13z" /><ellipse cx="12" cy="7" rx="8" ry="2.4" /></>,
  managed: <><ellipse cx="12" cy="6" rx="7.5" ry="2.8" /><path d="M4.5 6v12c0 1.55 3.36 2.8 7.5 2.8s7.5-1.25 7.5-2.8V6M4.5 12c0 1.55 3.36 2.8 7.5 2.8s7.5-1.25 7.5-2.8" /></>,
  messaging: <><rect x="3" y="5.2" width="18" height="13.6" rx="1.4" /><path d="m3.6 6.4 8.4 6 8.4-6" /></>,
  access: <><rect x="5" y="10.5" width="14" height="10" rx="1.4" /><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3M12 14.5v2.5" /></>,
  cloudwatch: <path d="M3.5 13.8h3.4l2.3-6.4 3.4 9.6 2.5-5.6 1.3 2.4h4.1" />,
  ai: <><path d="M12 3.5l1.9 4.6 4.6 1.9-4.6 1.9L12 16.5l-1.9-4.6L5.5 10l4.6-1.9z" /><path d="M18.5 15.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z" /></>,
  datadog: <path d="M4 20V11M9.5 20V6M15 20v-9M20.5 20V3.5" />,
  monitoring: <path d="M4 20V11M9.5 20V6M15 20v-9M20.5 20V3.5" />,
  aws: <path d="M7 18.4a4.2 4.2 0 0 1-.6-8.36 6 6 0 0 1 11.5 1.7 3.6 3.6 0 0 1-.6 6.66Z" />,
  azure: <path d="M7 18.4a4.2 4.2 0 0 1-.6-8.36 6 6 0 0 1 11.5 1.7 3.6 3.6 0 0 1-.6 6.66Z" />,
};

export function Glyph({ id, size = 14 }: { id: string; size?: number }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      {GLYPH[id] ?? <circle cx="12" cy="12" r="8" />}
    </svg>
  );
}
