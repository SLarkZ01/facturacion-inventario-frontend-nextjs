"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, FileText, Download, Eye } from "lucide-react";
import { SimplePagination } from "@/components/SimplePagination";
import { DeleteBorradorButton } from "./DeleteBorradorButton";
import type { Factura } from "@/lib/server/facturasServer";

type FacturasTableProps = {
  facturas: Factura[];
};

function EstadoBadge({ estado }: { estado: string }) {
  const config = {
    BORRADOR: { color: "bg-gray-100 text-gray-800 border-gray-300", label: "Borrador" },
    EMITIDA: { color: "bg-green-100 text-green-800 border-green-300", label: "Emitida" },
    ANULADA: { color: "bg-red-100 text-red-800 border-red-300", label: "Anulada" },
  };

  const { color, label } = config[estado as keyof typeof config] || config.BORRADOR;

  return (
    <Badge className={`${color} border font-medium`} variant="outline">
      {label}
    </Badge>
  );
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);
}

function formatDate(date: string | undefined): string {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function FacturasTable({ facturas }: FacturasTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Ordenar facturas por fecha (más recientes primero)
  const facturasOrdenadas = useMemo(() => {
    return [...facturas].sort((a, b) => {
      const dateA = new Date(a.creadoEn || a.createdAt || "");
      const dateB = new Date(b.creadoEn || b.createdAt || "");
      return dateB.getTime() - dateA.getTime();
    });
  }, [facturas]);

  // Calcular estadísticas
  const totalEmitidas = facturas.filter((f) => f.estado === "EMITIDA").length;
  const totalBorradores = facturas.filter((f) => f.estado === "BORRADOR").length;
  const totalIngresos = facturas
    .filter((f) => f.estado === "EMITIDA")
    .reduce((sum, f) => sum + (f.total || 0), 0);

  // Paginación
  const totalPages = Math.ceil(facturasOrdenadas.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const facturasPaginadas = facturasOrdenadas.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Facturas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Administra las facturas de venta y cotizaciones
          </p>
        </div>

        <Link href="/admin/facturas/nueva">
          <Button variant="default" className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nueva Factura
          </Button>
        </Link>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Facturas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{facturas.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Emitidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalEmitidas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Borradores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{totalBorradores}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ingresos Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(totalIngresos)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de facturas */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de Facturas</CardTitle>
        </CardHeader>
        <CardContent>
          {facturasOrdenadas.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No hay facturas registradas</p>
              <p className="text-sm text-gray-400 mb-4">
                Crea tu primera factura para comenzar
              </p>
              <Link href="/admin/facturas/nueva">
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" /> Nueva Factura
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                      <TableHead className="text-right">IVA</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {facturasPaginadas.map((factura) => (
                      <TableRow key={factura.id}>
                        <TableCell className="font-medium">
                          {factura.numeroFactura}
                        </TableCell>
                        <TableCell>
                          {factura.cliente 
                            ? `${factura.cliente.nombre} ${factura.cliente.apellido}` 
                            : "Cliente General"}
                        </TableCell>
                        <TableCell>{formatDate(factura.emitidaEn || factura.fechaEmision || factura.creadoEn || factura.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(factura.subtotal || 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(factura.totalIva || 0)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(factura.total)}
                        </TableCell>
                        <TableCell>
                          <EstadoBadge estado={factura.estado} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/admin/facturas/${factura.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            {factura.estado === "EMITIDA" && (
                              <a href={`/api/facturas/${factura.id}/pdf`} download>
                                <Button variant="ghost" size="sm">
                                  <Download className="w-4 h-4" />
                                </Button>
                              </a>
                            )}
                            {factura.estado === "BORRADOR" && (
                              <DeleteBorradorButton
                                facturaId={factura.id}
                                numeroFactura={factura.numeroFactura}
                              />
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Paginación */}
              <SimplePagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={facturasOrdenadas.length}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
