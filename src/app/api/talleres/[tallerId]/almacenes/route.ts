import { NextResponse } from "next/server";
import { crearAlmacenService } from "@/lib/server/talleresServer";
import { cookies } from "next/headers";

/**
 * POST /api/talleres/[tallerId]/almacenes
 * Crea un almacén en un taller específico
 */
export async function POST(
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
    const result = await crearAlmacenService(tallerId, body, access);

    return NextResponse.json(result.body, { status: result.status });
  } catch {
    return NextResponse.json({ message: "Error en servidor" }, { status: 500 });
  }
}
