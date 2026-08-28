"use client";

import { useEffect, useRef, useState } from "react";
import { validateContact, type FieldErrors, LIMITS } from "@/lib/contact-validation";
import { profile } from "@/content/profile";

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const mountedAt = useRef(0);

  // Stamped after mount: reading the clock during render is impure.
  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;

    const fieldErrors = validateContact(data);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) {
      form.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
      return;
    }

    setStatus("submitting");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, elapsedMs: Date.now() - mountedAt.current }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "Something went wrong on the way to my inbox.");
      }

      setStatus("success");
      form.reset();
    } catch (error) {
      setStatus("error");
      setFormError(error instanceof Error ? error.message : "Unknown error.");
    }
  }

  if (status === "success") {
    return (
      <div className="panel p-8" role="status">
        <p className="font-mono text-xs text-ember">Message sent</p>
        <p className="mt-4 font-display text-2xl font-semibold">Got it — thanks.</p>
        <p className="prose-body mt-3 text-sm">
          I read everything that lands here and usually reply within a couple of days.
          If it&apos;s urgent, {" "}
          <a href={`mailto:${profile.email}`} className="link-wipe text-ember">
            email me directly
          </a>
          .
        </p>
        <button type="button" onClick={() => setStatus("idle")} className="btn mt-8">
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Honeypot. Hidden from people and from screen readers; bots fill it anyway. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="company">Company (leave this empty)</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <Field
        id="name"
        label="Name"
        error={errors.name}
        maxLength={LIMITS.name.max}
        autoComplete="name"
      />
      <Field
        id="email"
        label="Email"
        type="email"
        error={errors.email}
        maxLength={LIMITS.email.max}
        autoComplete="email"
      />
      <Field
        id="message"
        label="Message"
        error={errors.message}
        maxLength={LIMITS.message.max}
        textarea
      />

      <div className="flex flex-wrap items-center gap-4 pt-2">
        <button type="submit" disabled={status === "submitting"} className="btn btn-primary disabled:opacity-50">
          {status === "submitting" ? "Sending…" : "Send message"}
        </button>
        <p className="font-mono text-xs text-dim">
          Or email{" "}
          <a href={`mailto:${profile.email}`} className="link-wipe text-muted">
            {profile.email}
          </a>
        </p>
      </div>

      <p aria-live="polite" className="min-h-5 font-mono text-xs text-ember">
        {status === "error" && formError}
      </p>
    </form>
  );
}

interface FieldProps {
  id: "name" | "email" | "message";
  label: string;
  error?: string;
  type?: string;
  maxLength?: number;
  autoComplete?: string;
  textarea?: boolean;
}

function Field({ id, label, error, type = "text", maxLength, autoComplete, textarea }: FieldProps) {
  const shared = {
    id,
    name: id,
    maxLength,
    autoComplete,
    "aria-invalid": Boolean(error),
    "aria-describedby": error ? `${id}-error` : undefined,
    className: `w-full border bg-surface px-4 py-3 font-mono text-sm text-text outline-none transition-colors duration-300 placeholder:text-dim focus:border-ember ${
      error ? "border-ember" : "border-line"
    }`,
  } as const;

  return (
    <div>
      <label htmlFor={id} className="label block">
        {label}
      </label>
      <div className="mt-2.5">
        {textarea ? (
          <textarea {...shared} rows={6} placeholder="What are you building?" />
        ) : (
          <input {...shared} type={type} placeholder={id === "email" ? "you@company.com" : ""} />
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-2 font-mono text-xs text-ember">
          {error}
        </p>
      )}
    </div>
  );
}
