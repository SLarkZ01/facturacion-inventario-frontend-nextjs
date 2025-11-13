"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast/ToastProvider";

function CrearAlmacenForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { push: pushToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const tallerId = searchParams.get("tallerId");

  useEffect(() => {
    if (!tallerId) {
      pushToast({ title: "Error", description: "ID de taller no proporcionado", variant: "error" });
      router.push("/setup/taller");
    }
  }, [tallerId, router, pushToast]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) {
      pushToast({ title: "Error", description: "El nombre del almacén es requerido", variant: "error" });
      return;
    }

    if (!tallerId) {
      pushToast({ title: "Error", description: "ID de taller no válido", variant: "error" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/talleres/${tallerId}/almacenes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, direccion }),
      });

      if (!res.ok) {
        const error = await res.json();
        pushToast({
          title: "Error",
          description: error.message || "No se pudo crear el almacén",
          variant: "error",
        });
        return;
      }

      pushToast({ title: "Éxito", description: "Almacén creado correctamente", variant: "success" });
      // Redirigir al dashboard
      router.push("/admin/dashboard");
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
          <CardTitle>Crear Almacén</CardTitle>
          <CardDescription>
            Ahora crea un almacén para gestionar el stock de tus productos
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del Almacén *</Label>
              <Input
                id="nombre"
                type="text"
                placeholder="Ej: Bodega Principal"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección (opcional)</Label>
              <Input
                id="direccion"
                type="text"
                placeholder="Dirección física del almacén"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                disabled={loading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/setup/taller")}
              disabled={loading}
            >
              Atrás
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Creando..." : "Crear Almacén"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function CrearAlmacenPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <CrearAlmacenForm />
    </Suspense>
  );
}
