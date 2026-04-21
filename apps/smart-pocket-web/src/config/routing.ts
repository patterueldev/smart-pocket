/**
 * Routing Configuration
 * Sets the basename for React Router based on build/deployment context
 */

export function getBasename(): string {
  // Vite exposes BASE_URL through import.meta.env.BASE_URL
  // In development with VITE_BASE_URL=/ui/, this will be '/ui/'
  // In production with base config, this will match the vite.config.ts base setting
  
  // Check if we're in Node.js environment (Jest tests) or browser
  // In Node.js, import.meta.env won't be available, use globalThis fallback
  // In browser, Vite statically replaces import.meta.env.BASE_URL at build time
  let baseUrl: string;
  
  try {
    // Try to access import.meta.env.BASE_URL (works in browser and modern Node)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    baseUrl = (import.meta as any).env?.BASE_URL || '/';
  } catch {
    // Fallback for Node.js/Jest environment
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    baseUrl = (globalThis as any).import?.meta?.env?.BASE_URL || '/';
  }
  
  // BASE_URL includes trailing slash, so /ui/ should be /ui for basename
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
}
