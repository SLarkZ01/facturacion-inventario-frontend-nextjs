import { NextResponse } from "next/server";
import { registerService } from "@/lib/server/authServer";

/**
 * POST /api/auth/register
 * Proxy para registro de usuario.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await registerService(body);
    const res = NextResponse.json(result.body, { status: result.status });

    const access = result.body?.accessToken || result.body?.access_token || result.body?.token;
    const refresh = result.body?.refreshToken || result.body?.refresh_token;
    if (access) {
      res.cookies.set("access_token", access, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "lax",
      });
    }
    if (refresh) {
      res.cookies.set("refresh_token", refresh, {
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
