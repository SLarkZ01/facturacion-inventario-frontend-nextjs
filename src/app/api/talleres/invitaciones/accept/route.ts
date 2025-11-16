import { NextResponse } from "next/server";
import { aceptarInvitacionService } from "@/lib/server/talleresServer";
import { cookies } from "next/headers";

/**
 * POST /api/talleres/invitaciones/accept
 * Acepta una invitación para unirse a un taller
 */
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const access = cookieStore.get("access_token")?.value;

    if (!access) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const result = await aceptarInvitacionService(body, access);

    return NextResponse.json(result.body, { status: result.status });
  } catch {
    return NextResponse.json({ message: "Error en servidor" }, { status: 500 });
  }
}
