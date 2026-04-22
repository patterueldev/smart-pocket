/**
 * Routing Configuration
 * Sets the basename for React Router based on build/deployment context
 */

export function getBasename(): string {
  // Always serve from root - no subpaths
  return '';
}
