import { NextResponse } from "next/server";
import { loginService } from "@/lib/server/authServer";

/**
 * POST /api/auth/login
 * Proxy que recibe los datos de login desde el cliente, llama al backend
 * y devuelve la respuesta. Mantener la lógica en el servidor evita exponer
 * el BACKEND_BASE_URL al cliente y permite manipular cookies/headers si
 * en el futuro queremos setear HttpOnly tokens.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await loginService(body);

    const res = NextResponse.json(result.body, { status: result.status });

    // Si el backend retorna accessToken/refreshToken, los guardamos en cookies HttpOnly
    const access = result.body?.accessToken || result.body?.access_token || result.body?.token;
    const refresh = result.body?.refreshToken || result.body?.refresh_token;

    if (access) {
      res.cookies.set("access_token", access, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "lax",
        // no maxAge set here, backend controls expiry; optional: maxAge: 60*15
      });
    }
    if (refresh) {
      res.cookies.set("refresh_token", refresh, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "lax",
        // refresh tokens usually last longer
      });
    }

    return res;
  } catch {
    return NextResponse.json({ message: "Error en servidor" }, { status: 500 });
  }
}
