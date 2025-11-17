import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  listarFacturasService,
  crearFacturaService,
  crearBorradorService,
} from "@/lib/server/facturasServer";

/**
 * GET /api/facturas
 * Lista todas las facturas (opcionalmente filtradas por usuario)
 */
export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || undefined;

    const result = await listarFacturasService({ userId }, accessToken);

    if (result.status === 200) {
      return NextResponse.json(result.body, { status: 200 });
    }

    return NextResponse.json(
      { error: "Error al obtener las facturas", details: result.body },
      { status: result.status }
    );
  } catch (error) {
    console.error("Error en GET /api/facturas:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/facturas
 * Crea una nueva factura
 * Query param: ?tipo=borrador para crear borrador, por defecto crea EMITIDA
 */
export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get("tipo");

    console.log("📦 Body recibido en API route:", JSON.stringify(body, null, 2));
    console.log("🔖 Tipo de factura:", tipo || "emitida");

    let result;
    
    // Si tipo=borrador, crear borrador; de lo contrario, crear factura emitida
    if (tipo === "borrador") {
      result = await crearBorradorService(body, accessToken);
    } else {
      result = await crearFacturaService(body, accessToken);
    }

    console.log("📊 Resultado del servicio:", result.status, result.body);

    if (result.status === 200 || result.status === 201) {
      return NextResponse.json(result.body, { status: 201 });
    }

    return NextResponse.json(
      { error: "Error al crear la factura", details: result.body },
      { status: result.status }
    );
  } catch (error) {
    console.error("❌ Error en POST /api/facturas:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
