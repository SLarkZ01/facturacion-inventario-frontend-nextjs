import { NextResponse } from "next/server";
import { meService } from "@/lib/server/authServer";

/**
 * GET /api/auth/me
 * Proxy para obtener los datos del usuario autenticado. Pasa el header
 * Authorization hacia el backend.
 */
export async function GET(request: Request) {
  try {
    const auth = request.headers.get("authorization") || undefined;
    const token = auth?.startsWith("Bearer ") ? auth.split(" ")[1] : auth;
    const result = await meService(token);
    return NextResponse.json(result.body, { status: result.status });
  } catch {
    return NextResponse.json({ message: "Error en servidor" }, { status: 500 });
  }
}
