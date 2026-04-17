/**
 * When the static export is hosted under a subdirectory (not at the site root),
 * set `NEXT_PUBLIC_BASE_PATH` at build time to that path prefix (no trailing slash).
 * Must match `basePath` in `next.config.mjs`.
 */
export const appBasePath =
  process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/$/, "") ?? "";

export function withBasePath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return appBasePath ? `${appBasePath}${normalized}` : normalized;
}
