import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70svh] max-w-5xl flex-col justify-center px-5 py-32 sm:px-8">
      <p className="label">404</p>
      <h1 className="font-display mt-5 text-[clamp(2.75rem,9vw,6rem)] font-bold">
        No route here
      </h1>
      <p className="prose-body mt-6 text-lg">
        That URL doesn&apos;t resolve. The work is the interesting part anyway.
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/work" className="btn btn-primary">See the work</Link>
        <Link href="/" className="btn">Back home</Link>
      </div>
    </div>
  );
}
