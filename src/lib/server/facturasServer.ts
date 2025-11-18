/**
 * facturasServer.ts
 * Capa de servicio en el servidor para la gestión de facturas.
 * Actúa como adaptador entre la app y el backend, siguiendo el patrón SOLID.
 */

import { BACKEND_BASE } from "@/lib/config";

/**
 * Tipo para un item de factura en la REQUEST (solo ID y cantidad)
 * El backend calcula automáticamente precios e IVA desde el producto
 */
export type FacturaItemRequest = {
  productoId: string;
  cantidad: number;
};

/**
 * Tipo para un item de factura en la RESPONSE (con todos los campos calculados)
 */
export type FacturaItemResponse = {
  productoId: string;
  cantidad: number;
  precioUnitario: number;
  nombreProducto?: string;
  subtotal?: number;
  iva?: number;
  totalItem?: number;
};

/**
 * Tipo para datos del cliente (snapshot embebido en factura)
 * Según cambios del backend - ya NO incluye documento, direccion, roles, activo
 */
export type Cliente = {
  id: string;
  username: string;
  email: string;
  nombre: string;
  apellido: string;
  fechaCreacion: string; // ISO 8601
};

/**
 * Tipo parcial para cliente (para formularios o cuando no todos los campos están disponibles)
 */
export type ClienteParcial = Partial<Cliente>;

/**
 * Tipo para la solicitud de creación de factura
 * Solo se envían productoId y cantidad; el backend calcula precios e IVA
 * 
 * IMPORTANTE sobre el cliente:
 * - Puedes enviar `clienteId` (String): el backend buscará el usuario y creará el snapshot
 * - Puedes enviar `cliente` (objeto): el backend guardará ese snapshot directamente
 * - Si envías ambos, el backend prioriza el objeto `cliente` embebido
 * - El cliente embebido es un snapshot histórico (no se actualiza si el usuario cambia)
 */
export type FacturaRequest = {
  numeroFactura?: string;
  clienteId?: string;
  cliente?: Cliente;
  items: FacturaItemRequest[];
  total?: number;
  realizadoPor?: string;
  estado?: string;
};

/**
 * Tipo para la respuesta de factura (con items completos calculados por el backend)
 */
export type Factura = {
  id: string;
  numeroFactura: string;
  clienteId?: string;
  cliente?: Cliente;
  items: FacturaItemResponse[];
  subtotal: number;
  totalIva: number;
  total: number;
  realizadoPor?: string;
  estado: "BORRADOR" | "EMITIDA" | "ANULADA";
  emitidaEn?: string; // Campo del backend
  anuladaEn?: string; // Campo del backend
  creadoEn?: string;  // Campo del backend
  modificadoEn?: string; // Campo del backend
  // Aliases para compatibilidad
  fechaEmision?: string;
  fechaAnulacion?: string;
  createdAt?: string;
  updatedAt?: string;
};

/**
 * Lista todas las facturas (opcionalmente filtradas por usuario)
 */
export async function listarFacturasService(
  params?: { userId?: string },
  accessToken?: string
) {
  const headers: Record<string, string> = {};
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const queryParams = new URLSearchParams();
  if (params?.userId) queryParams.append("userId", params.userId);
  
  // Agregar parámetros de paginación para obtener todas las facturas
  queryParams.append("size", "100"); // O un número alto suficiente
  queryParams.append("page", "0");

  const queryString = queryParams.toString();
  const url = `${BACKEND_BASE}/api/facturas${queryString ? `?${queryString}` : ""}`;

  const res = await fetch(url, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  const text = await res.text();

  try {
    const json = text ? JSON.parse(text) : null;
    return { status: res.status, body: json as Factura[] };
  } catch {
    return { status: res.status, body: text };
  }
}

/**
 * Obtiene una factura por ID
 */
export async function obtenerFacturaService(id: string, accessToken?: string) {
  const headers: Record<string, string> = {};
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const url = `${BACKEND_BASE}/api/facturas/${id}`;

  const res = await fetch(url, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  const text = await res.text();

  try {
    const json = text ? JSON.parse(text) : null;
    return { status: res.status, body: json as Factura };
  } catch {
    return { status: res.status, body: text };
  }
}

/**
 * Obtiene una factura por número
 */
export async function obtenerFacturaPorNumeroService(
  numero: string,
  accessToken?: string
) {
  const headers: Record<string, string> = {};
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const url = `${BACKEND_BASE}/api/facturas/numero/${numero}`;

  const res = await fetch(url, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  const text = await res.text();

  try {
    const json = text ? JSON.parse(text) : null;
    return { status: res.status, body: json as Factura };
  } catch {
    return { status: res.status, body: text };
  }
}

/**
 * Crea una factura emitida (descuenta stock automáticamente)
 */
export async function crearFacturaService(
  data: FacturaRequest,
  accessToken?: string
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const url = `${BACKEND_BASE}/api/facturas`;

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
    cache: "no-store",
  });

  const text = await res.text();

  try {
    const json = text ? JSON.parse(text) : null;
    return { status: res.status, body: json as Factura };
  } catch {
    return { status: res.status, body: text };
  }
}

/**
 * Crea una factura en borrador (NO descuenta stock)
 */
export async function crearBorradorService(
  data: FacturaRequest,
  accessToken?: string
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const url = `${BACKEND_BASE}/api/facturas/borrador`;

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
    cache: "no-store",
  });

  const text = await res.text();

  try {
    const json = text ? JSON.parse(text) : null;
    return { status: res.status, body: json as Factura };
  } catch {
    return { status: res.status, body: text };
  }
}

/**
 * Emite un borrador (cambia a EMITIDA y descuenta stock)
 */
export async function emitirBorradorService(id: string, accessToken?: string) {
  const headers: Record<string, string> = {};
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const url = `${BACKEND_BASE}/api/facturas/${id}/emitir`;

  const res = await fetch(url, {
    method: "POST",
    headers,
    cache: "no-store",
  });

  const text = await res.text();

  try {
    const json = text ? JSON.parse(text) : null;
    return { status: res.status, body: json as Factura };
  } catch {
    return { status: res.status, body: text };
  }
}

/**
 * Anula una factura emitida (NO devuelve stock automáticamente)
 */
export async function anularFacturaService(id: string, accessToken?: string) {
  const headers: Record<string, string> = {};
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const url = `${BACKEND_BASE}/api/facturas/${id}/anular`;

  const res = await fetch(url, {
    method: "POST",
    headers,
    cache: "no-store",
  });

  const text = await res.text();

  try {
    const json = text ? JSON.parse(text) : null;
    return { status: res.status, body: json as Factura };
  } catch {
    return { status: res.status, body: text };
  }
}

/**
 * Elimina una factura en estado BORRADOR
 * Solo se pueden eliminar facturas en estado BORRADOR
 */
export async function eliminarBorradorService(id: string, accessToken?: string) {
  const headers: Record<string, string> = {};
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const url = `${BACKEND_BASE}/api/facturas/${id}`;

  const res = await fetch(url, {
    method: "DELETE",
    headers,
    cache: "no-store",
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
 * Descarga el PDF de una factura
 */
export async function descargarPdfService(id: string, accessToken?: string) {
  const headers: Record<string, string> = {};
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const url = `${BACKEND_BASE}/api/facturas/${id}/pdf`;

  const res = await fetch(url, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  if (res.status === 200) {
    const blob = await res.blob();
    return { status: res.status, body: blob };
  }

  const text = await res.text();
  return { status: res.status, body: text };
}
