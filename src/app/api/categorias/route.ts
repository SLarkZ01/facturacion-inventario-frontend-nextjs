import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { crearCategoriaService, listarCategoriasService } from "@/lib/server/categoriasServer"

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("access_token")?.value

  if (!accessToken) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    
    const result = await crearCategoriaService(body, accessToken)

    if (result.status === 200 || result.status === 201) {
      return NextResponse.json(result.body, { status: 201 })
    }

    return NextResponse.json(
      { error: "Error al crear la categoría", details: result.body },
      { status: result.status }
    )
  } catch (error) {
    console.error("Error en POST /api/categorias:", error)
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
  const tallerId = searchParams.get("tallerId")
  
  if (!tallerId) {
    return NextResponse.json(
      { error: "tallerId es requerido" },
      { status: 400 }
    )
  }

  const q = searchParams.get("q") || undefined
  const page = searchParams.get("page") ? Number(searchParams.get("page")) : undefined
  const size = searchParams.get("size") ? Number(searchParams.get("size")) : undefined
  const todas = searchParams.get("todas") === "true" ? true : undefined

  const result = await listarCategoriasService(
    { tallerId, q, page, size, todas },
    accessToken
  )

  if (result.status === 200) {
    return NextResponse.json(result.body, { status: 200 })
  }

  return NextResponse.json(
    { error: "Error al obtener categorías" },
    { status: result.status }
  )
}
