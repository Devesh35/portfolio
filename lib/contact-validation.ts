/**
 * Hand-rolled validation, shared by the form and the route handler.
 * No zod: this is the only schema on the site, and a dependency for one
 * object shape is weight the performance budget doesn't need to carry.
 */

export interface ContactInput {
  name: string;
  email: string;
  message: string;
  /** Honeypot. Real people never fill this; bots usually do. */
  company?: string;
}

export type FieldErrors = Partial<Record<"name" | "email" | "message", string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const LIMITS = {
  name: { min: 2, max: 80 },
  email: { max: 160 },
  message: { min: 20, max: 2000 },
} as const;

export function validateContact(input: Partial<ContactInput>): FieldErrors {
  const errors: FieldErrors = {};
  const name = input.name?.trim() ?? "";
  const email = input.email?.trim() ?? "";
  const message = input.message?.trim() ?? "";

  if (name.length < LIMITS.name.min) {
    errors.name = "Tell me who you are — at least 2 characters.";
  } else if (name.length > LIMITS.name.max) {
    errors.name = `Keep it under ${LIMITS.name.max} characters.`;
  }

  if (!EMAIL.test(email)) {
    errors.email = "That doesn't look like an email address I can reply to.";
  } else if (email.length > LIMITS.email.max) {
    errors.email = "That address is too long to be real.";
  }

  if (message.length < LIMITS.message.min) {
    errors.message = `A bit more detail helps — at least ${LIMITS.message.min} characters.`;
  } else if (message.length > LIMITS.message.max) {
    errors.message = `Keep it under ${LIMITS.message.max} characters, then we can talk properly.`;
  }

  return errors;
}

export const isHoneypotTripped = (input: Partial<ContactInput>) =>
  Boolean(input.company && input.company.trim().length > 0);
