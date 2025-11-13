/**
 * stockServer.ts
 * Capa de servicio en el servidor para la gestión de stock/almacenes.
 * Actúa como adaptador entre la app y el backend.
 */

const BACKEND_BASE = process.env.BACKEND_BASE_URL || "http://localhost:8080";

type AjustarStockPayload = {
  productoId: string;
  almacenId: string;
  delta: number;
  motivo?: string;
};

type EstablecerStockPayload = {
  productoId: string;
  almacenId: string;
  cantidad: number;
  motivo?: string;
};

/**
 * Obtiene el stock de un producto desglosado por almacén
 */
export async function obtenerStockPorProductoService(productoId: string, accessToken?: string) {
  const headers: Record<string, string> = {};
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const res = await fetch(`${BACKEND_BASE}/api/stock?productoId=${productoId}`, {
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
 * Ajusta el stock (aumenta o disminuye) en un almacén específico
 */
export async function ajustarStockService(payload: AjustarStockPayload, accessToken?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const res = await fetch(`${BACKEND_BASE}/api/stock/adjust`, {
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
 * Establece el stock absoluto en un almacén específico
 */
export async function establecerStockService(payload: EstablecerStockPayload, accessToken?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const res = await fetch(`${BACKEND_BASE}/api/stock/set`, {
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
 * Elimina el registro de stock para un producto en un almacén
 */
export async function eliminarStockService(
  productoId: string,
  almacenId: string,
  accessToken?: string
) {
  const headers: Record<string, string> = {};
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const res = await fetch(
    `${BACKEND_BASE}/api/stock?productoId=${productoId}&almacenId=${almacenId}`,
    {
      method: "DELETE",
      headers,
    }
  );

  const text = await res.text();
  try {
    const json = text ? JSON.parse(text) : null;
    return { status: res.status, body: json };
  } catch {
    return { status: res.status, body: text };
  }
}
