"use client";

// lightweight fetch wrapper for auth flows; no React state required here

/**
 * Hook simple para hacer fetch con reintento de refresh automático.
 * Uso: const authFetch = useAuthFetch(); await authFetch(url, opts)
 */
export default function useAuthFetch() {
  async function authFetch(input: RequestInfo | URL, init?: RequestInit) {
    const res = await fetch(input, init);
    if (res.status !== 401) return res;

    // Intentar refresh una vez
    const refreshRes = await fetch("/api/auth/refresh", { method: "POST" });
    if (!refreshRes.ok) return res;

    // Reintentar la petición original
    const retry = await fetch(input, init);
    return retry;
  }

  return authFetch;
}
