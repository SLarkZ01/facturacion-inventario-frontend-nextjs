"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface DeleteProductoButtonProps {
  productoId: string
  productoNombre: string
}

export default function DeleteProductoButton({
  productoId,
  productoNombre,
}: DeleteProductoButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    setIsDeleting(true)

    try {
      const res = await fetch(`/api/productos/${productoId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        setOpen(false)
        router.refresh()
      } else {
        const errorData = await res.json()
        alert(`Error: ${errorData.error || "No se pudo eliminar el producto"}`)
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error al eliminar el producto")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="icon">
          <Trash2 className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Eliminar producto?</DialogTitle>
          <DialogDescription>
            Estás a punto de eliminar el producto <strong>{productoNombre}</strong>.
            Esta acción no se puede deshacer y también eliminará las imágenes asociadas de Cloudinary.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
