import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { BACKEND_BASE } from "@/lib/config";

/**
 * GET /api/stock/[productoId]?almacenId=xxx
 * Obtiene el stock de un producto, opcionalmente filtrado por almacén
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ productoId: string }> }
) {
  try {
    console.log("1. Inicio GET /api/stock/[productoId]");
    console.log("2. context.params:", context.params);
    
    const { productoId } = await context.params;
    console.log("3. productoId extraído:", productoId);
    
    const searchParams = request.nextUrl.searchParams;
    const almacenId = searchParams.get("almacenId");
    console.log("4. almacenId del query:", almacenId);

    // Obtener token de autenticación
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    console.log("5. Token obtenido:", accessToken ? "SÍ" : "NO");

    if (!accessToken) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    // Construir URL con query params si existen
    let url = `${BACKEND_BASE}/api/stock/${productoId}`;
    if (almacenId) {
      url += `?almacenId=${encodeURIComponent(almacenId)}`;
    }
    console.log("6. URL construida:", url);

    // Llamar al backend
    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });
    console.log("7. Response status del backend:", response.status);

    // Reenviar status y body del backend
    const body = await response.json().catch(() => ({}));
    console.log("8. Body del backend:", body);
    return NextResponse.json(body, { status: response.status });
    
  } catch (error: any) {
    console.error("Error en GET /api/stock/[productoId]:", error);
    return NextResponse.json(
      { error: "Error al obtener stock", message: error.message },
      { status: 500 }
    );
  }
}
