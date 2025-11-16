"use client"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronLeft, Plus, Upload, X } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"

type FormValues = {
  nombre: string
  descripcion: string
  tallerId: string
}

type ImagePreview = {
  file: File
  preview: string
}

type Medio = {
  type: string
  publicId: string
  url: string
  secure_url?: string
  format?: string
  width?: number
  height?: number
  order?: number
}

type Taller = {
  id: number
  nombre: string
  descripcion?: string
}

export default function NuevaCategoriaPage() {
  const formRef = useRef<HTMLFormElement | null>(null)
  const searchParams = useSearchParams()
  const tallerIdParam = searchParams.get("tallerId") || ""
  
  const [values, setValues] = useState<FormValues>({
    nombre: "",
    descripcion: "",
    tallerId: tallerIdParam,
  })
  const [talleres, setTalleres] = useState<Taller[]>([])
  const [loadingTalleres, setLoadingTalleres] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [images, setImages] = useState<ImagePreview[]>([])
  const router = useRouter()
  
  useEffect(() => {
    async function loadTalleres() {
      try {
        const res = await fetch("/api/talleres")
        if (res.ok) {
          const data = await res.json()
          setTalleres(Array.isArray(data) ? data : [])
          
          // Si viene tallerId en la URL, usarlo
          if (tallerIdParam && !values.tallerId) {
            setValues(prev => ({ ...prev, tallerId: tallerIdParam }))
          } else if (data.length > 0 && !values.tallerId) {
            // Si no viene tallerId, usar el primero
            setValues(prev => ({ ...prev, tallerId: data[0].id.toString() }))
          }
        }
      } catch (error) {
        console.error("Error cargando talleres:", error)
      } finally {
        setLoadingTalleres(false)
      }
    }
    
    loadTalleres()
  }, [tallerIdParam])

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
        })
      }
    })

    setImages((prev) => [...prev, ...newImages])
  }

  function removeImage(index: number) {
    setImages((prev) => {
      const updated = [...prev]
      URL.revokeObjectURL(updated[index].preview)
      updated.splice(index, 1)
      return updated
    })
  }

  async function uploadToCloudinary(file: File): Promise<Medio | null> {
    const formData = new FormData()
    formData.append("file", file)
    
    console.log("Subiendo archivo:", file.name, "Tipo:", file.type, "Tamano:", file.size)
    
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      console.log("Respuesta del servidor de upload:", res.status, res.statusText)

      if (res.ok) {
        const data = await res.json()
        console.log("Archivo subido exitosamente:", data)
        
        // CRITICO: Construir objeto Medio COMPLETO con publicId
        const medio: Medio = {
          type: data.type || file.type,
          publicId: data.publicId, // CRITICO para poder eliminar de Cloudinary
          url: data.url,
          secure_url: data.url,
          format: data.type?.split('/')[1],
          width: data.width,
          height: data.height,
        }
        
        return medio
      } else {
        const errorData = await res.json()
        console.error("Error al subir archivo:", errorData)
      }
    } catch (error) {
      console.error("Error uploading:", error)
    }
    return null
  }

  async function onSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)

    try {
      // Subir imagenes
      const listaMedios: Medio[] = []
      
      console.log("Iniciando subida de", images.length, "archivos...")
      
      for (let i = 0; i < images.length; i++) {
        const img = images[i]
        const medio = await uploadToCloudinary(img.file)
        if (medio) {
          medio.order = i // Ordenar las imagenes
          listaMedios.push(medio)
          console.log("Archivo agregado a listaMedios:", medio.publicId)
        } else {
          console.warn("No se pudo subir:", img.file.name)
        }
      }

      console.log("Total archivos subidos:", listaMedios.length)

      // Validar que todos los medios tienen publicId
      const mediosSinPublicId = listaMedios.filter(m => !m.publicId)
      if (mediosSinPublicId.length > 0) {
        alert('Error: Algunas imagenes no tienen publicId. Intenta subirlas nuevamente.')
        setIsSubmitting(false)
        return
      }

      const payload = {
        nombre: values.nombre,
        descripcion: values.descripcion || undefined,
        tallerId: values.tallerId, // REQUERIDO: Todas las categorias pertenecen a un taller
        listaMedios: listaMedios.length > 0 ? listaMedios : undefined, // Con publicId
      }

      console.log("Creando categoria con payload:", payload)

      const res = await fetch("/api/categorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        const createdCategory = await res.json()
        console.log("Categoria creada exitosamente:", createdCategory)
        router.push("/admin/categorias")
        router.refresh()
      } else {
        const errorData = await res.json()
        console.error("Error al crear categoria:", errorData)
        alert(`Error: ${errorData.error || "No se pudo crear la categoria"}`)
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error al crear la categoria")
    } finally {
      setIsSubmitting(false)
    }
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
            <h1 className="text-2xl font-bold">Nueva Categoría</h1>
            <p className="text-sm text-gray-600 mt-1">Crea una nueva categoría de productos</p>
          </div>
        </div>
        <div>
          <Button
            onClick={() => formRef.current?.requestSubmit()}
            disabled={isSubmitting}
            className="bg-orange-600 text-white hover:bg-orange-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            {isSubmitting ? "Creando..." : "Crear Categoría"}
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
                <Select
                  value={values.tallerId}
                  onValueChange={(value) => setValues({ ...values, tallerId: value })}
                  disabled={loadingTalleres}
                >
                  <SelectTrigger id="tallerId">
                    <SelectValue placeholder="Selecciona un taller" />
                  </SelectTrigger>
                  <SelectContent>
                    {talleres.map((taller) => (
                      <SelectItem key={taller.id} value={taller.id.toString()}>
                        {taller.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.tallerId && <p className="text-sm text-destructive mt-1">{errors.tallerId}</p>}
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
                {isSubmitting ? "Creando..." : "Crear Categoría"}
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
                      {img.file.type.startsWith("image/") ? (
                        <Image
                          src={img.preview}
                          alt={`Preview ${index}`}
                          width={48}
                          height={48}
                          className="rounded object-cover"
                        />
                      ) : (
                        <video
                          src={img.preview}
                          className="w-12 h-12 rounded object-cover"
                        />
                      )}
                      <span className="flex-1 text-sm truncate">{img.file.name}</span>
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
