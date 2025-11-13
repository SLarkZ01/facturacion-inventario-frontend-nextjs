import { NextResponse } from "next/server";
import { ajustarStockService, establecerStockService } from "@/lib/server/stockServer";
import { cookies } from "next/headers";

/**
 * POST /api/stock/adjust
 * Ajusta el stock (incrementa o decrementa)
 */
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const access = cookieStore.get("access_token")?.value;

    if (!access) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const result = await ajustarStockService(body, access);

    return NextResponse.json(result.body, { status: result.status });
  } catch {
    return NextResponse.json({ message: "Error en servidor" }, { status: 500 });
  }
}
