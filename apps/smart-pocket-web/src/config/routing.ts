/**
 * Routing Configuration
 * Sets the basename for React Router based on build/deployment context
 */

export function getBasename(): string {
  // Vite exposes BASE_URL through import.meta.env.BASE_URL
  // In development with VITE_BASE_URL=/ui/, this will be '/ui/'
  // In production with base config, this will match the vite.config.ts base setting
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const baseUrl = (globalThis as any).import?.meta?.env?.BASE_URL || '/';
  
  // BASE_URL includes trailing slash, so /ui/ should be /ui for basename
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
}
