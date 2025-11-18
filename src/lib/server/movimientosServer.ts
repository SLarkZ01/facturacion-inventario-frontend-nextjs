import { cookies } from "next/headers";
import { BACKEND_BASE } from "@/lib/config";

/**
 * Servicio para manejar movimientos de stock
 * Proporciona funciones reutilizables para interactuar con la API de movimientos
 */

type MovimientoRequest = {
  tipo: string;
  productoId: string;
  cantidad: number;
  referencia?: string;
  observaciones?: string;
};

type Movimiento = {
  id: string;
  tipo: string;
  productoId: string;
  cantidad: number;
  creadoEn?: string; // Campo del backend
  fecha?: string; // Alias para compatibilidad
  referencia?: string;
  observaciones?: string;
  realizadoPor?: string; // Campo del backend
  usuarioId?: string; // Alias para compatibilidad
};

/**
 * Lista todos los movimientos de stock con filtros opcionales
 */
export async function listarMovimientosService(params?: {
  productoId?: string;
  tipo?: string;
}): Promise<Movimiento[]> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const queryParams = new URLSearchParams();
    if (params?.productoId) queryParams.append("productoId", params.productoId);
    if (params?.tipo) queryParams.append("tipo", params.tipo);

    const url = `${BACKEND_BASE}/api/movimientos${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Error listando movimientos:", response.status);
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : data.content || data.movimientos || [];
  } catch (error) {
    console.error("Error listando movimientos:", error);
    return [];
  }
}

/**
 * Obtiene un movimiento por su ID
 */
export async function obtenerMovimientoService(id: string): Promise<Movimiento | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${BACKEND_BASE}/api/movimientos/${id}`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(`Error obteniendo movimiento ${id}:`, response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`Error obteniendo movimiento ${id}:`, error);
    return null;
  }
}

/**
 * Crea un nuevo movimiento de stock
 */
export async function crearMovimientoService(payload: MovimientoRequest): Promise<void> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${BACKEND_BASE}/api/movimientos`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Error creando movimiento: ${response.status}`);
    }
  } catch (error) {
    console.error("Error creando movimiento:", error);
    throw error;
  }
}
