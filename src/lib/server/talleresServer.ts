/**
 * talleresServer.ts
 * Capa de servicio en el servidor para la gestión de talleres y almacenes.
 * Actúa como adaptador entre la app y el backend, siguiendo el patrón SOLID.
 */

import { BACKEND_BASE } from "@/lib/config";

type CrearTallerPayload = {
  nombre: string;
  descripcion?: string;
  [k: string]: unknown;
};

type CrearAlmacenPayload = {
  nombre: string;
  direccion?: string;
  [k: string]: unknown;
};

type AceptarInvitacionPayload = {
  codigo: string;
};

type ActualizarTallerPayload = {
  nombre: string;
  descripcion?: string;
  [k: string]: unknown;
};

type ActualizarAlmacenPayload = {
  nombre: string;
  direccion?: string;
  [k: string]: unknown;
};

/**
 * Lista los talleres donde el usuario autenticado es propietario
 */
export async function listarMisTalleresService(accessToken?: string) {
  const headers: Record<string, string> = {};
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const res = await fetch(`${BACKEND_BASE}/api/talleres`, {
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
 * Crea un taller y lo asocia al usuario autenticado como propietario
 */
export async function crearTallerService(payload: CrearTallerPayload, accessToken?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const res = await fetch(`${BACKEND_BASE}/api/talleres`, {
    method: "POST",
    headers,
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

/**
 * Crea un almacén dentro de un taller existente
 */
export async function crearAlmacenService(
  tallerId: string,
  payload: CrearAlmacenPayload,
  accessToken?: string
) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const res = await fetch(`${BACKEND_BASE}/api/talleres/${tallerId}/almacenes`, {
    method: "POST",
    headers,
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

/**
 * Genera un código de invitación para que otros usuarios se unan al taller
 */
export async function crearInvitacionService(
  tallerId: string,
  payload: { rol: string; expiresInDays?: number },
  accessToken?: string
) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const res = await fetch(`${BACKEND_BASE}/api/talleres/${tallerId}/invitaciones/codigo`, {
    method: "POST",
    headers,
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

/**
 * Acepta una invitación usando un código
 */
export async function aceptarInvitacionService(
  payload: AceptarInvitacionPayload,
  accessToken?: string
) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const res = await fetch(`${BACKEND_BASE}/api/talleres/invitaciones/accept`, {
    method: "POST",
    headers,
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

/**
 * Obtiene los detalles de un taller específico
 */
export async function obtenerTallerService(tallerId: string, accessToken?: string) {
  const headers: Record<string, string> = {};
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const res = await fetch(`${BACKEND_BASE}/api/talleres/${tallerId}`, {
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
 * Actualiza un taller existente
 */
export async function actualizarTallerService(
  tallerId: string,
  payload: ActualizarTallerPayload,
  accessToken?: string
) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const res = await fetch(`${BACKEND_BASE}/api/talleres/${tallerId}`, {
    method: "PUT",
    headers,
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

/**
 * Elimina un taller
 */
export async function eliminarTallerService(tallerId: string, accessToken?: string) {
  const headers: Record<string, string> = {};
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const res = await fetch(`${BACKEND_BASE}/api/talleres/${tallerId}`, {
    method: "DELETE",
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
 * Lista los almacenes de un taller
 */
export async function listarAlmacenesService(tallerId: string, accessToken?: string) {
  const headers: Record<string, string> = {};
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const res = await fetch(`${BACKEND_BASE}/api/talleres/${tallerId}/almacenes`, {
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
 * Obtiene los detalles de un almacén específico
 */
export async function obtenerAlmacenService(
  tallerId: string,
  almacenId: string,
  accessToken?: string
) {
  const headers: Record<string, string> = {};
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const res = await fetch(`${BACKEND_BASE}/api/talleres/${tallerId}/almacenes/${almacenId}`, {
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
 * Actualiza un almacén existente
 */
export async function actualizarAlmacenService(
  tallerId: string,
  almacenId: string,
  payload: ActualizarAlmacenPayload,
  accessToken?: string
) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const res = await fetch(`${BACKEND_BASE}/api/talleres/${tallerId}/almacenes/${almacenId}`, {
    method: "PUT",
    headers,
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

/**
 * Elimina un almacén
 */
export async function eliminarAlmacenService(
  tallerId: string,
  almacenId: string,
  accessToken?: string
) {
  const headers: Record<string, string> = {};
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const res = await fetch(`${BACKEND_BASE}/api/talleres/${tallerId}/almacenes/${almacenId}`, {
    method: "DELETE",
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
