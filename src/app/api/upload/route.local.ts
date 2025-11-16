import { NextRequest, NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import { join } from "path"
import { randomUUID } from "crypto"

/**
 * Endpoint temporal para subir archivos localmente
 * 
 * NOTA: Esta es una implementación básica para desarrollo.
 * Para producción, se recomienda usar Cloudinary (ver route.cloudinary.ts)
 * 
 * @example
 * const formData = new FormData()
 * formData.append("file", file)
 * 
 * const res = await fetch("/api/upload", {
 *   method: "POST",
 *   body: formData,
 * })
 * 
 * const data = await res.json()
 * console.log(data.url) // URL del archivo
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó ningún archivo" },
        { status: 400 }
      )
    }

    // Validar tipo de archivo
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/quicktime",
    ]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, GIF, WEBP) y videos (MP4, MOV)",
        },
        { status: 400 }
      )
    }

    // Validar tamaño (máximo 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "El archivo es demasiado grande. Tamaño máximo: 10MB" },
        { status: 400 }
      )
    }

    // Generar nombre único para el archivo
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const extension = file.name.split(".").pop()
    const fileName = `${randomUUID()}.${extension}`
    
    // Guardar en public/uploads
    const uploadDir = join(process.cwd(), "public", "uploads", "categorias")
    const filePath = join(uploadDir, fileName)

    // Crear directorio si no existe
    const fs = await import("fs")
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    await writeFile(filePath, buffer)

    // Retornar URL relativa
    const url = `/uploads/categorias/${fileName}`

    return NextResponse.json(
      {
        url,
        fileName,
        size: file.size,
        type: file.type,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error al subir archivo:", error)
    return NextResponse.json(
      { error: "Error al subir el archivo" },
      { status: 500 }
    )
  }
}
