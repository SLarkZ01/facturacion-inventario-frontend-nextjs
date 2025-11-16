import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import {
  obtenerProductoService,
  actualizarProductoService,
  eliminarProductoService,
} from "@/lib/server/productosServer"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("access_token")?.value

  if (!accessToken) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params
  const result = await obtenerProductoService(id, accessToken)

  if (result.status === 200) {
    return NextResponse.json(result.body, { status: 200 })
  }

  return NextResponse.json(
    { error: "Error al obtener el producto" },
    { status: result.status }
  )
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("access_token")?.value

  if (!accessToken) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()

    const result = await actualizarProductoService(id, body, accessToken)

    if (result.status === 200) {
      return NextResponse.json(result.body, { status: 200 })
    }

    return NextResponse.json(
      { error: "Error al actualizar el producto", details: result.body },
      { status: result.status }
    )
  } catch (error) {
    console.error("Error en PUT /api/productos/[id]:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("access_token")?.value

  if (!accessToken) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params
  const result = await eliminarProductoService(id, accessToken)

  if (result.status === 200 || result.status === 204) {
    return NextResponse.json({ success: true }, { status: 200 })
  }

  return NextResponse.json(
    { error: "Error al eliminar el producto" },
    { status: result.status }
  )
}
