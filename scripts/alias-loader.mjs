// Minimal Node resolve hook so tests can import "@/lib/x" (→ src/lib/x.ts) like the app does.
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export async function resolve(specifier, context, next) {
  if (specifier.startsWith("@/")) {
    const base = path.join(root, "src", specifier.slice(2));
    for (const candidate of [base, `${base}.ts`, `${base}.tsx`, path.join(base, "index.ts")]) {
      if (existsSync(candidate) && !candidate.endsWith(path.sep)) {
        try {
          if ((await import("node:fs")).statSync(candidate).isFile()) return next(pathToFileURL(candidate).href, context);
        } catch {
          // keep looking
        }
      }
    }
  }
  return next(specifier, context);
}
