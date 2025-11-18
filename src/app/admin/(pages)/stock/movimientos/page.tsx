import { listarMovimientosService } from "@/lib/server/movimientosServer";
import { listarProductosService } from "@/lib/server/productosServer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowDown, ArrowUp, RefreshCw, ShoppingCart, Package, AlertCircle, TrendingUp } from "lucide-react";
import Link from "next/link";

type Movimiento = {
  id: string;
  tipo: string;
  productoId: string;
  cantidad: number;
  creadoEn?: string; // Campo del backend
  fecha?: string; // Alias para compatibilidad
  referencia?: string;
  observaciones?: string;
  realizadoPor?: string; // Campo del backend
  usuarioId?: string; // Alias para compatibilidad
};

type Producto = {
  id: string;
  nombre: string;
};

/**
 * Obtiene los datos de movimientos y productos
 */
async function getMovimientosData() {
  try {
    const [movimientos, productosResult] = await Promise.all([
      listarMovimientosService(),
      listarProductosService({}, undefined),
    ]);

    // Extraer array de productos según la respuesta
    let productos: Producto[] = [];
    if (Array.isArray(productosResult)) {
      productos = productosResult;
    } else if (productosResult && typeof productosResult === 'object') {
      const result = productosResult as any;
      if (result.body) {
        if (Array.isArray(result.body)) {
          productos = result.body;
        } else if (result.body.content) {
          productos = result.body.content;
        } else if (result.body.productos) {
          productos = result.body.productos;
        }
      }
    }

    return { movimientos, productos };
  } catch (error) {
    console.error("Error cargando datos:", error);
    return { movimientos: [], productos: [] };
  }
}

/**
 * Enriquece movimientos con información del producto
 */
function enrichMovimientos(movimientos: Movimiento[], productos: Producto[]) {
  return movimientos.map((mov) => {
    const producto = productos.find((p) => p.id === mov.productoId);
    return {
      ...mov,
      productoNombre: producto?.nombre || "Producto desconocido",
    };
  });
}

/**
 * Obtiene el ícono según el tipo de movimiento
 */
function getMovimientoIcon(tipo: string) {
  switch (tipo.toUpperCase()) {
    case "ENTRADA":
    case "INGRESO":
      return <ArrowUp className="w-4 h-4" />;
    case "SALIDA":
    case "EGRESO":
      return <ArrowDown className="w-4 h-4" />;
    case "VENTA":
      return <ShoppingCart className="w-4 h-4" />;
    case "DEVOLUCION":
      return <RefreshCw className="w-4 h-4" />;
    case "AJUSTE":
      return <Package className="w-4 h-4" />;
    default:
      return <AlertCircle className="w-4 h-4" />;
  }
}

/**
 * Obtiene el badge según el tipo de movimiento
 */
function getTipoBadge(tipo: string) {
  const tipoUpper = tipo.toUpperCase();
  
  const colorMap: Record<string, string> = {
    ENTRADA: "bg-green-100 text-green-800 border-green-300",
    INGRESO: "bg-green-100 text-green-800 border-green-300",
    SALIDA: "bg-red-100 text-red-800 border-red-300",
    EGRESO: "bg-red-100 text-red-800 border-red-300",
    VENTA: "bg-blue-100 text-blue-800 border-blue-300",
    DEVOLUCION: "bg-yellow-100 text-yellow-800 border-yellow-300",
    AJUSTE: "bg-purple-100 text-purple-800 border-purple-300",
  };

  const className = colorMap[tipoUpper] || "bg-gray-100 text-gray-800 border-gray-300";

  return (
    <Badge variant="outline" className={className}>
      <span className="mr-1">{getMovimientoIcon(tipo)}</span>
      {tipo}
    </Badge>
  );
}

export default async function MovimientosStockPage() {
  const { movimientos, productos } = await getMovimientosData();

  // Enriquecer movimientos con nombre del producto
  const movimientosEnriquecidos = enrichMovimientos(movimientos, productos);

  // Ordenar por fecha (más recientes primero)
  const movimientosOrdenados = [...movimientosEnriquecidos].sort((a, b) => {
    const fechaA = a.creadoEn || a.fecha ? new Date(a.creadoEn || a.fecha || "").getTime() : 0;
    const fechaB = b.creadoEn || b.fecha ? new Date(b.creadoEn || b.fecha || "").getTime() : 0;
    return fechaB - fechaA;
  });

  // Calcular estadísticas
  const totalMovimientos = movimientos.length;
  const ingresos = movimientos.filter((m) => 
    ["INGRESO", "ENTRADA"].includes(m.tipo.toUpperCase())
  ).length;
  const egresos = movimientos.filter((m) => 
    ["EGRESO", "SALIDA"].includes(m.tipo.toUpperCase())
  ).length;
  const ventas = movimientos.filter((m) => m.tipo.toUpperCase() === "VENTA").length;
  const ajustes = movimientos.filter((m) => m.tipo.toUpperCase() === "AJUSTE").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Movimientos de Stock</h1>
        <p className="text-sm text-muted-foreground">
          Historial completo de entradas, salidas y ajustes de inventario
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Movimientos</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMovimientos}</div>
            <p className="text-xs text-muted-foreground">Todos los tipos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
            <ArrowUp className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{ingresos}</div>
            <p className="text-xs text-muted-foreground">Entradas de stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Egresos</CardTitle>
            <ArrowDown className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{egresos}</div>
            <p className="text-xs text-muted-foreground">Salidas de stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas</CardTitle>
            <ShoppingCart className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{ventas}</div>
            <p className="text-xs text-muted-foreground">Por facturación</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ajustes</CardTitle>
            <Package className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{ajustes}</div>
            <p className="text-xs text-muted-foreground">Correcciones</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de movimientos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Historial de Movimientos</CardTitle>
              <CardDescription>
                Registro detallado de todas las operaciones de stock
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Link href="/admin/stock/ajustar">
                <Button variant="outline" size="sm">
                  Ajustar Stock
                </Button>
              </Link>
              <Link href="/admin/stock">
                <Button variant="outline" size="sm">
                  Volver a Stock
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {movimientosOrdenados.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No hay movimientos registrados aún</p>
              <p className="text-xs mt-2">
                Los movimientos se generan automáticamente al realizar ventas,
                ajustes de stock o ingresos de mercancía
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead>Referencia</TableHead>
                    <TableHead>Observaciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movimientosOrdenados.map((movimiento) => (
                    <TableRow key={movimiento.id}>
                      <TableCell className="font-medium">
                        {movimiento.creadoEn || movimiento.fecha
                          ? new Date(movimiento.creadoEn || movimiento.fecha || "").toLocaleString("es-CO", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Sin fecha"}
                      </TableCell>
                      <TableCell>{getTipoBadge(movimiento.tipo)}</TableCell>
                      <TableCell>{movimiento.productoNombre}</TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`font-semibold ${
                            ["ENTRADA", "INGRESO", "DEVOLUCION"].includes(movimiento.tipo.toUpperCase())
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {["ENTRADA", "INGRESO", "DEVOLUCION"].includes(movimiento.tipo.toUpperCase())
                            ? "+"
                            : ""}
                          {Math.abs(movimiento.cantidad)}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {movimiento.referencia || "-"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                        {movimiento.observaciones || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
