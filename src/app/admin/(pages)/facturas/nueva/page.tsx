"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Save, FilePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import Loader from "@/components/ui/loading";
import { ClientSearch, type ClientSearchResult } from "../components/ClientSearch";

type Producto = {
  id: string;
  nombre: string;
  precio: number;
  tasaIva?: number;
  stock?: number;
};

type ItemFactura = {
  productoId: string;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  tasaIva: number;
};

export default function NuevaFacturaPage() {
  const router = useRouter();
  
  // Estados
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [items, setItems] = useState<ItemFactura[]>([]);
  
  // Datos del cliente - ahora usa autocompletado
  const [selectedClient, setSelectedClient] = useState<ClientSearchResult | null>(null);

  // Producto seleccionado para agregar
  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [cantidad, setCantidad] = useState(1);

  // Cargar productos disponibles
  useEffect(() => {
    const cargarProductos = async () => {
      setLoading(true);

      try {
        const response = await fetch("/api/productos");

        if (!response.ok) {
          throw new Error("Error al cargar productos");
        }

        const data = await response.json();
        
        // Extraer productos correctamente
        let productosList: Producto[] = [];
        if (Array.isArray(data)) {
          productosList = data;
        } else if (data.productos && Array.isArray(data.productos)) {
          productosList = data.productos;
        } else if (data.content && Array.isArray(data.content)) {
          productosList = data.content;
        }

        setProductos(productosList);
      } catch (error) {
        console.error("Error cargando productos:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarProductos();
  }, []);

  // Agregar item a la factura
  const agregarItem = () => {
    if (!productoSeleccionado || cantidad <= 0) {
      alert("Seleccione un producto y cantidad válida");
      return;
    }

    const producto = productos.find((p) => p.id === productoSeleccionado);
    if (!producto) return;

    // Verificar stock si está disponible
    if (producto.stock !== undefined && cantidad > producto.stock) {
      alert(`Stock insuficiente. Disponible: ${producto.stock}`);
      return;
    }

    const nuevoItem: ItemFactura = {
      productoId: producto.id,
      nombreProducto: producto.nombre,
      cantidad,
      precioUnitario: producto.precio,
      tasaIva: producto.tasaIva || 19,
    };

    setItems([...items, nuevoItem]);
    setProductoSeleccionado("");
    setCantidad(1);
  };

  // Eliminar item
  const eliminarItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Calcular subtotal de un item
  const calcularSubtotal = (item: ItemFactura) => {
    return item.cantidad * item.precioUnitario;
  };

  // Calcular IVA de un item
  const calcularIva = (item: ItemFactura) => {
    const subtotal = calcularSubtotal(item);
    return (subtotal * item.tasaIva) / 100;
  };

  // Calcular total de un item
  const calcularTotalItem = (item: ItemFactura) => {
    return calcularSubtotal(item) + calcularIva(item);
  };

  // Calcular totales generales
  const subtotalGeneral = items.reduce((sum, item) => sum + calcularSubtotal(item), 0);
  const ivaGeneral = items.reduce((sum, item) => sum + calcularIva(item), 0);
  const totalGeneral = subtotalGeneral + ivaGeneral;

  // Formatear moneda
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Crear factura
  const crearFactura = async (tipo: "emitida" | "borrador") => {
    if (items.length === 0) {
      alert("Debe agregar al menos un producto");
      return;
    }

    setGuardando(true);

    try {
      // El backend calcula automáticamente precios e IVA
      // Solo enviamos productoId y cantidad
      const payload: any = {
        items: items.map((item) => ({
          productoId: item.productoId,
          cantidad: item.cantidad,
        })),
      };

      // Si hay cliente seleccionado, enviamos su ID
      // El backend cargará automáticamente el snapshot del usuario
      if (selectedClient) {
        payload.clienteId = selectedClient.id;
      }

      console.log("Payload enviado:", JSON.stringify(payload, null, 2));

      const url = tipo === "borrador" ? "/api/facturas?tipo=borrador" : "/api/facturas";

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error del servidor:", errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || errorData.message || "Error al crear la factura");
        } catch {
          throw new Error(`Error al crear la factura: ${response.status} - ${errorText}`);
        }
      }

      const data = await response.json();
      const facturaId = data.id || (data.factura && data.factura.id);

      // Redirigir a la factura creada
      if (facturaId) {
        router.push(`/admin/facturas/${facturaId}`);
      } else {
        router.push("/admin/facturas");
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error desconocido");
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

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/facturas">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" /> Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Nueva Factura</h1>
          <p className="text-sm text-muted-foreground">
            Crea una nueva factura de venta
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda: Formulario */}
        <div className="lg:col-span-2 space-y-6">
          {/* Buscar Cliente */}
          <Card>
            <CardHeader>
              <CardTitle>Cliente</CardTitle>
              <CardDescription>
                Busca y selecciona un cliente para la factura (opcional)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClientSearch
                selectedClient={selectedClient}
                onClientSelect={setSelectedClient}
              />
              {selectedClient && (
                <p className="text-xs text-muted-foreground mt-2">
                  El backend cargará automáticamente los datos del cliente al crear la factura
                </p>
              )}
            </CardContent>
          </Card>

          {/* Agregar productos */}
          <Card>
            <CardHeader>
              <CardTitle>Agregar Productos</CardTitle>
              <CardDescription>
                Selecciona los productos y cantidades para la factura
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="producto">Producto</Label>
                  <Select
                    value={productoSeleccionado}
                    onValueChange={setProductoSeleccionado}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Seleccionar producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {productos.map((producto) => (
                        <SelectItem key={producto.id} value={producto.id}>
                          {producto.nombre} - {formatCurrency(producto.precio)}
                          {producto.stock !== undefined && ` (Stock: ${producto.stock})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-32">
                  <Label htmlFor="cantidad">Cantidad</Label>
                  <Input
                    id="cantidad"
                    type="number"
                    min="1"
                    value={cantidad}
                    onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
                    className="mt-1"
                  />
                </div>

                <div className="flex items-end">
                  <Button onClick={agregarItem} disabled={!productoSeleccionado}>
                    <Plus className="w-4 h-4 mr-2" /> Agregar
                  </Button>
                </div>
              </div>

              {productos.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No hay productos disponibles. Crea productos primero.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Lista de items */}
          <Card>
            <CardHeader>
              <CardTitle>Items de la Factura</CardTitle>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No hay productos agregados. Agrega productos para continuar.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-right">Cant.</TableHead>
                      <TableHead className="text-right">Precio</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                      <TableHead className="text-right">IVA</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {item.nombreProducto}
                          <div className="text-xs text-muted-foreground">
                            IVA: {item.tasaIva}%
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{item.cantidad}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.precioUnitario)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(calcularSubtotal(item))}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(calcularIva(item))}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(calcularTotalItem(item))}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => eliminarItem(index)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Columna derecha: Resumen */}
        <div className="space-y-6">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Resumen de la Factura</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Items:</span>
                  <span className="font-medium">{items.length}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">
                    {formatCurrency(subtotalGeneral)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">IVA:</span>
                  <span className="font-medium">{formatCurrency(ivaGeneral)}</span>
                </div>

                <div className="pt-3 border-t">
                  <div className="flex justify-between text-lg">
                    <span className="font-bold">TOTAL:</span>
                    <span className="font-bold text-blue-600">
                      {formatCurrency(totalGeneral)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <Button
                  className="w-full"
                  disabled={items.length === 0 || guardando}
                  onClick={() => crearFactura("emitida")}
                >
                  {guardando ? (
                    <>
                      <Loader /> Creando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" /> Crear y Emitir
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  disabled={items.length === 0 || guardando}
                  onClick={() => crearFactura("borrador")}
                >
                  <FilePlus className="w-4 h-4 mr-2" /> Guardar como Borrador
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center pt-2">
                Las facturas emitidas descontarán automáticamente el stock
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
