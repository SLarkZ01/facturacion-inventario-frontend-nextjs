"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type DeleteCategoriaButtonProps = {
  categoriaId: string
  categoriaNombre: string
}

export default function DeleteCategoriaButton({ categoriaId, categoriaNombre }: DeleteCategoriaButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/categorias/${categoriaId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        setIsOpen(false)
        router.refresh()
      } else {
        alert("Error al eliminar la categoría")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error al eliminar la categoría")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
          aria-label={`Eliminar ${categoriaNombre}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Estás seguro?</DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente la categoría{" "}
            <strong>{categoriaNombre}</strong>.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
