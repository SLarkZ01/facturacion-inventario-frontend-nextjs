import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { descargarPdfService } from "@/lib/server/facturasServer";

/**
 * GET /api/facturas/[id]/pdf
 * Descarga el PDF de una factura
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
    const result = await descargarPdfService(id, accessToken);

    if (result.status === 200 && result.body instanceof Blob) {
      // Retornar el PDF como blob
      return new NextResponse(result.body, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="factura-${id}.pdf"`,
        },
      });
    }

    return NextResponse.json(
      { error: "Error al descargar el PDF", details: result.body },
      { status: result.status }
    );
  } catch (error) {
    console.error("Error en GET /api/facturas/[id]/pdf:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
