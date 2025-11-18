"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
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
import { SimplePagination } from "@/components/SimplePagination";

type MovimientoEnriquecido = {
  id: string;
  tipo: string;
  productoId: string;
  cantidad: number;
  creadoEn?: string;
  fecha?: string;
  referencia?: string;
  observaciones?: string;
  realizadoPor?: string;
  usuarioId?: string;
  productoNombre: string;
};

type MovimientosTableProps = {
  movimientos: MovimientoEnriquecido[];
};

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

export function MovimientosTable({ movimientos }: MovimientosTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Ordenar por fecha (más recientes primero)
  const movimientosOrdenados = useMemo(() => {
    return [...movimientos].sort((a, b) => {
      const fechaA = a.creadoEn || a.fecha ? new Date(a.creadoEn || a.fecha || "").getTime() : 0;
      const fechaB = b.creadoEn || b.fecha ? new Date(b.creadoEn || b.fecha || "").getTime() : 0;
      return fechaB - fechaA;
    });
  }, [movimientos]);

  // Estadísticas
  const totalMovimientos = movimientos.length;
  const ingresos = movimientos.filter((m) => 
    ["INGRESO", "ENTRADA"].includes(m.tipo.toUpperCase())
  ).length;
  const egresos = movimientos.filter((m) => 
    ["EGRESO", "SALIDA"].includes(m.tipo.toUpperCase())
  ).length;

  // Paginación
  const totalPages = Math.ceil(movimientosOrdenados.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const movimientosPaginados = movimientosOrdenados.slice(startIndex, endIndex);

  const formatDate = (date: string | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Historial de Movimientos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Registro detallado de todas las operaciones de stock
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/stock">
            <Button variant="outline">Volver a Stock</Button>
          </Link>
          <Link href="/admin/stock/ajustar">
            <Button variant="default">Ajustar Stock</Button>
          </Link>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <TrendingUp className="w-4 h-4 inline mr-1" />
              Total Movimientos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMovimientos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <ArrowUp className="w-4 h-4 inline mr-1" />
              Ingresos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{ingresos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <ArrowDown className="w-4 h-4 inline mr-1" />
              Egresos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{egresos}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de movimientos */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de Movimientos</CardTitle>
          <CardDescription>
            Timeline de cambios con información completa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
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
                {movimientosPaginados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No hay movimientos registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  movimientosPaginados.map((movimiento) => (
                    <TableRow key={movimiento.id}>
                      <TableCell className="font-medium text-sm">
                        {formatDate(movimiento.creadoEn || movimiento.fecha)}
                      </TableCell>
                      <TableCell>
                        {getTipoBadge(movimiento.tipo)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {movimiento.productoNombre}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {movimiento.cantidad}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {movimiento.referencia || "-"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                        {movimiento.observaciones || "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginación */}
          {movimientosOrdenados.length > 0 && (
            <SimplePagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={movimientosOrdenados.length}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[10, 20, 30, 50, 100]}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
