/**
 * Resolves the app's "@/..." alias — and extensionless relative imports
 * between the app's own TypeScript files — for plain Node, so build scripts
 * can import content/*.ts and lib/*.ts directly. Node 22 strips the types
 * itself; this only fixes paths.
 */

import { existsSync, statSync } from "node:fs";
import { dirname, resolve as resolvePath } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolvePath(dirname(fileURLToPath(import.meta.url)), "..");
const EXTENSIONS = [".ts", ".tsx", "/index.ts", ""];

const isFile = (path) => existsSync(path) && statSync(path).isFile();
const find = (base) => EXTENSIONS.map((ext) => base + ext).find(isFile);

export async function resolve(specifier, context, next) {
  if (specifier.startsWith("@/")) {
    const match = find(resolvePath(ROOT, specifier.slice(2)));
    if (!match) throw new Error(`Cannot resolve "${specifier}" under ${ROOT}`);
    return next(pathToFileURL(match).href, context);
  }

  // "./kinds" from inside one of our .ts files: try the TS extensions before
  // letting Node fail on the bare path.
  if ((specifier.startsWith("./") || specifier.startsWith("../")) && context.parentURL?.startsWith("file:")) {
    const parent = fileURLToPath(context.parentURL);
    if (parent.startsWith(ROOT) && /\.tsx?$/.test(parent)) {
      const match = find(resolvePath(dirname(parent), specifier));
      if (match && /\.tsx?$/.test(match)) return next(pathToFileURL(match).href, context);
    }
  }

  return next(specifier, context);
}
