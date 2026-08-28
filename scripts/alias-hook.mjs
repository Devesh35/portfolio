/**
 * Resolves the app's "@/..." alias for plain Node, so build scripts can import
 * content/*.ts directly. Node 22 strips the types itself; this only fixes paths.
 */

import { existsSync } from "node:fs";
import { dirname, resolve as resolvePath } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolvePath(dirname(fileURLToPath(import.meta.url)), "..");
const EXTENSIONS = ["", ".ts", ".tsx", "/index.ts"];

export async function resolve(specifier, context, next) {
  if (!specifier.startsWith("@/")) return next(specifier, context);

  const base = resolvePath(ROOT, specifier.slice(2));
  const match = EXTENSIONS.map((ext) => base + ext).find(existsSync);

  if (!match) throw new Error(`Cannot resolve "${specifier}" under ${ROOT}`);
  return next(pathToFileURL(match).href, context);
}
