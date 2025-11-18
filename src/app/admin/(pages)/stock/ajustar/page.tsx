"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Plus, Minus, Save } from "lucide-react";
import Link from "next/link";
import Loader from "@/components/ui/loading";

type Producto = {
  id: string;
  nombre: string;
  stock: number;
};

type Almacen = {
  id: string;
  nombre: string;
  ubicacion?: string;
};

type TipoAjuste = "set" | "adjust";

export default function AjustarStockPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [productos, setProductos] = useState<Producto[]>([]);
  const [almacenes, setAlmacenes] = useState<Almacen[]>([]);

  const [productoId, setProductoId] = useState("");
  const [almacenId, setAlmacenId] = useState("");
  const [tipoAjuste, setTipoAjuste] = useState<TipoAjuste>("adjust");
  const [cantidad, setCantidad] = useState("");
  const [motivo, setMotivo] = useState("");

  const [stockActual, setStockActual] = useState<number | null>(null);

  // Cargar productos y almacenes
  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);

      try {
        // Cargar productos
        const productosRes = await fetch("/api/productos");
        if (productosRes.ok) {
          const data = await productosRes.json();
          const productosList = Array.isArray(data) ? data : data.productos || data.content || [];
          setProductos(productosList);
        }

        // Cargar talleres para obtener el ID
        const talleresRes = await fetch("/api/talleres");
        if (talleresRes.ok) {
          const talleres = await talleresRes.json();
          if (Array.isArray(talleres) && talleres.length > 0) {
            const primerTaller = talleres[0];
            const tallerId = primerTaller.id;
            
            // Cargar almacenes del taller
            if (tallerId) {
              const almacenesRes = await fetch(`/api/talleres/${tallerId}/almacenes`);
              if (almacenesRes.ok) {
                const almacenesData = await almacenesRes.json();
                setAlmacenes(Array.isArray(almacenesData) ? almacenesData : []);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  // Obtener stock actual cuando se seleccionan producto y almacén
  useEffect(() => {
    if (!productoId || !almacenId) {
      setStockActual(null);
      return;
    }

    const obtenerStock = async () => {
      try {
        // Usar el endpoint correcto según la documentación del backend
        const res = await fetch(`/api/stock/producto/${productoId}/almacen/${almacenId}`);
        if (res.ok) {
          const data = await res.json();
          // El backend devuelve { cantidad: number }
          setStockActual(data.cantidad ?? 0);
        } else if (res.status === 404) {
          // No hay stock registrado, asumir 0
          setStockActual(0);
        } else {
          setStockActual(0);
        }
      } catch (error) {
        console.error("Error obteniendo stock:", error);
        setStockActual(0);
      }
    };

    obtenerStock();
  }, [productoId, almacenId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productoId || !almacenId || !cantidad) {
      alert("Completa todos los campos obligatorios");
      return;
    }

    const cantidadNum = Number(cantidad);
    if (isNaN(cantidadNum)) {
      alert("La cantidad debe ser un número válido");
      return;
    }

    if (tipoAjuste === "adjust" && cantidadNum === 0) {
      alert("El ajuste debe ser diferente de 0");
      return;
    }

    if (tipoAjuste === "set" && cantidadNum < 0) {
      alert("La cantidad no puede ser negativa");
      return;
    }

    setGuardando(true);

    try {
      const payload = {
        productoId,
        almacenId,
        [tipoAjuste === "set" ? "cantidad" : "delta"]: cantidadNum,
        motivo: motivo || undefined,
      };

      const endpoint = tipoAjuste === "set" ? "/api/stock/set" : "/api/stock/adjust";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/admin/stock");
        router.refresh();
      } else {
        const errorData = await res.json();
        alert(errorData.error || errorData.message || "Error al ajustar stock");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al procesar la solicitud");
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  const productoSeleccionado = productos.find((p) => p.id === productoId);
  const almacenSeleccionado = almacenes.find((a) => a.id === almacenId);

  const calcularNuevoStock = (): number | null => {
    if (stockActual === null || !cantidad) return null;
    
    const cantidadNum = Number(cantidad);
    if (isNaN(cantidadNum)) return null;

    if (tipoAjuste === "set") {
      return cantidadNum;
    } else {
      return stockActual + cantidadNum;
    }
  };

  const nuevoStock = calcularNuevoStock();

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/stock">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" /> Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Ajustar Stock</h1>
          <p className="text-sm text-muted-foreground">
            Modificar cantidad de stock en almacenes
          </p>
        </div>
      </div>

      {almacenes.length === 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <p className="text-sm text-yellow-800">
              <strong>Atención:</strong> No hay almacenes configurados. Para usar esta funcionalidad,
              primero crea almacenes en el módulo de Talleres.
            </p>
            <Link href="/admin/talleres">
              <Button variant="outline" size="sm" className="mt-3">
                Ir a Talleres
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información del Ajuste</CardTitle>
            <CardDescription>
              Selecciona el producto, almacén y tipo de ajuste
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Tipo de ajuste */}
            <div>
              <Label htmlFor="tipoAjuste">Tipo de Ajuste</Label>
              <Select
                value={tipoAjuste}
                onValueChange={(value) => setTipoAjuste(value as TipoAjuste)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="adjust">
                    <div className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      <span>Ajustar (incremento/decremento)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="set">
                    <div className="flex items-center gap-2">
                      <Minus className="w-4 h-4" />
                      <span>Establecer (valor absoluto)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {tipoAjuste === "adjust"
                  ? "Aumenta o disminuye el stock actual (usa + para aumentar, - para disminuir)"
                  : "Establece un valor exacto de stock (reemplaza el valor anterior)"}
              </p>
            </div>

            {/* Producto */}
            <div>
              <Label htmlFor="producto">Producto *</Label>
              <Select value={productoId} onValueChange={setProductoId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleccionar producto" />
                </SelectTrigger>
                <SelectContent>
                  {productos.map((producto) => (
                    <SelectItem key={producto.id} value={producto.id}>
                      {producto.nombre} (Stock total: {producto.stock})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Almacén */}
            <div>
              <Label htmlFor="almacen">Almacén *</Label>
              <Select
                value={almacenId}
                onValueChange={setAlmacenId}
                disabled={almacenes.length === 0}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleccionar almacén" />
                </SelectTrigger>
                <SelectContent>
                  {almacenes.map((almacen) => (
                    <SelectItem key={almacen.id} value={almacen.id}>
                      {almacen.nombre}
                      {almacen.ubicacion && ` - ${almacen.ubicacion}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Stock actual */}
            {stockActual !== null && productoId && almacenId && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm font-medium text-blue-900">
                  Stock actual en {almacenSeleccionado?.nombre}: {stockActual} unidades
                </p>
              </div>
            )}

            {/* Cantidad */}
            <div>
              <Label htmlFor="cantidad">
                {tipoAjuste === "adjust" ? "Cantidad a ajustar *" : "Nueva cantidad *"}
              </Label>
              <Input
                id="cantidad"
                type="number"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                placeholder={tipoAjuste === "adjust" ? "Ej: +10 o -5" : "Ej: 50"}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {tipoAjuste === "adjust"
                  ? "Usa números positivos para aumentar, negativos para disminuir"
                  : "Establece la cantidad exacta que quedará en el almacén"}
              </p>
            </div>

            {/* Previsualización */}
            {nuevoStock !== null && productoId && almacenId && (
              <div className={`border rounded-lg p-3 ${nuevoStock < 0 ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
                <p className="text-sm font-medium">
                  <span className={nuevoStock < 0 ? "text-red-900" : "text-green-900"}>
                    Nuevo stock: {nuevoStock} unidades
                  </span>
                </p>
                {nuevoStock < 0 && (
                  <p className="text-xs text-red-700 mt-1">
                    ⚠️ El stock no puede ser negativo
                  </p>
                )}
              </div>
            )}

            {/* Motivo */}
            <div>
              <Label htmlFor="motivo">Motivo (opcional)</Label>
              <Textarea
                id="motivo"
                value={motivo}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMotivo(e.target.value)}
                placeholder="Ej: Ajuste por inventario físico, corrección de error, entrada de mercancía..."
                rows={3}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Botones */}
        <div className="flex gap-3">
          <Link href="/admin/stock" className="flex-1">
            <Button type="button" variant="outline" className="w-full">
              Cancelar
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={guardando || !productoId || !almacenId || !cantidad || (nuevoStock !== null && nuevoStock < 0) || almacenes.length === 0}
            className="flex-1"
          >
            {guardando ? (
              <>Guardando...</>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" /> Guardar Ajuste
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
