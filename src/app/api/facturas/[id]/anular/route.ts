import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { anularFacturaService } from "@/lib/server/facturasServer";

/**
 * POST /api/facturas/[id]/anular
 * Anula una factura emitida
 */
export async function POST(
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
    const result = await anularFacturaService(id, accessToken);

    if (result.status === 200) {
      return NextResponse.json(result.body, { status: 200 });
    }

    return NextResponse.json(
      { error: "Error al anular la factura", details: result.body },
      { status: result.status }
    );
  } catch (error) {
    console.error("Error en POST /api/facturas/[id]/anular:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
