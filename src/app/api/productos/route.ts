import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { crearProductoService, listarProductosService } from "@/lib/server/productosServer"

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("access_token")?.value

  if (!accessToken) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    
    const result = await crearProductoService(body, accessToken)

    if (result.status === 200 || result.status === 201) {
      return NextResponse.json(result.body, { status: 201 })
    }

    return NextResponse.json(
      { error: "Error al crear el producto", details: result.body },
      { status: result.status }
    )
  } catch (error) {
    console.error("Error en POST /api/productos:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("access_token")?.value

  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q") || undefined
  const categoriaId = searchParams.get("categoriaId") || undefined
  const tallerId = searchParams.get("tallerId") || undefined
  const page = searchParams.get("page") ? Number(searchParams.get("page")) : undefined
  const size = searchParams.get("size") ? Number(searchParams.get("size")) : undefined

  const result = await listarProductosService(
    { q, categoriaId, tallerId, page, size },
    accessToken
  )

  if (result.status === 200) {
    return NextResponse.json(result.body, { status: 200 })
  }

  return NextResponse.json(
    { error: "Error al obtener productos" },
    { status: result.status }
  )
}
