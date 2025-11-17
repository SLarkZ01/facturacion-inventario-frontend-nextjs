"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ChevronLeft, Upload, X } from "lucide-react"
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
import Image from "next/image"
import Loader from "@/components/ui/loading"

// ===================================================================
// COMPONENTE: Editor de Especificaciones Técnicas
// ===================================================================
function SpecsEditor({ specs, onChange }: { specs: Record<string, string>; onChange: (specs: Record<string, string>) => void }) {
  const [key, setKey] = useState('')
  const [value, setValue] = useState('')

  const handleAdd = () => {
    if (key.trim() && value.trim()) {
      onChange({ ...specs, [key.trim()]: value.trim() })
      setKey('')
      setValue('')
    }
  }

  const handleRemove = (keyToRemove: string) => {
    const newSpecs = { ...specs }
    delete newSpecs[keyToRemove]
    onChange(newSpecs)
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          placeholder="Clave (ej: Marca)"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="flex-1"
        />
        <Input
          placeholder="Valor (ej: Yamaha)"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="flex-1"
        />
        <Button
          type="button"
          onClick={handleAdd}
          variant="outline"
          size="sm"
        >
          Agregar
        </Button>
      </div>

      {Object.entries(specs).length > 0 && (
        <div className="space-y-2">
          {Object.entries(specs).map(([k, v]) => (
            <div key={k} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              <span className="font-semibold text-gray-700 text-sm">{k}:</span>
              <span className="flex-1 text-sm">{v}</span>
              <button
                type="button"
                onClick={() => handleRemove(k)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {Object.entries(specs).length === 0 && (
        <p className="text-gray-400 text-sm">No hay especificaciones agregadas</p>
      )}
    </div>
  )
}

// ===================================================================
// TIPOS
// ===================================================================
type Medio = {
  type?: string
  publicId: string
  url?: string
  secure_url?: string
  format?: string
  width?: number
  height?: number
  order?: number
}

type Producto = {
  id: string
  nombre: string
  descripcion?: string
  precio?: number
  tasaIva?: number
  stock?: number
  tallerId?: string
  categoriaId?: string
  listaMedios?: Medio[]
  specs?: Record<string, string>
}

type Taller = {
  id: number
  nombre: string
}

type Categoria = {
  id: string
  nombre: string
}

export default function EditarProductoPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [producto, setProducto] = useState<Producto | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [talleres, setTalleres] = useState<Taller[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loadingCategorias, setLoadingCategorias] = useState(false)

  const [images, setImages] = useState<Array<{ file: File; preview: string }>>([])
  const [specs, setSpecs] = useState<Record<string, string>>({})

  useEffect(() => {
    async function loadData() {
      try {
        const [productoRes, talleresRes] = await Promise.all([
          fetch(`/api/productos/${id}`),
          fetch("/api/talleres"),
        ])

        if (productoRes.ok) {
          const data = await productoRes.json()
          
          // El API devuelve { producto: {...} } en lugar del producto directamente
          const productoData = data.producto || data
          setProducto(productoData)
          
          // ✅ Cargar especificaciones técnicas si existen
          if (productoData.specs) {
            setSpecs(productoData.specs)
          }
        }

        if (talleresRes.ok) {
          const data = await talleresRes.json()
          setTalleres(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id])

  useEffect(() => {
    if (!producto?.tallerId) {
      setCategorias([])
      return
    }

    async function loadCategorias() {
      if (!producto) return
      
      setLoadingCategorias(true)
      try {
        const res = await fetch(`/api/categorias?tallerId=${producto.tallerId}`)
        if (res.ok) {
          const data = await res.json()
          setCategorias(
            Array.isArray(data)
              ? data
              : data.categorias || data.content || []
          )
        }
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoadingCategorias(false)
      }
    }

    loadCategorias()
  }, [producto?.tallerId])

  async function uploadToCloudinary(file: File): Promise<Medio | null> {
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (res.ok) {
        const data = await res.json()
        // ✅ CRÍTICO: Construir objeto Medio COMPLETO con publicId
        const medio: Medio = {
          type: data.type || file.type,
          publicId: data.publicId, // ✅ CRÍTICO para poder eliminar de Cloudinary
          url: data.url,
          secure_url: data.url,
          format: data.type?.split('/')[1],
          width: data.width,
          height: data.height,
        }
        return medio
      }
    } catch (error) {
      console.error("Error uploading:", error)
    }
    return null
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!producto) return

    setIsSubmitting(true)

    try {
      // Subir nuevas imágenes
      const newMedios: Medio[] = []
      for (let i = 0; i < images.length; i++) {
        const img = images[i]
        const medio = await uploadToCloudinary(img.file)
        if (medio) {
          medio.order = (producto.listaMedios?.length || 0) + i
          newMedios.push(medio)
        }
      }

      // ✅ Validar que todos los medios tienen publicId
      const allMedios = [...(producto.listaMedios || []), ...newMedios]
      const mediosSinPublicId = allMedios.filter(m => !m.publicId)
      if (mediosSinPublicId.length > 0) {
        alert('Error: Algunas imágenes no tienen publicId. Intenta subirlas nuevamente.')
        setIsSubmitting(false)
        return
      }

      const payload = {
        nombre: producto.nombre,
        descripcion: producto.descripcion || undefined,
        precio: producto.precio,
        tasaIva: producto.tasaIva,
        stock: producto.stock,
        tallerId: producto.tallerId, // ✅ IMPORTANTE
        categoriaId: producto.categoriaId || undefined,
        listaMedios: allMedios.length > 0 ? allMedios : undefined, // ✅ Con publicId
        specs: Object.keys(specs).length > 0 ? specs : undefined, // ✅ Especificaciones técnicas
      }

      const res = await fetch(`/api/productos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        router.push("/admin/productos")
        router.refresh()
      } else {
        const errorData = await res.json()
        alert(`Error: ${errorData.error || "No se pudo actualizar"}`)
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error al actualizar el producto")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    )
  }

  if (!producto) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Producto no encontrado</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="w-9 h-9 rounded-md border bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">Editar Producto</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Actualiza la información del producto
          </p>
        </div>
      </div>

      <form key={producto.id} onSubmit={onSubmit} className="bg-white rounded-2xl border p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              value={producto.nombre || ""}
              onChange={(e) => setProducto({ ...producto, nombre: e.target.value })}
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <textarea
              id="descripcion"
              className="w-full rounded-md border px-4 py-3 min-h-[100px]"
              value={producto.descripcion || ""}
              onChange={(e) => setProducto({ ...producto, descripcion: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="precio">Precio</Label>
            <Input
              id="precio"
              type="number"
              step="0.01"
              value={producto.precio ?? ""}
              onChange={(e) => setProducto({ ...producto, precio: e.target.value ? Number(e.target.value) : undefined })}
            />
          </div>

          <div>
            <Label htmlFor="tasaIva">Tasa IVA (%)</Label>
            <Input
              id="tasaIva"
              type="number"
              step="0.01"
              placeholder="Ej: 19"
              value={producto.tasaIva ?? ""}
              onChange={(e) => setProducto({ ...producto, tasaIva: e.target.value ? Number(e.target.value) : undefined })}
            />
          </div>

          <div>
            <Label htmlFor="stock">Stock</Label>
            <Input
              id="stock"
              type="number"
              value={producto.stock ?? ""}
              onChange={(e) => setProducto({ ...producto, stock: e.target.value ? Number(e.target.value) : undefined })}
            />
          </div>

          <div>
            <Label>Taller</Label>
            <Select
              value={producto.tallerId?.toString() || ""}
              onValueChange={(value) => setProducto({ ...producto, tallerId: value, categoriaId: "" })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un taller" />
              </SelectTrigger>
              <SelectContent>
                {talleres.map((t) => (
                  <SelectItem key={t.id} value={t.id.toString()}>
                    {t.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Categoría</Label>
            <Select
              value={producto.categoriaId || ""}
              onValueChange={(value) => setProducto({ ...producto, categoriaId: value })}
              disabled={loadingCategorias}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Especificaciones Técnicas */}
        <div className="border-t pt-6">
          <h4 className="font-medium mb-3">Especificaciones Técnicas</h4>
          <SpecsEditor specs={specs} onChange={setSpecs} />
        </div>

        {/* Imágenes del Producto */}
        <div className="border-t pt-6">
          <h4 className="font-medium mb-3">Imágenes del Producto</h4>
          
          {/* Imágenes Existentes */}
          {producto.listaMedios && producto.listaMedios.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Imágenes actuales:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {producto.listaMedios.map((medio, index) => (
                  <div key={index} className="relative group">
                    <div className="relative w-full h-32 rounded-lg overflow-hidden border">
                      <Image
                        src={medio.url || medio.secure_url || ""}
                        alt={`Imagen ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newListaMedios = producto.listaMedios?.filter((_, i) => i !== index)
                        setProducto({ ...producto, listaMedios: newListaMedios })
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nuevas Imágenes para Subir */}
          <div>
            <Label htmlFor="images">Agregar nuevas imágenes</Label>
            <Input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || [])
                const newImages = files.map((file) => ({
                  file,
                  preview: URL.createObjectURL(file),
                }))
                setImages([...images, ...newImages])
              }}
              className="mt-2"
            />
            
            {/* Preview de Nuevas Imágenes */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {images.map((img, index) => (
                  <div key={index} className="relative group">
                    <div className="relative w-full h-32 rounded-lg overflow-hidden border border-dashed border-blue-500">
                      <Image
                        src={img.preview}
                        alt={`Nueva imagen ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        URL.revokeObjectURL(img.preview)
                        setImages(images.filter((_, i) => i !== index))
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      Nueva
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </div>
  )
}
