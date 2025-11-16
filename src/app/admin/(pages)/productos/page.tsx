import Link from "next/link"
import Image from "next/image"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Edit, ImageIcon, Package } from "lucide-react"
import { listarProductosService, type Producto } from "@/lib/server/productosServer"
import { listarMisTalleresService } from "@/lib/server/talleresServer"
import { cookies } from "next/headers"
import DeleteProductoButton from "./DeleteProductoButton"

async function getProductosData() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("access_token")?.value

  if (!accessToken) {
    return { productos: [], tallerId: null }
  }

  // Primero obtener los talleres del usuario
  const talleresResult = await listarMisTalleresService(accessToken)
  
  console.log("📍 Talleres del usuario:", talleresResult)
  
  if (talleresResult.status !== 200 || !Array.isArray(talleresResult.body) || talleresResult.body.length === 0) {
    return { productos: [], tallerId: null }
  }

  // Usar el primer taller del usuario
  const primerTaller = talleresResult.body[0]
  const tallerId = primerTaller.id?.toString()

  console.log("🔑 TallerId seleccionado:", tallerId)

  if (!tallerId) {
    return { productos: [], tallerId: null }
  }

  // Listar productos del taller
  const result = await listarProductosService({ tallerId }, accessToken)

  console.log("📦 Productos obtenidos:", result)

  if (result.status === 200) {
    // Si es un array directo
    if (Array.isArray(result.body)) {
      console.log("✅ Retornando array directo con", result.body.length, "productos")
      return { productos: result.body as Producto[], tallerId }
    }
    // Si es un objeto con campo "productos"
    if (result.body && typeof result.body === "object" && "productos" in result.body) {
      const prods = (result.body as any).productos as Producto[]
      console.log("✅ Retornando desde campo 'productos' con", prods.length, "elementos")
      return { productos: prods, tallerId }
    }
    // Si es una respuesta paginada con campo "content"
    if (result.body && typeof result.body === "object" && "content" in result.body) {
      const prods = (result.body as any).content as Producto[]
      console.log("✅ Retornando desde campo 'content' con", prods.length, "elementos")
      return { productos: prods, tallerId }
    }
  }

  return { productos: [], tallerId }
}

export default async function ProductosPage() {
  const { productos, tallerId } = await getProductosData()

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Productos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Administra tu inventario de productos
          </p>
        </div>

        <div>
          {tallerId ? (
            <Link href={`/admin/productos/nuevo?tallerId=${tallerId}`}>
              <Button variant="default" className="flex items-center gap-2">
                <Plus className="w-4 h-4" /> Nuevo Producto
              </Button>
            </Link>
          ) : (
            <Button variant="default" disabled className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> Nuevo Producto
            </Button>
          )}
        </div>
      </div>

      {!tallerId && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Atención:</strong> No tienes talleres asociados. Necesitas crear un taller
            primero para poder gestionar productos.
          </p>
          <Link href="/admin/talleres" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
            Ir a Talleres →
          </Link>
        </div>
      )}

      {productos.length === 0 && tallerId && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No hay productos creados aún.</p>
          <p className="text-sm text-gray-500 mb-4">
            Comienza agregando tu primer producto al inventario
          </p>
          <Link href={`/admin/productos/nuevo?tallerId=${tallerId}`}>
            <Button variant="default">
              <Plus className="w-4 h-4 mr-2" /> Crear Primer Producto
            </Button>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {productos.map((p) => {
          const primerMedio = p.listaMedios?.[0]
          const urlImagen = primerMedio?.secure_url || primerMedio?.url || primerMedio?.uri || ""
          const tipoMedio = primerMedio?.type || ""
          const esImagen = tipoMedio ? tipoMedio.startsWith("image") : true

          return (
            <Card key={p.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
              {urlImagen && esImagen && (
                <div className="relative w-full h-48 bg-gray-100">
                  <Image
                    src={urlImagen}
                    alt={p.nombre}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
              {urlImagen && !esImagen && (
                <div className="relative w-full h-48 bg-gray-900 flex items-center justify-center">
                  <video src={urlImagen} className="w-full h-full object-cover" muted />
                </div>
              )}
              {!urlImagen && (
                <div className="relative w-full h-48 bg-gray-100 flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-gray-300" />
                </div>
              )}

              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-3">
                  <span className="font-medium truncate">{p.nombre}</span>
                </CardTitle>
                <div className="absolute right-4 top-52">
                  {p.stock !== undefined && (
                    <Badge variant={p.stock > 0 ? "default" : "destructive"}>
                      Stock: {p.stock}
                    </Badge>
                  )}
                </div>
                <CardDescription className="line-clamp-2">
                  {p.descripcion || "Sin descripción"}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-2">
                {p.precio !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Precio:</span>
                    <span className="text-lg font-bold text-green-600">
                      ${p.precio.toFixed(2)}
                    </span>
                  </div>
                )}
                {p.listaMedios && p.listaMedios.length > 1 && (
                  <p className="text-xs text-muted-foreground">
                    +{p.listaMedios.length - 1} {p.listaMedios.length === 2 ? "medio más" : "medios más"}
                  </p>
                )}
              </CardContent>

              <CardFooter className="flex gap-2">
                <Link href={`/admin/productos/${p.id}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    <Edit className="w-4 h-4 mr-2" /> Editar
                  </Button>
                </Link>

                <DeleteProductoButton productoId={p.id} productoNombre={p.nombre} />
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
