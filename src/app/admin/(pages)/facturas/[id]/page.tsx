"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Download,
  FileCheck,
  XCircle,
  AlertCircle,
  Check,
} from "lucide-react";
import Link from "next/link";
import Loader from "@/components/ui/loading";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type Factura, type FacturaItemResponse } from "@/lib/server/facturasServer";

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
    <Badge className={`${color} border font-medium text-base px-3 py-1`} variant="outline">
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
  try {
    return new Date(date).toLocaleString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "N/A";
  }
}

export default function FacturaDetallePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [factura, setFactura] = useState<Factura | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [dialogAnular, setDialogAnular] = useState(false);
  const [dialogEmitir, setDialogEmitir] = useState(false);

  // Cargar factura
  useEffect(() => {
    const cargarFactura = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/facturas/${id}`);

        if (!response.ok) {
          throw new Error("Error al cargar la factura");
        }

        const data = await response.json();
        const facturaData = data.factura || data;

        setFactura(facturaData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      cargarFactura();
    }
  }, [id]);

  // Emitir borrador
  const handleEmitir = async () => {
    if (!factura) return;

    setProcesando(true);
    try {
      const response = await fetch(`/api/facturas/${factura.id}/emitir`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Error al emitir la factura");
      }

      const data = await response.json();
      const facturaData = data.factura || data;
      setFactura(facturaData);
      setDialogEmitir(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setProcesando(false);
    }
  };

  // Anular factura
  const handleAnular = async () => {
    if (!factura) return;

    setProcesando(true);
    try {
      const response = await fetch(`/api/facturas/${factura.id}/anular`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Error al anular la factura");
      }

      const data = await response.json();
      const facturaData = data.factura || data;
      setFactura(facturaData);
      setDialogAnular(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setProcesando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  if (error || !factura) {
    return (
      <div className="space-y-4">
        <Link href="/admin/facturas">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" /> Volver
          </Button>
        </Link>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800">Error al cargar factura</p>
            <p className="text-sm text-red-700">{error || "Factura no encontrada"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header con acciones */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/facturas">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" /> Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Factura {factura.numeroFactura}</h1>
            <p className="text-sm text-muted-foreground">
              Creada el {formatDate(factura.creadoEn || factura.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {factura.estado === "EMITIDA" && (
            <>
              <a href={`/api/facturas/${factura.id}/pdf`} download>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" /> PDF
                </Button>
              </a>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDialogAnular(true)}
              >
                <XCircle className="w-4 h-4 mr-2" /> Anular
              </Button>
            </>
          )}

          {factura.estado === "BORRADOR" && (
            <Button
              variant="default"
              size="sm"
              onClick={() => setDialogEmitir(true)}
            >
              <FileCheck className="w-4 h-4 mr-2" /> Emitir Factura
            </Button>
          )}
        </div>
      </div>

      {/* Información general */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información de la Factura</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Número:</span>
              <span className="font-semibold">{factura.numeroFactura}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Estado:</span>
              <EstadoBadge estado={factura.estado} />
            </div>
            {factura.fechaEmision && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Fecha de emisión:</span>
                <span className="font-medium">{formatDate(factura.fechaEmision)}</span>
              </div>
            )}
            {factura.fechaAnulacion && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Fecha de anulación:</span>
                <span className="font-medium text-red-600">
                  {formatDate(factura.fechaAnulacion)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información del Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm text-muted-foreground">Nombre completo:</span>
              <p className="font-semibold">
                {factura.cliente ? `${factura.cliente.nombre} ${factura.cliente.apellido}` : "Cliente General"}
              </p>
            </div>
            {factura.cliente?.username && (
              <div>
                <span className="text-sm text-muted-foreground">Usuario:</span>
                <p className="font-medium">{factura.cliente.username}</p>
              </div>
            )}
            {factura.cliente?.email && (
              <div>
                <span className="text-sm text-muted-foreground">Email:</span>
                <p className="font-medium">{factura.cliente.email}</p>
              </div>
            )}
            {factura.cliente?.fechaCreacion && (
              <div>
                <span className="text-sm text-muted-foreground">Cliente desde:</span>
                <p className="font-medium">
                  {new Date(factura.cliente.fechaCreacion).toLocaleDateString("es-CO", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Items de la factura */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle de Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="text-right">Precio Unit.</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
                <TableHead className="text-right">IVA</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {factura.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {item.nombreProducto || `Producto ${item.productoId}`}
                  </TableCell>
                  <TableCell className="text-right">{item.cantidad}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.precioUnitario)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.subtotal || 0)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.iva || 0)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(item.totalItem || 0)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3} className="text-right font-medium">
                  Subtotal
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {formatCurrency(factura.subtotal)}
                </TableCell>
                <TableCell colSpan={2}></TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={3} className="text-right font-medium">
                  IVA Total
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {formatCurrency(factura.totalIva)}
                </TableCell>
                <TableCell colSpan={2}></TableCell>
              </TableRow>
              <TableRow className="bg-gray-50">
                <TableCell colSpan={3} className="text-right font-bold text-lg">
                  TOTAL
                </TableCell>
                <TableCell className="text-right font-bold text-lg text-blue-600">
                  {formatCurrency(factura.total)}
                </TableCell>
                <TableCell colSpan={2}></TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog para emitir */}
      <Dialog open={dialogEmitir} onOpenChange={setDialogEmitir}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Emitir Factura</DialogTitle>
            <DialogDescription>
              ¿Está seguro de que desea emitir esta factura? Esta acción descuenta el
              stock de los productos y cambia el estado a EMITIDA.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogEmitir(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEmitir} disabled={procesando}>
              {procesando ? "Procesando..." : "Emitir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para anular */}
      <Dialog open={dialogAnular} onOpenChange={setDialogAnular}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Anular Factura</DialogTitle>
            <DialogDescription>
              ¿Está seguro de que desea anular esta factura? Esta acción NO devuelve
              automáticamente el stock. Deberá ajustarlo manualmente si es necesario.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAnular(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleAnular} disabled={procesando}>
              {procesando ? "Procesando..." : "Anular"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
