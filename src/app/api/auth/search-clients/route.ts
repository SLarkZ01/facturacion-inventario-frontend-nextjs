import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { BACKEND_BASE } from "@/lib/config";

/**
 * GET /api/auth/search-clients
 * Busca clientes (usuarios con rol CLIENT) para autocompletado
 */
export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");

    if (!q || q.length < 2) {
      return NextResponse.json(
        { error: "El término de búsqueda debe tener al menos 2 caracteres" },
        { status: 400 }
      );
    }

    const url = `${BACKEND_BASE}/api/auth/search-clients?q=${encodeURIComponent(q)}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error del backend:", errorText);
      return NextResponse.json(
        { error: "Error al buscar clientes", details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error en GET /api/auth/search-clients:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
