import { NextResponse } from "next/server";
import {
  listarAlmacenesService,
  obtenerAlmacenService,
  actualizarAlmacenService,
  eliminarAlmacenService,
} from "@/lib/server/talleresServer";
import { cookies } from "next/headers";

/**
 * GET /api/talleres/[tallerId]/almacenes/[almacenId]
 * Obtiene los detalles de un almacén específico
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ tallerId: string; almacenId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const access = cookieStore.get("access_token")?.value;

    if (!access) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { tallerId, almacenId } = await params;
    const result = await obtenerAlmacenService(tallerId, almacenId, access);
    return NextResponse.json(result.body, { status: result.status });
  } catch {
    return NextResponse.json({ message: "Error en servidor" }, { status: 500 });
  }
}

/**
 * PUT /api/talleres/[tallerId]/almacenes/[almacenId]
 * Actualiza un almacén
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ tallerId: string; almacenId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const access = cookieStore.get("access_token")?.value;

    if (!access) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { tallerId, almacenId } = await params;
    const body = await request.json();
    const result = await actualizarAlmacenService(tallerId, almacenId, body, access);

    return NextResponse.json(result.body, { status: result.status });
  } catch {
    return NextResponse.json({ message: "Error en servidor" }, { status: 500 });
  }
}

/**
 * DELETE /api/talleres/[tallerId]/almacenes/[almacenId]
 * Elimina un almacén
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ tallerId: string; almacenId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const access = cookieStore.get("access_token")?.value;

    if (!access) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { tallerId, almacenId } = await params;
    const result = await eliminarAlmacenService(tallerId, almacenId, access);

    return NextResponse.json(result.body, { status: result.status });
  } catch {
    return NextResponse.json({ message: "Error en servidor" }, { status: 500 });
  }
}
