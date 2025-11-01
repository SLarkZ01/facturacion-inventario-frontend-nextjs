import { NextResponse } from "next/server";
import { logoutService } from "@/lib/server/authServer";
import { cookies } from "next/headers";

export async function POST() {
  try {
    // Leemos refresh token de cookies HttpOnly
    const cookieStore = await cookies();
    const refresh = cookieStore.get("refresh_token")?.value;

    // Llamamos al backend para revocar el refresh token si existe
    if (refresh) {
      await logoutService(refresh);
    }

    const res = NextResponse.json({ ok: true });
    // Borramos cookies de sesión (NextResponse.cookies.delete acepta solo el nombre)
    res.cookies.delete("access_token");
    res.cookies.delete("refresh_token");

    return res;
  } catch {
    return NextResponse.json({ message: "Error en servidor" }, { status: 500 });
  }
}
