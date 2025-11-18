import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  obtenerFacturaService,
  emitirBorradorService,
  anularFacturaService,
  descargarPdfService,
  eliminarBorradorService,
} from "@/lib/server/facturasServer";

/**
 * GET /api/facturas/[id]
 * Obtiene una factura por ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const result = await obtenerFacturaService(id, accessToken);

    if (result.status === 200) {
      return NextResponse.json(result.body, { status: 200 });
    }

    return NextResponse.json(
      { error: "Error al obtener la factura", details: result.body },
      { status: result.status }
    );
  } catch (error) {
    console.error("Error en GET /api/facturas/[id]:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/facturas/[id]
 * Elimina una factura en estado BORRADOR
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const result = await eliminarBorradorService(id, accessToken);

    if (result.status === 200) {
      return NextResponse.json(
        { deleted: true, message: "Factura borrador eliminada exitosamente" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: "Error al eliminar la factura", details: result.body },
      { status: result.status }
    );
  } catch (error) {
    console.error("Error en DELETE /api/facturas/[id]:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
