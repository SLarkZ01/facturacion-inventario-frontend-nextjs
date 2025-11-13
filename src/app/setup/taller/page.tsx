"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast/ToastProvider";

export default function CrearTallerPage() {
  const router = useRouter();
  const { push: pushToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) {
      pushToast({ title: "Error", description: "El nombre del taller es requerido", variant: "error" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/talleres", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, descripcion }),
      });

      if (!res.ok) {
        const error = await res.json();
        console.error("Error al crear taller:", error); // Debug
        pushToast({
          title: "Error",
          description: error.message || error.error || "No se pudo crear el taller",
          variant: "error",
        });
        return;
      }

      const data = await res.json();
      pushToast({ title: "Éxito", description: "Taller creado correctamente", variant: "success" });
      
      // Redirigir a crear almacén con el ID del taller
      const tallerId = data?.id || data?.tallerId || data?.taller?.id;
      if (tallerId) {
        router.push(`/setup/almacen?tallerId=${tallerId}`);
      } else {
        router.push("/admin/dashboard");
      }
    } catch {
      pushToast({ title: "Error", description: "Error de conexión con el servidor", variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Crear Tu Taller</CardTitle>
          <CardDescription>
            Primero necesitas crear un taller para gestionar tu inventario y ventas
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del Taller *</Label>
              <Input
                id="nombre"
                type="text"
                placeholder="Ej: Repuestos La Velocidad"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción (opcional)</Label>
              <Input
                id="descripcion"
                type="text"
                placeholder="Breve descripción de tu taller"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                disabled={loading}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creando..." : "Crear Taller"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
