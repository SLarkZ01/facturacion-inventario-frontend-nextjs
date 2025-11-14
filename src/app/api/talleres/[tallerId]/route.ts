import { NextResponse } from "next/server";
import { obtenerTallerService, actualizarTallerService, eliminarTallerService } from "@/lib/server/talleresServer";
import { cookies } from "next/headers";

/**
 * GET /api/talleres/[tallerId]
 * Obtiene los detalles de un taller específico
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ tallerId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const access = cookieStore.get("access_token")?.value;

    if (!access) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { tallerId } = await params;
    const result = await obtenerTallerService(tallerId, access);
    return NextResponse.json(result.body, { status: result.status });
  } catch {
    return NextResponse.json({ message: "Error en servidor" }, { status: 500 });
  }
}

/**
 * PUT /api/talleres/[tallerId]
 * Actualiza un taller
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ tallerId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const access = cookieStore.get("access_token")?.value;

    if (!access) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { tallerId } = await params;
    const body = await request.json();
    const result = await actualizarTallerService(tallerId, body, access);

    return NextResponse.json(result.body, { status: result.status });
  } catch {
    return NextResponse.json({ message: "Error en servidor" }, { status: 500 });
  }
}

/**
 * DELETE /api/talleres/[tallerId]
 * Elimina un taller
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ tallerId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const access = cookieStore.get("access_token")?.value;

    if (!access) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { tallerId } = await params;
    const result = await eliminarTallerService(tallerId, access);

    return NextResponse.json(result.body, { status: result.status });
  } catch {
    return NextResponse.json({ message: "Error en servidor" }, { status: 500 });
  }
}
