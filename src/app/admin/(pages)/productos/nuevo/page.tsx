"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
type Taller = {
  id: number
  nombre: string
}

type Categoria = {
  id: string
  nombre: string
}

type FormValues = {
  nombre: string
  descripcion: string
  precio: string
  stock: string
  tallerId: string
  categoriaId: string
}

type FormErrors = Partial<Record<keyof FormValues, string>>

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

export default function NuevoProductoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tallerIdParam = searchParams.get("tallerId")

  const [values, setValues] = useState<FormValues>({
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
    tallerId: tallerIdParam || "",
    categoriaId: "",
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [images, setImages] = useState<ImagePreview[]>([])
  const [specs, setSpecs] = useState<Record<string, string>>({})
  
  const [talleres, setTalleres] = useState<Taller[]>([])
  const [loadingTalleres, setLoadingTalleres] = useState(true)
  
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loadingCategorias, setLoadingCategorias] = useState(false)

  // Cargar talleres
  useEffect(() => {
    async function loadTalleres() {
      try {
        const res = await fetch("/api/talleres")
        if (res.ok) {
          const data = await res.json()
          setTalleres(Array.isArray(data) ? data : [])
          
          // Si hay tallerId en URL y no está en values, asignarlo
          if (tallerIdParam && !values.tallerId) {
            setValues(prev => ({ ...prev, tallerId: tallerIdParam }))
          }
        }
      } catch (error) {
        console.error("Error loading talleres:", error)
      } finally {
        setLoadingTalleres(false)
      }
    }
    loadTalleres()
  }, [tallerIdParam])

  // Cargar categorías cuando se selecciona un taller
  useEffect(() => {
    if (!values.tallerId) {
      setCategorias([])
      return
    }

    async function loadCategorias() {
      setLoadingCategorias(true)
      try {
        const res = await fetch(`/api/categorias?tallerId=${values.tallerId}`)
        if (res.ok) {
          const data = await res.json()
          
          // Manejar diferentes estructuras de respuesta
          if (Array.isArray(data)) {
            setCategorias(data)
          } else if (data.categorias && Array.isArray(data.categorias)) {
            setCategorias(data.categorias)
          } else if (data.content && Array.isArray(data.content)) {
            setCategorias(data.content)
          } else {
            setCategorias([])
          }
        }
      } catch (error) {
        console.error("Error loading categorias:", error)
        setCategorias([])
      } finally {
        setLoadingCategorias(false)
      }
    }

    loadCategorias()
  }, [values.tallerId])

  function validate(): boolean {
    const newErrors: FormErrors = {}

    if (!values.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio"
    }

    if (!values.tallerId) {
      newErrors.tallerId = "Debes seleccionar un taller"
    }

    if (values.precio && isNaN(Number(values.precio))) {
      newErrors.precio = "El precio debe ser un número válido"
    }

    if (values.stock && isNaN(Number(values.stock))) {
      newErrors.stock = "El stock debe ser un número válido"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return

    const newImages: ImagePreview[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      newImages.push({
        file,
        preview: URL.createObjectURL(file),
      })
    }

    setImages((prev) => [...prev, ...newImages])
  }

  function removeImage(index: number) {
    setImages((prev) => {
      const newImages = [...prev]
      URL.revokeObjectURL(newImages[index].preview)
      newImages.splice(index, 1)
      return newImages
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
          secure_url: data.url, // Cloudinary ya devuelve secure_url
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
        precio: values.precio ? Number(values.precio) : undefined,
        stock: values.stock ? Number(values.stock) : undefined,
        tallerId: values.tallerId, // IMPORTANTE: Asocia producto a taller
        categoriaId: values.categoriaId || undefined,
        listaMedios: listaMedios.length > 0 ? listaMedios : undefined, // Con publicId
        specs: Object.keys(specs).length > 0 ? specs : undefined, // Especificaciones tecnicas
      }

      console.log("Creando producto con payload:", payload)

      const res = await fetch("/api/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        const createdProduct = await res.json()
        console.log("Producto creado exitosamente:", createdProduct)
        router.push("/admin/productos")
        router.refresh()
      } else {
        const errorData = await res.json()
        console.error("Error al crear producto:", errorData)
        alert(`Error: ${errorData.error || "No se pudo crear el producto"}`)
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error al crear el producto")
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
            <h1 className="text-2xl font-bold">Nuevo Producto</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Agrega un nuevo producto a tu inventario
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={onSubmit} className="bg-white rounded-2xl border p-6 shadow-sm space-y-6">
            <h3 className="font-medium text-lg">Información Básica</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label htmlFor="nombre">Nombre del Producto *</Label>
                <Input
                  id="nombre"
                  className="h-11"
                  value={values.nombre}
                  onChange={(e) => setValues({ ...values, nombre: e.target.value })}
                  placeholder="Ej: Filtro de Aceite Premium"
                />
                {errors.nombre && <p className="text-sm text-destructive mt-1">{errors.nombre}</p>}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <textarea
                  id="descripcion"
                  className="w-full rounded-md border px-4 py-3 min-h-[120px]"
                  value={values.descripcion}
                  onChange={(e) => setValues({ ...values, descripcion: e.target.value })}
                  placeholder="Describe el producto..."
                />
              </div>

              <div>
                <Label htmlFor="tallerId">Taller *</Label>
                <Select
                  value={values.tallerId}
                  onValueChange={(value) => {
                    setValues({ ...values, tallerId: value, categoriaId: "" })
                  }}
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

              <div>
                <Label htmlFor="categoriaId">Categoría</Label>
                <Select
                  value={values.categoriaId}
                  onValueChange={(value) => setValues({ ...values, categoriaId: value })}
                  disabled={!values.tallerId || loadingCategorias}
                >
                  <SelectTrigger id="categoriaId">
                    <SelectValue placeholder={
                      !values.tallerId 
                        ? "Selecciona un taller primero" 
                        : loadingCategorias 
                        ? "Cargando..." 
                        : "Selecciona una categoría"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.length === 0 && values.tallerId && !loadingCategorias && (
                      <div className="p-2 text-sm text-muted-foreground">
                        No hay categorías disponibles
                      </div>
                    )}
                    {categorias.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="precio">Precio</Label>
                <Input
                  id="precio"
                  type="number"
                  step="0.01"
                  min="0"
                  className="h-11"
                  value={values.precio}
                  onChange={(e) => setValues({ ...values, precio: e.target.value })}
                  placeholder="0.00"
                />
                {errors.precio && <p className="text-sm text-destructive mt-1">{errors.precio}</p>}
              </div>

              <div>
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  className="h-11"
                  value={values.stock}
                  onChange={(e) => setValues({ ...values, stock: e.target.value })}
                  placeholder="0"
                />
                {errors.stock && <p className="text-sm text-destructive mt-1">{errors.stock}</p>}
              </div>
            </div>

            {/* Especificaciones Técnicas */}
            <div className="border-t pt-6">
              <h4 className="font-medium mb-3">Especificaciones Técnicas</h4>
              <SpecsEditor specs={specs} onChange={setSpecs} />
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
                {isSubmitting ? "Creando..." : "Crear Producto"}
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
