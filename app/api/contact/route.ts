import { validateContact, isHoneypotTripped } from "@/lib/contact-validation";
import { profile } from "@/content/profile";

/**
 * Contact endpoint. Sends through Resend's REST API with plain fetch — the SDK
 * would be a dependency for one HTTP call.
 *
 * Required env (Vercel project settings, never the repo):
 *   RESEND_API_KEY   re_...
 *   CONTACT_TO       where messages land            (default: profile.email)
 *   CONTACT_FROM     a verified sender on your domain
 *
 * Spam handling is a honeypot plus a submission-time floor. If this ever starts
 * leaking through, add Cloudflare Turnstile — that's the next step, not a rate
 * limiter, since serverless instances don't share memory.
 */

const MIN_ELAPSED_MS = 2500;
const RESEND_ENDPOINT = "https://api.resend.com/emails";

export async function POST(request: Request) {
  let payload: Record<string, unknown>;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Malformed request body." }, { status: 400 });
  }

  const input = {
    name: String(payload.name ?? ""),
    email: String(payload.email ?? ""),
    message: String(payload.message ?? ""),
    company: String(payload.company ?? ""),
  };

  // Silently accept bot submissions: telling a bot it failed only teaches it.
  const elapsed = Number(payload.elapsedMs ?? 0);
  if (isHoneypotTripped(input) || elapsed < MIN_ELAPSED_MS) {
    return Response.json({ ok: true });
  }

  const errors = validateContact(input);
  if (Object.keys(errors).length > 0) {
    return Response.json({ error: "Please check the fields and try again." }, { status: 422 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO ?? profile.email;
  const from = process.env.CONTACT_FROM;

  if (!apiKey || !from) {
    console.error("Contact form is not configured: RESEND_API_KEY or CONTACT_FROM is missing.");
    return Response.json(
      { error: "The form isn't wired up yet. Please email me directly." },
      { status: 503 },
    );
  }

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: input.email,
        subject: `Portfolio — ${input.name}`,
        text: [
          `From: ${input.name} <${input.email}>`,
          "",
          input.message,
        ].join("\n"),
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("Resend rejected the message:", response.status, detail);
      return Response.json(
        { error: "I couldn't deliver that. Please email me directly." },
        { status: 502 },
      );
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Contact route failed:", error);
    return Response.json(
      { error: "Network trouble on my side. Please email me directly." },
      { status: 502 },
    );
  }
}
