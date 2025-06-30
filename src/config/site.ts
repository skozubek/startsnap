/**
 * src/config/site.ts
 * @description Centralized site-wide configuration values (e.g., base URL) that may be reused across the app.
 */

/**
 * @description Base URL for the application. Prefer environment variable `VITE_SITE_URL` so that
 *              preview deploys (e.g., Netlify, Vercel) can override the default production URL
 *              without code changes. Falls back to `window.location.origin` when executed in the
 *              browser, or to the public production domain as a last resort (helps with SSR/prerender).
 */
export const SITE_URL: string =
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  (import.meta.env.VITE_SITE_URL as string | undefined) ||
  (typeof window !== "undefined" ? window.location.origin : "https://startsnap.fun");

/**
 * @description Fallback image that will be used for OpenGraph / Twitter cards when a page-specific
 *              image is not available. Should be an absolute URL to comply with social scrapers.
 */
export const DEFAULT_OG_IMAGE: string = "https://ik.imagekit.io/craftsnap/startsnap/vibe-coder-aha.png?updatedAt=1748985333023";