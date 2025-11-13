"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2 } from "lucide-react"

type Categoria = {
  id: string
  title: string
  description?: string
  count?: number
}

const sample: Categoria[] = [
  { id: "filtros", title: "Filtros", description: "Filtros de aceite, aire y combustible", count: 45 },
  { id: "frenos", title: "Frenos", description: "Pastillas, discos y líquidos de freno", count: 38 },
  { id: "transmision", title: "Transmisión", description: "Cadenas, piñones y embragues", count: 56 },
  { id: "motor", title: "Motor", description: "Pistones, válvulas y componentes del motor", count: 67 },
  { id: "lubricantes", title: "Lubricantes", description: "Aceites y lubricantes especializados", count: 28 },
  { id: "neumaticos", title: "Neumáticos", description: "Neumáticos para todas las condiciones", count: 34 },
  { id: "electrico", title: "Eléctrico", description: "Baterías, cables y componentes eléctricos", count: 52 },
  { id: "suspension", title: "Suspensión", description: "Amortiguadores y componentes de suspensión", count: 41 },
]

export default function CategoriasPage() {
  const [items, setItems] = useState<Categoria[]>(sample)

  function onDelete(id: string) {
    if (!confirm("¿Eliminar categoría? Esta acción no se puede deshacer.")) return
    setItems((s) => s.filter((c) => c.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Categorías</h1>
          <p className="text-sm text-muted-foreground mt-1">Organiza tus productos por categorías</p>
        </div>

        <div>
          <Link href="/admin/categorias/nuevo">
            <Button variant="default" className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> Nueva Categoría
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((c) => (
          <Card key={c.id} className="relative">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span className="font-medium">{c.title}</span>
              </CardTitle>
              <div className="absolute right-6 top-6">
                <Badge variant="outline">{c.count ?? 0}</Badge>
              </div>
              <CardDescription>{c.description}</CardDescription>
            </CardHeader>

            <CardContent>
              {/* space for extra info if needed */}
            </CardContent>

            <CardFooter className="flex gap-3">
              <Link href={`/admin/categorias/${c.id}`} className="w-full">
                <Button variant="outline" className="w-full justify-center">
                  <Edit className="w-4 h-4" /> Editar
                </Button>
              </Link>

              <button
                onClick={() => onDelete(c.id)}
                className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                aria-label={`Eliminar ${c.title}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
