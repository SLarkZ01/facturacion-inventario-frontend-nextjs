import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { emitirBorradorService } from "@/lib/server/facturasServer";

/**
 * POST /api/facturas/[id]/emitir
 * Emite un borrador (cambia a EMITIDA y descuenta stock)
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
    const result = await emitirBorradorService(id, accessToken);

    if (result.status === 200) {
      return NextResponse.json(result.body, { status: 200 });
    }

    return NextResponse.json(
      { error: "Error al emitir el borrador", details: result.body },
      { status: result.status }
    );
  } catch (error) {
    console.error("Error en POST /api/facturas/[id]/emitir:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
