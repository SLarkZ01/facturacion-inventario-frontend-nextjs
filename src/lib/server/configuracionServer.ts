/**
 * configuracionServer.ts
 * Capa de servicio en el servidor para la gestión de configuración global del sistema.
 * Actúa como adaptador entre la app y el backend, siguiendo el patrón SOLID.
 */

import { BACKEND_BASE } from "@/lib/config";

/**
 * Tipo para la solicitud de actualización de configuración
 * Todos los campos son opcionales para permitir actualización parcial
 */
export type ConfiguracionRequest = {
  tasaIvaPorDefecto?: number;
  nombreEmpresa?: string;
  nit?: string;
  digitoVerificacion?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  ciudad?: string;
  departamento?: string;
  prefijoFactura?: string;
  resolucionDian?: string;
  fechaResolucionDian?: Date | string;
  rangoFacturaInicio?: number;
  rangoFacturaFin?: number;
};

/**
 * Tipo para la respuesta de configuración
 */
export type Configuracion = {
  id?: string;
  tasaIvaPorDefecto?: number;
  nombreEmpresa?: string;
  nit?: string;
  digitoVerificacion?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  ciudad?: string;
  departamento?: string;
  prefijoFactura?: string;
  resolucionDian?: string;
  fechaResolucionDian?: Date | string;
  rangoFacturaInicio?: number;
  rangoFacturaFin?: number;
  proximoNumeroFactura?: number;
  actualizadoEn?: Date | string;
};

/**
 * Obtiene la configuración global del sistema
 */
export async function obtenerConfiguracionService(accessToken?: string) {
  const headers: Record<string, string> = {};
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const url = `${BACKEND_BASE}/api/configuracion`;

  const res = await fetch(url, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  const text = await res.text();

  try {
    const json = text ? JSON.parse(text) : null;
    return { status: res.status, body: json as Configuracion };
  } catch {
    return { status: res.status, body: text };
  }
}

/**
 * Actualiza la configuración global del sistema
 * Solo se actualizan los campos enviados (actualización parcial)
 */
export async function actualizarConfiguracionService(
  data: ConfiguracionRequest,
  accessToken?: string
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const url = `${BACKEND_BASE}/api/configuracion`;

  const res = await fetch(url, {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
    cache: "no-store",
  });

  const text = await res.text();

  try {
    const json = text ? JSON.parse(text) : null;
    return { status: res.status, body: json as Configuracion };
  } catch {
    return { status: res.status, body: text };
  }
}
