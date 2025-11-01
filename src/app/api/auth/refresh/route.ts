import { NextResponse } from "next/server";
import { refreshService } from "@/lib/server/authServer";
import { cookies } from "next/headers";

/**
 * POST /api/auth/refresh
 * Proxy que renueva el access token usando el refresh token almacenado en cookie HttpOnly.
 * Flujo:
 *  - Leer `refresh_token` desde cookies (HttpOnly)
 *  - Llamar al backend /api/auth/refresh
 *  - Si el backend devuelve nuevos tokens, actualizarlos en cookies HttpOnly
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    const refresh = cookieStore.get("refresh_token")?.value;

    if (!refresh) {
      return NextResponse.json({ message: "No refresh token" }, { status: 401 });
    }

    const result = await refreshService(refresh);

    const res = NextResponse.json(result.body, { status: result.status });

    // Actualizar cookies si el backend retorna nuevos tokens
    const access = result.body?.accessToken || result.body?.access_token || result.body?.token;
    const newRefresh = result.body?.refreshToken || result.body?.refresh_token;

    if (access) {
      res.cookies.set("access_token", access, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "lax",
      });
    }
    if (newRefresh) {
      res.cookies.set("refresh_token", newRefresh, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "lax",
      });
    }

    return res;
  } catch {
    return NextResponse.json({ message: "Error en servidor" }, { status: 500 });
  }
}
