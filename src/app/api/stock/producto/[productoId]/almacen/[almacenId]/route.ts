import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { BACKEND_BASE } from "@/lib/config";

/**
 * GET /api/stock/producto/{productoId}/almacen/{almacenId}
 * Obtiene el stock de un producto en un almacén específico
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ productoId: string; almacenId: string }> }
) {
  try {
    const { productoId, almacenId } = await context.params;

    // Obtener token de autenticación
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    // Llamar al backend con el endpoint correcto
    const url = `${BACKEND_BASE}/api/stock/producto/${productoId}/almacen/${almacenId}`;
    console.log("Llamando a:", url);

    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    // Reenviar status y body del backend
    const body = await response.json().catch(() => ({}));
    return NextResponse.json(body, { status: response.status });
    
  } catch (error: any) {
    console.error("Error en GET /api/stock/producto/[productoId]/almacen/[almacenId]:", error);
    return NextResponse.json(
      { error: "Error al obtener stock", message: error.message },
      { status: 500 }
    );
  }
}
