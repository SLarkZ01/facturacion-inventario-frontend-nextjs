import { NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

/**
 * Endpoint para subir archivos multimedia (imágenes y videos) a Cloudinary
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
 * console.log(data.url) // URL de Cloudinary
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

    // Convertir archivo a buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Subir a Cloudinary
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: process.env.CLOUDINARY_DEFAULT_FOLDER || "products",
          resource_type: file.type.startsWith("video") ? "video" : "image",
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )
      uploadStream.end(buffer)
    })

    console.log("✅ Archivo subido a Cloudinary:", uploadResult.secure_url)

    return NextResponse.json(
      {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        fileName: file.name,
        size: file.size,
        type: file.type,
        width: uploadResult.width,
        height: uploadResult.height,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("❌ Error al subir archivo a Cloudinary:", error)
    return NextResponse.json(
      { error: "Error al subir el archivo a Cloudinary" },
      { status: 500 }
    )
  }
}

/* ====================================================================
 * IMPLEMENTACIÓN CON CLOUDINARY (comentada)
 * ====================================================================
 * 
 * Para usar Cloudinary:
 * 1. Instalar: npm install cloudinary
 * 2. Configurar variables de entorno en .env:
 *    CLOUDINARY_CLOUD_NAME=tu_cloud_name
 *    CLOUDINARY_API_KEY=tu_api_key
 *    CLOUDINARY_API_SECRET=tu_api_secret
 * 3. Descomentar el código siguiente y comentar/eliminar la implementación local
 * 
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

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

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4", "video/quicktime"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de archivo no permitido" },
        { status: 400 }
      )
    }

    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "El archivo es demasiado grande. Tamaño máximo: 10MB" },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const resourceType = file.type.startsWith("video/") ? "video" : "image"

    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "categorias",
          resource_type: resourceType,
          ...(resourceType === "image" && {
            transformation: [
              { quality: "auto", fetch_format: "auto" },
            ],
          }),
        },
        (error: any, result: any) => {
          if (error) reject(error)
          else resolve(result)
        }
      )
      uploadStream.end(buffer)
    })

    return NextResponse.json(
      {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        resourceType: result.resource_type,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error al subir archivo a Cloudinary:", error)
    return NextResponse.json(
      { error: "Error al subir el archivo" },
      { status: 500 }
    )
  }
}
*/

