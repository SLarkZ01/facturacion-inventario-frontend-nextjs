/**
 * Central config for server-side constants.
 * Export BACKEND_BASE so service modules don't duplicate the same logic.
 */
export const BACKEND_BASE = process.env.BACKEND_BASE_URL || "http://localhost:8080";
