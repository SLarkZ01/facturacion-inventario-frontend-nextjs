import { NextResponse } from "next/server";
import { listarMisTalleresService, crearTallerService } from "@/lib/server/talleresServer";
import { cookies } from "next/headers";

/**
 * GET /api/talleres
 * Lista los talleres donde el usuario es propietario
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const access = cookieStore.get("access_token")?.value;

    if (!access) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const result = await listarMisTalleresService(access);
    return NextResponse.json(result.body, { status: result.status });
  } catch {
    return NextResponse.json({ message: "Error en servidor" }, { status: 500 });
  }
}

/**
 * POST /api/talleres
 * Crea un nuevo taller
 */
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const access = cookieStore.get("access_token")?.value;

    if (!access) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const result = await crearTallerService(body, access);

    return NextResponse.json(result.body, { status: result.status });
  } catch {
    return NextResponse.json({ message: "Error en servidor" }, { status: 500 });
  }
}
