import { NextResponse } from "next/server";
import { meService } from "@/lib/server/authServer";
import { cookies } from "next/headers";

/**
 * GET /api/auth/me
 * Proxy para obtener los datos del usuario autenticado.
 * Usa el access_token de las cookies.
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const result = await meService(accessToken);
    return NextResponse.json(result.body, { status: result.status });
  } catch {
    return NextResponse.json({ message: "Error en servidor" }, { status: 500 });
  }
}
