/**
 * productosServer.ts
 * Capa de servicio en el servidor para la gestión de productos.
 * Actúa como adaptador entre la app y el backend, siguiendo el patrón SOLID.
 */

import { BACKEND_BASE } from "@/lib/config";

export type ProductoRequest = {
  idString?: string;
  nombre: string;
  descripcion?: string;
  precio?: number;
  stock?: number;
  categoriaId?: string;
  imagenRecurso?: number;
  listaMedios?: Array<{ url?: string; uri?: string; type?: string; [key: string]: any }>;
  specs?: { [key: string]: string };
  tallerId?: string;
};

export type ListarProductosParams = {
  q?: string;
  categoriaId?: string;
  tallerId?: string;
  page?: number;
  size?: number;
};

export type Producto = {
  id: string;
  nombre: string;
  descripcion?: string;
  precio?: number;
  stock?: number;
  categoriaId?: string;
  imagenRecurso?: number;
  listaMedios?: Array<{ url?: string; uri?: string; type?: string; [key: string]: any }>;
  specs?: { [key: string]: string };
  tallerId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type PaginatedResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
};

/**
 * Lista los productos con filtros opcionales
 */
export async function listarProductosService(
  params: ListarProductosParams,
  accessToken?: string
) {
  const headers: Record<string, string> = {};
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const queryParams = new URLSearchParams();
  if (params.q) queryParams.append("q", params.q);
  if (params.categoriaId) queryParams.append("categoriaId", params.categoriaId);
  if (params.tallerId) queryParams.append("tallerId", params.tallerId);
  if (params.page !== undefined) queryParams.append("page", params.page.toString());
  if (params.size !== undefined) queryParams.append("size", params.size.toString());

  const queryString = queryParams.toString();
  const url = `${BACKEND_BASE}/api/productos${queryString ? `?${queryString}` : ""}`;

  console.log("🌐 Llamando al backend (productos):", url);

  const res = await fetch(url, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  console.log("📡 Respuesta del backend:", {
    status: res.status,
    statusText: res.statusText,
    contentType: res.headers.get("content-type"),
  });

  const text = await res.text();
  console.log("📄 Contenido de la respuesta:", text.substring(0, 500));

  try {
    const json = text ? JSON.parse(text) : null;
    return { status: res.status, body: json as PaginatedResponse<Producto> | Producto[] };
  } catch {
    console.error("❌ Error parseando JSON, respuesta es texto plano");
    return { status: res.status, body: text };
  }
}

/**
 * Obtiene un producto por ID
 */
export async function obtenerProductoService(id: string, accessToken?: string) {
  const headers: Record<string, string> = {};
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const url = `${BACKEND_BASE}/api/productos/${id}`;
  const res = await fetch(url, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  const text = await res.text();
  try {
    const json = text ? JSON.parse(text) : null;
    return { status: res.status, body: json as Producto };
  } catch {
    return { status: res.status, body: text };
  }
}

/**
 * Crea un nuevo producto
 */
export async function crearProductoService(
  producto: ProductoRequest,
  accessToken?: string
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const url = `${BACKEND_BASE}/api/productos`;
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(producto),
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
 * Actualiza un producto existente
 */
export async function actualizarProductoService(
  id: string,
  producto: ProductoRequest,
  accessToken?: string
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const url = `${BACKEND_BASE}/api/productos/${id}`;
  const res = await fetch(url, {
    method: "PUT",
    headers,
    body: JSON.stringify(producto),
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
 * Elimina un producto
 */
export async function eliminarProductoService(id: string, accessToken?: string) {
  const headers: Record<string, string> = {};
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const url = `${BACKEND_BASE}/api/productos/${id}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers,
  });

  return { status: res.status };
}
