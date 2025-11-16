import Link from "next/link"
import Image from "next/image"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Edit, ImageIcon } from "lucide-react"
import { listarCategoriasService, type Categoria } from "@/lib/server/categoriasServer"
import { listarMisTalleresService } from "@/lib/server/talleresServer"
import { cookies } from "next/headers"
import DeleteCategoriaButton from "./DeleteCategoriaButton"

async function getCategoriasData() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("access_token")?.value

  if (!accessToken) {
    return { categorias: [], tallerId: null }
  }

  // Primero obtener los talleres del usuario
  const talleresResult = await listarMisTalleresService(accessToken)
  
  console.log("📍 Talleres del usuario:", talleresResult)
  
  if (talleresResult.status !== 200 || !Array.isArray(talleresResult.body) || talleresResult.body.length === 0) {
    return { categorias: [], tallerId: null }
  }

  // Usar el primer taller del usuario
  const primerTaller = talleresResult.body[0]
  const tallerId = primerTaller.id?.toString()

  console.log("🔑 TallerId seleccionado:", tallerId)

  if (!tallerId) {
    return { categorias: [], tallerId: null }
  }

  // Listar categorías del taller
  const result = await listarCategoriasService({ tallerId, todas: true }, accessToken)

  console.log("📦 Categorías obtenidas:", result)

  if (result.status === 200) {
    // Si es un array directo
    if (Array.isArray(result.body)) {
      console.log("✅ Retornando array directo con", result.body.length, "categorías")
      return { categorias: result.body as Categoria[], tallerId }
    }
    // Si es un objeto con campo "categorias"
    if (result.body && typeof result.body === "object" && "categorias" in result.body) {
      const cats = result.body.categorias as Categoria[]
      console.log("✅ Retornando desde campo 'categorias' con", cats.length, "elementos")
      return { categorias: cats, tallerId }
    }
    // Si es una respuesta paginada con campo "content"
    if (result.body && typeof result.body === "object" && "content" in result.body) {
      const cats = result.body.content as Categoria[]
      console.log("✅ Retornando desde campo 'content' con", cats.length, "elementos")
      return { categorias: cats, tallerId }
    }
  }

  return { categorias: [], tallerId }
}

export default async function CategoriasPage() {
  const { categorias, tallerId } = await getCategoriasData()

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Categorías</h1>
          <p className="text-sm text-muted-foreground mt-1">Organiza tus productos por categorías</p>
        </div>

        <div>
          {tallerId ? (
            <Link href={`/admin/categorias/nuevo?tallerId=${tallerId}`}>
              <Button variant="default" className="flex items-center gap-2">
                <Plus className="w-4 h-4" /> Nueva Categoría
              </Button>
            </Link>
          ) : (
            <Button variant="default" disabled className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> Nueva Categoría
            </Button>
          )}
        </div>
      </div>

      {!tallerId && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Atención:</strong> No tienes talleres asociados. Necesitas crear un taller primero para poder gestionar categorías.
          </p>
          <Link href="/admin/talleres" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
            Ir a Talleres →
          </Link>
        </div>
      )}

      {categorias.length === 0 && tallerId && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">No hay categorías creadas aún.</p>
          <Link href={`/admin/categorias/nuevo?tallerId=${tallerId}`}>
            <Button variant="default" className="mt-4">
              <Plus className="w-4 h-4 mr-2" /> Crear Primera Categoría
            </Button>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categorias.map((c) => {
          const primerMedio = c.listaMedios?.[0]
          const urlImagen = primerMedio?.secure_url || primerMedio?.url || primerMedio?.uri || ''
          const tipoMedio = primerMedio?.type || ''
          const esImagen = tipoMedio ? tipoMedio.startsWith('image') : true
          
          return (
            <Card key={c.id} className="relative overflow-hidden">
              {urlImagen && esImagen && (
                <div className="relative w-full h-48 bg-gray-100">
                  <Image
                    src={urlImagen}
                    alt={c.nombre}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
              {urlImagen && !esImagen && (
                <div className="relative w-full h-48 bg-gray-900 flex items-center justify-center">
                  <video
                    src={urlImagen}
                    className="w-full h-full object-cover"
                    muted
                  />
                </div>
              )}
              {!urlImagen && (
                <div className="relative w-full h-48 bg-gray-100 flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-gray-300" />
                </div>
              )}

              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <span className="font-medium">{c.nombre}</span>
                </CardTitle>
                <div className="absolute right-6 top-6">
                  <Badge variant="outline" className="bg-white/90 backdrop-blur-sm">
                    {c.listaMedios && c.listaMedios.length > 0 ? `${c.listaMedios.length} ${c.listaMedios.length === 1 ? 'medio' : 'medios'}` : "Sin medios"}
                  </Badge>
                </div>
                <CardDescription>{c.descripcion || "Sin descripción"}</CardDescription>
              </CardHeader>

              <CardContent>
                {/* Espacio adicional si es necesario */}
              </CardContent>

              <CardFooter className="flex gap-3">
                <Link href={`/admin/categorias/${c.id}`} className="w-full">
                  <Button variant="outline" className="w-full justify-center">
                    <Edit className="w-4 h-4" /> Editar
                  </Button>
                </Link>

                <DeleteCategoriaButton categoriaId={c.id} categoriaNombre={c.nombre} />
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
