import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { 
  eliminarCategoriaService, 
  obtenerCategoriaService,
  actualizarCategoriaService 
} from "@/lib/server/categoriasServer"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("access_token")?.value

  const result = await obtenerCategoriaService(id, accessToken)

  if (result.status === 200) {
    return NextResponse.json(result.body, { status: 200 })
  }

  return NextResponse.json(
    { error: "Error al obtener la categoría" },
    { status: result.status }
  )
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("access_token")?.value

  if (!accessToken) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    
    const result = await actualizarCategoriaService(id, body, accessToken)

    if (result.status === 200) {
      return NextResponse.json(result.body, { status: 200 })
    }

    return NextResponse.json(
      { error: "Error al actualizar la categoría", details: result.body },
      { status: result.status }
    )
  } catch (error) {
    console.error("Error en PUT /api/categorias/[id]:", error)
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
  const { id } = await params
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("access_token")?.value

  if (!accessToken) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const result = await eliminarCategoriaService(id, accessToken)

  if (result.status === 200 || result.status === 204) {
    return NextResponse.json({ success: true }, { status: 200 })
  }

  return NextResponse.json(
    { error: "Error al eliminar la categoría" },
    { status: result.status }
  )
}
