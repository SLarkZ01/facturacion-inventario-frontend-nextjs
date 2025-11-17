import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Download, Eye } from "lucide-react";
import { listarFacturasService, type Factura } from "@/lib/server/facturasServer";
import { cookies } from "next/headers";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/**
 * Función para obtener todas las facturas
 */
async function getFacturasData() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return { facturas: [] };
  }

  const result = await listarFacturasService({}, accessToken);

  if (result.status === 200) {
    // Extraer datos correctamente (el backend puede envolver la respuesta)
    if (Array.isArray(result.body)) {
      return { facturas: result.body as Factura[] };
    }
    if (result.body && typeof result.body === "object" && "facturas" in result.body) {
      return { facturas: (result.body as any).facturas as Factura[] };
    }
  }

  return { facturas: [] };
}

/**
 * Componente para el badge de estado
 */
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

/**
 * Formatea números a formato de moneda colombiana
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);
}

/**
 * Formatea fechas
 */
function formatDate(date: string | undefined): string {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function FacturasPage() {
  const { facturas } = await getFacturasData();

  // Ordenar facturas por fecha (más recientes primero)
  const facturasOrdenadas = [...facturas].sort((a, b) => {
    const dateA = new Date(a.createdAt || "");
    const dateB = new Date(b.createdAt || "");
    return dateB.getTime() - dateA.getTime();
  });

  // Calcular estadísticas
  const totalEmitidas = facturas.filter((f) => f.estado === "EMITIDA").length;
  const totalBorradores = facturas.filter((f) => f.estado === "BORRADOR").length;
  const totalAnuladas = facturas.filter((f) => f.estado === "ANULADA").length;
  const totalIngresos = facturas
    .filter((f) => f.estado === "EMITIDA")
    .reduce((sum, f) => sum + (f.total || 0), 0);

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  {facturasOrdenadas.map((factura) => (
                    <TableRow key={factura.id}>
                      <TableCell className="font-medium">
                        {factura.numeroFactura}
                      </TableCell>
                      <TableCell>
                        {factura.cliente?.nombre || "Cliente General"}
                      </TableCell>
                      <TableCell>{formatDate(factura.fechaEmision || factura.createdAt)}</TableCell>
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
                        </div>
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
