"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronLeft, Save, Upload, X } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"

type FormValues = {
  nombre: string
  descripcion: string
  tallerId: string
}

type ImagePreview = {
  file?: File
  preview: string
  isExisting?: boolean
}

export default function EditarCategoriaPage() {
  const formRef = useRef<HTMLFormElement | null>(null)
  const [values, setValues] = useState<FormValues>({
    nombre: "",
    descripcion: "",
    tallerId: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [images, setImages] = useState<ImagePreview[]>([])
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  useEffect(() => {
    async function loadCategoria() {
      try {
        const res = await fetch(`/api/categorias/${id}`)
        if (res.ok) {
          const data = await res.json()
          setValues({
            nombre: data.nombre || "",
            descripcion: data.descripcion || "",
            tallerId: data.tallerId || "",
          })

          // Cargar imágenes existentes
          if (data.listaMedios && Array.isArray(data.listaMedios)) {
            const existingImages: ImagePreview[] = data.listaMedios.map((medio: any) => ({
              preview: medio.url || "",
              isExisting: true,
            }))
            setImages(existingImages)
          }
        } else {
          alert("Error al cargar la categoría")
          router.push("/admin/categorias")
        }
      } catch (error) {
        console.error("Error:", error)
        alert("Error al cargar la categoría")
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      loadCategoria()
    }
  }, [id, router])

  function validate() {
    const e: Record<string, string> = {}
    if (!values.nombre.trim()) e.nombre = "Nombre de la categoría es requerido"
    if (!values.tallerId.trim()) e.tallerId = "Taller es requerido"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return

    const newImages: ImagePreview[] = []
    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
        newImages.push({
          file,
          preview: URL.createObjectURL(file),
          isExisting: false,
        })
      }
    })

    setImages((prev) => [...prev, ...newImages])
  }

  function removeImage(index: number) {
    setImages((prev) => {
      const updated = [...prev]
      if (!updated[index].isExisting && updated[index].preview) {
        URL.revokeObjectURL(updated[index].preview)
      }
      updated.splice(index, 1)
      return updated
    })
  }

  async function uploadToCloudinary(file: File): Promise<string | null> {
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        return data.url
      }
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error)
    }
    return null
  }

  async function onSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)

    try {
      const uploadedUrls: Array<Record<string, unknown>> = []

      // Mantener imágenes existentes
      for (const img of images) {
        if (img.isExisting) {
          uploadedUrls.push({ url: img.preview })
        } else if (img.file) {
          const url = await uploadToCloudinary(img.file)
          if (url) {
            uploadedUrls.push({ url, type: img.file.type })
          }
        }
      }

      const payload = {
        nombre: values.nombre,
        descripcion: values.descripcion || undefined,
        tallerId: values.tallerId, // Obligatorio
        listaMedios: uploadedUrls.length > 0 ? uploadedUrls : undefined,
      }

      const res = await fetch(`/api/categorias/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        router.push("/admin/categorias")
        router.refresh()
      } else {
        const errorData = await res.json()
        alert(`Error: ${errorData.error || "No se pudo actualizar la categoría"}`)
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error al actualizar la categoría")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-start gap-4">
          <Skeleton className="w-9 h-9 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Skeleton className="h-96 rounded-2xl" />
          </div>
          <div>
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Volver"
            className="w-9 h-9 rounded-md border bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Editar Categoría</h1>
            <p className="text-sm text-gray-600 mt-1">Actualiza la información de la categoría</p>
          </div>
        </div>
        <div>
          <Button
            onClick={() => formRef.current?.requestSubmit()}
            disabled={isSubmitting}
            className="bg-orange-600 text-white hover:bg-orange-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border p-8 shadow-md">
          <form ref={formRef} onSubmit={onSubmit} className="space-y-6">
            <h3 className="font-semibold text-lg">Información Básica</h3>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="nombre">Nombre de la Categoría *</Label>
                <Input
                  id="nombre"
                  className="h-11"
                  value={values.nombre}
                  onChange={(e) => setValues({ ...values, nombre: e.target.value })}
                  placeholder="Ej: Filtros, Frenos, Transmisión"
                />
                {errors.nombre && <p className="text-sm text-destructive mt-1">{errors.nombre}</p>}
              </div>

              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <textarea
                  id="descripcion"
                  className="w-full rounded-md border px-4 py-3 min-h-[120px]"
                  value={values.descripcion}
                  onChange={(e) => setValues({ ...values, descripcion: e.target.value })}
                  placeholder="Describe esta categoría..."
                />
              </div>

              <div>
                <Label htmlFor="tallerId">Taller *</Label>
                <Input
                  id="tallerId"
                  className="h-11"
                  value={values.tallerId}
                  onChange={(e) => setValues({ ...values, tallerId: e.target.value })}
                  placeholder="ID del taller"
                  disabled
                />
                {errors.tallerId && <p className="text-sm text-destructive mt-1">{errors.tallerId}</p>}
                <p className="text-xs text-muted-foreground mt-1">
                  El taller no puede ser modificado
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" type="button" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-orange-600 text-white hover:bg-orange-700"
              >
                {isSubmitting ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border p-6 shadow-sm">
            <h4 className="font-medium mb-3">Imágenes y Videos</h4>
            <div>
              <Label htmlFor="media">Archivos multimedia</Label>
              <div className="mt-2">
                <label
                  htmlFor="media"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-gray-400" />
                    <p className="text-xs text-gray-500">Click para subir archivos</p>
                    <p className="text-xs text-gray-400">PNG, JPG, MP4</p>
                  </div>
                  <input
                    id="media"
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>

              {images.length > 0 && (
                <div className="mt-4 space-y-2">
                  {images.map((img, index) => (
                    <div
                      key={index}
                      className="relative flex items-center gap-3 p-2 border rounded-lg"
                    >
                      {img.isExisting ? (
                        <Image
                          src={img.preview}
                          alt={`Media ${index}`}
                          width={48}
                          height={48}
                          className="rounded object-cover"
                        />
                      ) : img.file?.type.startsWith("image/") ? (
                        <Image
                          src={img.preview}
                          alt={`Preview ${index}`}
                          width={48}
                          height={48}
                          className="rounded object-cover"
                        />
                      ) : (
                        <video src={img.preview} className="w-12 h-12 rounded object-cover" />
                      )}
                      <span className="flex-1 text-sm truncate">
                        {img.file?.name || "Archivo existente"}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="text-destructive hover:bg-destructive/10 p-1 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
