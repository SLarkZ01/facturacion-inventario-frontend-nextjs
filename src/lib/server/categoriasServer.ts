/**
 * categoriasServer.ts
 * Capa de servicio en el servidor para la gestión de categorías.
 * Actúa como adaptador entre la app y el backend, siguiendo el patrón SOLID.
 */

import { BACKEND_BASE } from "@/lib/config";

export type CategoriaRequest = {
  idString?: string;
  nombre: string;
  descripcion?: string;
  tallerId: string; // OBLIGATORIO según backend actualizado
  mappedGlobalCategoryId?: string;
  listaMedios?: Array<{ url?: string; uri?: string; type?: string; [key: string]: any }>;
};

export type ListarCategoriasParams = {
  tallerId: string; // OBLIGATORIO según backend actualizado
  q?: string;
  page?: number;
  size?: number;
  todas?: boolean;
};

export type Categoria = {
  id: string;
  nombre: string;
  descripcion?: string;
  tallerId?: string;
  mappedGlobalCategoryId?: string;
  listaMedios?: Array<{ url?: string; uri?: string; type?: string; [key: string]: any }>;
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
 * Lista las categorías de un taller específico
 */
export async function listarCategoriasService(
  params: ListarCategoriasParams,
  accessToken?: string
) {
  const headers: Record<string, string> = {};
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const queryParams = new URLSearchParams();
  queryParams.append("tallerId", params.tallerId); // Obligatorio
  if (params.q) queryParams.append("q", params.q);
  if (params.page !== undefined) queryParams.append("page", params.page.toString());
  if (params.size !== undefined) queryParams.append("size", params.size.toString());
  if (params.todas !== undefined) queryParams.append("todas", params.todas.toString());

  const queryString = queryParams.toString();
  const url = `${BACKEND_BASE}/api/categorias${queryString ? `?${queryString}` : ""}`;

  console.log("🌐 Llamando al backend:", url)

  const res = await fetch(url, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  console.log("📡 Respuesta del backend:", {
    status: res.status,
    statusText: res.statusText,
    contentType: res.headers.get('content-type')
  })

  const text = await res.text();
  console.log("📄 Contenido de la respuesta:", text.substring(0, 500))
  
  try {
    const json = text ? JSON.parse(text) : null;
    return { status: res.status, body: json as PaginatedResponse<Categoria> | Categoria[] };
  } catch {
    console.error("❌ Error parseando JSON, respuesta es texto plano")
    return { status: res.status, body: text };
  }
}

/**
 * Obtiene una categoría por su ID
 */
export async function obtenerCategoriaService(id: string, accessToken?: string) {
  const headers: Record<string, string> = {};
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const res = await fetch(`${BACKEND_BASE}/api/categorias/${id}`, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  const text = await res.text();
  try {
    const json = text ? JSON.parse(text) : null;
    return { status: res.status, body: json as Categoria };
  } catch {
    return { status: res.status, body: text };
  }
}

/**
 * Crea una nueva categoría
 */
export async function crearCategoriaService(
  payload: CategoriaRequest,
  accessToken?: string
) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const res = await fetch(`${BACKEND_BASE}/api/categorias`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  try {
    const json = text ? JSON.parse(text) : null;
    return { status: res.status, body: json as Categoria };
  } catch {
    return { status: res.status, body: text };
  }
}

/**
 * Actualiza una categoría existente
 */
export async function actualizarCategoriaService(
  id: string,
  payload: CategoriaRequest,
  accessToken?: string
) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const res = await fetch(`${BACKEND_BASE}/api/categorias/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  try {
    const json = text ? JSON.parse(text) : null;
    return { status: res.status, body: json as Categoria };
  } catch {
    return { status: res.status, body: text };
  }
}

/**
 * Elimina una categoría
 */
export async function eliminarCategoriaService(id: string, accessToken?: string) {
  const headers: Record<string, string> = {};
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const res = await fetch(`${BACKEND_BASE}/api/categorias/${id}`, {
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
