/**
 * authServer.ts
 * Capa de servicio en el servidor que actúa como adaptador entre la app
 * y el backend. Se encarga de comunicarse con las rutas de autenticación
 * del backend. Separar esta lógica facilita pruebas y mantiene el patrón
 * SOLID (una responsabilidad: hablar con el backend para auth).
 */

const BACKEND_BASE = process.env.BACKEND_BASE_URL || "http://localhost:8080";

type LoginPayload = {
  usernameOrEmail: string;
  password: string;
  device?: string;
};

type RegisterPayload = {
  username: string;
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  inviteCode?: string;
  [k: string]: unknown;
};

/**
 * Envía petición de login al backend y devuelve la respuesta tal cual.
 * @param payload Datos de login.
 */
export async function loginService(payload: LoginPayload) {
  const res = await fetch(`${BACKEND_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  // Intentar parsear JSON, si no es JSON, devolver como texto
  try {
    const json = text ? JSON.parse(text) : null;
    return { status: res.status, body: json };
  } catch {
    return { status: res.status, body: text };
  }
}

export async function logoutService(refreshToken?: string) {
  const body = refreshToken ? { refreshToken } : {};
  const res = await fetch(`${BACKEND_BASE}/api/auth/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  try {
    const json = text ? JSON.parse(text) : null;
    return { status: res.status, body: json };
  } catch {
    return { status: res.status, body: text };
  }
}


export async function registerService(payload: RegisterPayload) {
  const res = await fetch(`${BACKEND_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  try {
    const json = text ? JSON.parse(text) : null;
    return { status: res.status, body: json };
  } catch {
    return { status: res.status, body: text };
  }
}

export async function meService(accessToken?: string) {
  const headers: Record<string, string> = {};
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const res = await fetch(`${BACKEND_BASE}/api/auth/me`, {
    method: "GET",
    headers,
  });

  const text = await res.text();
  try {
    const json = text ? JSON.parse(text) : null;
    return { status: res.status, body: json };
  } catch {
    return { status: res.status, body: text };
  }
}

/**
 * Envía petición al backend para renovar el access token a partir del refresh token.
 * @param refreshToken El refresh token (puede venir de una cookie HttpOnly)
 */
export async function refreshService(refreshToken?: string) {
  const body = refreshToken ? { refreshToken } : {};
  const res = await fetch(`${BACKEND_BASE}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  try {
    const json = text ? JSON.parse(text) : null;
    return { status: res.status, body: json };
  } catch {
    return { status: res.status, body: text };
  }
}

/**
 * Intenta obtener los datos del usuario usando access token; si devuelve 401
 * y se pasa refreshToken, intentará renovar el token y repetir la petición.
 * Devuelve el resultado final del intento de `me` y, si hubo refresh exitoso,
 * incluye los nuevos tokens en `tokens`.
 */
export async function meWithAutoRefresh(accessToken?: string, refreshToken?: string) {
  // Intento con access token actual
  const first = await meService(accessToken);
  if (first.status === 200) {
    return { status: first.status, body: first.body };
  }

  // Si no hay refresh token o la respuesta no es 401, devolvemos el primer resultado
  if (!refreshToken || first.status !== 401) {
    return { status: first.status, body: first.body };
  }

  // Intentar refresh
  const refreshed = await refreshService(refreshToken);
  if (refreshed.status >= 200 && refreshed.status < 300) {
    // Intentar me con el nuevo accessToken que venga en el body
    const newAccess = refreshed.body?.accessToken || refreshed.body?.access_token || refreshed.body?.token;
    const newRefresh = refreshed.body?.refreshToken || refreshed.body?.refresh_token;

    const second = await meService(newAccess);
    return {
      status: second.status,
      body: second.body,
      tokens: { access: newAccess, refresh: newRefresh },
    };
  }

  return { status: refreshed.status, body: refreshed.body };
}
