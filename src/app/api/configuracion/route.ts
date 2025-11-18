import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { 
  obtenerConfiguracionService, 
  actualizarConfiguracionService 
} from "@/lib/server/configuracionServer";

/**
 * GET /api/configuracion
 * Obtiene la configuración global del sistema
 */
export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const result = await obtenerConfiguracionService(accessToken);

    if (result.status === 200) {
      return NextResponse.json(result.body, { status: 200 });
    }

    return NextResponse.json(
      { error: "Error al obtener la configuración", details: result.body },
      { status: result.status }
    );
  } catch (error) {
    console.error("Error en GET /api/configuracion:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/configuracion
 * Actualiza la configuración global del sistema
 * Solo se actualizan los campos enviados (actualización parcial)
 */
export async function PUT(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    const result = await actualizarConfiguracionService(body, accessToken);

    if (result.status === 200) {
      return NextResponse.json(result.body, { status: 200 });
    }

    return NextResponse.json(
      { error: "Error al actualizar la configuración", details: result.body },
      { status: result.status }
    );
  } catch (error) {
    console.error("Error en PUT /api/configuracion:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
