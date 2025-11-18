import { cookies } from "next/headers";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Package, Plus, TrendingUp, TrendingDown, Warehouse, Settings, History } from "lucide-react";
import { listarProductosService } from "@/lib/server/productosServer";
import { listarMisTalleresService } from "@/lib/server/talleresServer";
import { obtenerStockPorProductoService } from "@/lib/server/stockServer";
import { BACKEND_BASE } from "@/lib/config";

/**
 * Tipo para producto con detalle de stock por almacén
 */
type ProductoConStock = {
  id: string;
  nombre: string;
  stock: number;
  stockByAlmacen?: Array<{
    almacenId: string;
    almacenNombre?: string;
    cantidad: number;
  }>;
  precio?: number;
};

/**
 * Tipo para almacén
 */
type Almacen = {
  id: string;
  nombre: string;
  ubicacion?: string;
};

/**
 * Obtiene productos con su stock desglosado por almacén
 */
async function getStockData() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return { productos: [], almacenes: [] };
  }

  // Obtener talleres del usuario
  const talleresResult = await listarMisTalleresService(accessToken);
  
  if (talleresResult.status !== 200 || !Array.isArray(talleresResult.body) || talleresResult.body.length === 0) {
    return { productos: [], almacenes: [] };
  }

  const primerTaller = talleresResult.body[0];
  const tallerId = primerTaller.id?.toString();

  if (!tallerId) {
    return { productos: [], almacenes: [] };
  }

  // Obtener almacenes del taller usando el endpoint específico
  let almacenes: Almacen[] = [];
  try {
    const almacenesRes = await fetch(`${BACKEND_BASE}/api/talleres/${tallerId}/almacenes`, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });
    
    if (almacenesRes.ok) {
      const almacenesData = await almacenesRes.json();
      almacenes = Array.isArray(almacenesData) ? almacenesData : [];
    }
  } catch (error) {
    console.error("Error obteniendo almacenes:", error);
  }

  // Obtener productos del taller
  const productosResult = await listarProductosService({ tallerId }, accessToken);
  
  let productos: any[] = [];
  if (productosResult.status === 200) {
    if (Array.isArray(productosResult.body)) {
      productos = productosResult.body;
    } else if (productosResult.body && typeof productosResult.body === "object") {
      productos = (productosResult.body as any).productos || (productosResult.body as any).content || [];
    }
  }

  // Para cada producto, obtener su stock por almacén
  const productosConStock: ProductoConStock[] = [];

  for (const producto of productos) {
    const stockResult = await obtenerStockPorProductoService(producto.id, accessToken);
    
    let stockByAlmacen: any[] = [];
    
    if (stockResult.status === 200 && stockResult.body) {
      const data = stockResult.body as any;
      stockByAlmacen = data.stockByAlmacen || [];
      
      // Agregar nombres de almacenes
      stockByAlmacen = stockByAlmacen.map((stock: any) => {
        const almacen = almacenes.find((a) => a.id === stock.almacenId);
        return {
          ...stock,
          almacenNombre: almacen?.nombre || "Almacén desconocido",
        };
      });
    }

    productosConStock.push({
      id: producto.id,
      nombre: producto.nombre,
      stock: producto.stock || 0,
      stockByAlmacen,
      precio: producto.precio,
    });
  }

  return { productos: productosConStock, almacenes, tallerId };
}

export default async function StockPage() {
  const { productos, almacenes, tallerId } = await getStockData();
  // Forzar recompilación - fix key props

  // Estadísticas
  const totalProductos = productos.length;
  const productosConStock = productos.filter((p) => p.stock > 0).length;
  const productosSinStock = productos.filter((p) => p.stock === 0).length;
  const valorInventario = productos.reduce((sum, p) => sum + (p.stock * (p.precio || 0)), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Stock</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Control de inventario por almacén
          </p>
        </div>

        <div className="flex gap-2">
          <Link href="/admin/stock/movimientos">
            <Button variant="outline" className="flex items-center gap-2">
              <History className="w-4 h-4" /> Movimientos
            </Button>
          </Link>
          <Link href="/admin/stock/ajustar">
            <Button variant="default" className="flex items-center gap-2">
              <Settings className="w-4 h-4" /> Ajustar Stock
            </Button>
          </Link>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <Package className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProductos}</div>
            <p className="text-xs text-muted-foreground mt-1">
              En inventario
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Con Stock</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{productosConStock}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Productos disponibles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sin Stock</CardTitle>
            <TrendingDown className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{productosSinStock}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Productos agotados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Valor Inventario</CardTitle>
            <Warehouse className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${valorInventario.toLocaleString("es-CO")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Valor total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Stock por Producto */}
      <Card>
        <CardHeader>
          <CardTitle>Stock por Producto y Almacén</CardTitle>
          <CardDescription>
            Vista detallada del inventario en cada ubicación
          </CardDescription>
        </CardHeader>
        <CardContent>
          {productos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p>No hay productos registrados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-center">Stock Total</TableHead>
                    {almacenes.map((almacen) => (
                      <TableHead key={almacen.id} className="text-center">
                        {almacen.nombre}
                      </TableHead>
                    ))}
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productos.map((producto) => {
                    const tieneAlmacenes = producto.stockByAlmacen && producto.stockByAlmacen.length > 0;
                    
                    return (
                      <TableRow key={producto.id}>
                        <TableCell className="font-medium">
                          {producto.nombre}
                          {!tieneAlmacenes && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              Modo Simple
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant={producto.stock > 0 ? "default" : "destructive"}
                            className="font-mono"
                          >
                            {producto.stock}
                          </Badge>
                        </TableCell>
                        {almacenes.map((almacen) => {
                          const stockEnAlmacen = producto.stockByAlmacen?.find(
                            (s) => s.almacenId === almacen.id
                          );
                          
                          return (
                            <TableCell key={almacen.id} className="text-center">
                              {stockEnAlmacen ? (
                                <span className="font-mono text-sm">
                                  {stockEnAlmacen.cantidad}
                                </span>
                              ) : (
                                <span className="text-muted-foreground text-sm">-</span>
                              )}
                            </TableCell>
                          );
                        })}
                        <TableCell className="text-right font-medium">
                          {producto.precio
                            ? `$${(producto.stock * producto.precio).toLocaleString("es-CO")}`
                            : "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Información de Almacenes */}
      {almacenes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Almacenes Configurados</CardTitle>
            <CardDescription>
              Ubicaciones de almacenamiento disponibles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {almacenes.map((almacen) => (
                <div
                  key={almacen.id}
                  className="border rounded-lg p-4 flex items-start gap-3"
                >
                  <Warehouse className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-medium">{almacen.nombre}</h3>
                    {almacen.ubicacion && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {almacen.ubicacion}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mensaje si no hay almacenes */}
      {almacenes.length === 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Warehouse className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-900">
                  No hay almacenes configurados
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Los productos están usando <strong>modo simple</strong> (stock directo en producto).
                  Para gestionar stock por ubicación, primero crea almacenes en el módulo de Talleres.
                </p>
                <Link href="/admin/talleres">
                  <Button variant="outline" size="sm" className="mt-3">
                    Ir a Talleres
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
