"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Loader from "@/components/ui/loading";

/**
 * Tipo de configuración basado en el backend
 */
type Configuracion = {
  id?: string;
  tasaIvaPorDefecto?: number;
  nombreEmpresa?: string;
  nit?: string;
  digitoVerificacion?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  ciudad?: string;
  departamento?: string;
  prefijoFactura?: string;
  resolucionDian?: string;
  fechaResolucionDian?: string;
  rangoFacturaInicio?: number;
  rangoFacturaFin?: number;
  proximoNumeroFactura?: number;
  actualizadoEn?: string;
};

export default function ConfiguracionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  // Estado del formulario
  const [config, setConfig] = useState<Configuracion>({
    tasaIvaPorDefecto: 19,
    nombreEmpresa: "",
    nit: "",
    digitoVerificacion: "",
    direccion: "",
    telefono: "",
    email: "",
    ciudad: "",
    departamento: "",
    prefijoFactura: "",
    resolucionDian: "",
    fechaResolucionDian: "",
    rangoFacturaInicio: undefined,
    rangoFacturaFin: undefined,
  });

  // Cargar configuración actual
  useEffect(() => {
    const cargarConfiguracion = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/configuracion");

        if (!response.ok) {
          throw new Error("Error al cargar la configuración");
        }

        const data = await response.json();
        
        // El backend puede envolver la respuesta, extraer datos correctamente
        const configData = data.configuracion || data;
        
        // Convertir fecha si existe
        if (configData.fechaResolucionDian) {
          const fecha = new Date(configData.fechaResolucionDian);
          configData.fechaResolucionDian = fecha.toISOString().split("T")[0];
        }

        setConfig({
          tasaIvaPorDefecto: configData.tasaIvaPorDefecto ?? 19,
          nombreEmpresa: configData.nombreEmpresa ?? "",
          nit: configData.nit ?? "",
          digitoVerificacion: configData.digitoVerificacion ?? "",
          direccion: configData.direccion ?? "",
          telefono: configData.telefono ?? "",
          email: configData.email ?? "",
          ciudad: configData.ciudad ?? "",
          departamento: configData.departamento ?? "",
          prefijoFactura: configData.prefijoFactura ?? "",
          resolucionDian: configData.resolucionDian ?? "",
          fechaResolucionDian: configData.fechaResolucionDian ?? "",
          rangoFacturaInicio: configData.rangoFacturaInicio,
          rangoFacturaFin: configData.rangoFacturaFin,
          proximoNumeroFactura: configData.proximoNumeroFactura,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    cargarConfiguracion();
  }, []);

  // Manejar cambios en inputs
  const handleChange = (field: keyof Configuracion, value: string | number) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
    setExito(false);
  };

  // Manejar cambios en inputs numéricos
  const handleNumberChange = (field: keyof Configuracion, value: string) => {
    // Si el valor está vacío, guardar undefined
    if (value === "" || value === null) {
      setConfig((prev) => ({ ...prev, [field]: undefined }));
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        setConfig((prev) => ({ ...prev, [field]: numValue }));
      }
    }
    setExito(false);
  };

  // Manejar cambios en inputs enteros
  const handleIntChange = (field: keyof Configuracion, value: string) => {
    // Si el valor está vacío, guardar undefined
    if (value === "" || value === null) {
      setConfig((prev) => ({ ...prev, [field]: undefined }));
    } else {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue)) {
        setConfig((prev) => ({ ...prev, [field]: numValue }));
      }
    }
    setExito(false);
  };

  // Guardar configuración
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    setExito(false);

    try {
      // Preparar datos para enviar (solo campos modificados)
      const payload: Record<string, any> = {};
      
      if (config.tasaIvaPorDefecto !== undefined) {
        payload.tasaIvaPorDefecto = Number(config.tasaIvaPorDefecto);
      }
      if (config.nombreEmpresa) payload.nombreEmpresa = config.nombreEmpresa;
      if (config.nit) payload.nit = config.nit;
      if (config.digitoVerificacion) payload.digitoVerificacion = config.digitoVerificacion;
      if (config.direccion) payload.direccion = config.direccion;
      if (config.telefono) payload.telefono = config.telefono;
      if (config.email) payload.email = config.email;
      if (config.ciudad) payload.ciudad = config.ciudad;
      if (config.departamento) payload.departamento = config.departamento;
      if (config.prefijoFactura) payload.prefijoFactura = config.prefijoFactura;
      if (config.resolucionDian) payload.resolucionDian = config.resolucionDian;
      if (config.fechaResolucionDian) payload.fechaResolucionDian = config.fechaResolucionDian;
      if (config.rangoFacturaInicio !== undefined) {
        payload.rangoFacturaInicio = Number(config.rangoFacturaInicio);
      }
      if (config.rangoFacturaFin !== undefined) {
        payload.rangoFacturaFin = Number(config.rangoFacturaFin);
      }

      const response = await fetch("/api/configuracion", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al guardar la configuración");
      }

      setExito(true);
      
      // Recargar la página después de 1.5 segundos para reflejar cambios
      setTimeout(() => {
        router.refresh();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
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
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Configuración del Sistema</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Administra los parámetros globales del sistema, información de la empresa y facturación electrónica
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800">Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {exito && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">
            ✓ Configuración guardada exitosamente
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sección: Configuración General */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración General</CardTitle>
            <CardDescription>
              Parámetros globales del sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="tasaIvaPorDefecto">
                Tasa de IVA por defecto (%)
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="tasaIvaPorDefecto"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={config.tasaIvaPorDefecto ?? ""}
                onChange={(e) => handleNumberChange("tasaIvaPorDefecto", e.target.value)}
                required
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Esta tasa se aplicará automáticamente a los nuevos productos. No afecta productos existentes.
              </p>
            </div>

            {config.proximoNumeroFactura !== undefined && (
              <div>
                <Label>Próximo número de factura</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg border">
                  <p className="text-sm font-mono font-semibold">
                    {config.prefijoFactura || "FACT"}-{String(config.proximoNumeroFactura).padStart(6, "0")}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Este número se asigna automáticamente al crear una nueva factura
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sección: Información de la Empresa */}
        <Card>
          <CardHeader>
            <CardTitle>Información de la Empresa</CardTitle>
            <CardDescription>
              Datos que aparecerán en las facturas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="nombreEmpresa">Nombre de la empresa</Label>
                <Input
                  id="nombreEmpresa"
                  value={config.nombreEmpresa}
                  onChange={(e) => handleChange("nombreEmpresa", e.target.value)}
                  placeholder="Ej: Mi Empresa S.A.S."
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="nit">NIT</Label>
                <Input
                  id="nit"
                  value={config.nit}
                  onChange={(e) => handleChange("nit", e.target.value)}
                  placeholder="Ej: 900123456"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="digitoVerificacion">Dígito de verificación</Label>
                <Input
                  id="digitoVerificacion"
                  value={config.digitoVerificacion}
                  onChange={(e) => handleChange("digitoVerificacion", e.target.value)}
                  placeholder="Ej: 7"
                  maxLength={1}
                  className="mt-1"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  value={config.direccion}
                  onChange={(e) => handleChange("direccion", e.target.value)}
                  placeholder="Ej: Calle 123 #45-67"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="ciudad">Ciudad</Label>
                <Input
                  id="ciudad"
                  value={config.ciudad}
                  onChange={(e) => handleChange("ciudad", e.target.value)}
                  placeholder="Ej: Bogotá"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="departamento">Departamento</Label>
                <Input
                  id="departamento"
                  value={config.departamento}
                  onChange={(e) => handleChange("departamento", e.target.value)}
                  placeholder="Ej: Cundinamarca"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={config.telefono}
                  onChange={(e) => handleChange("telefono", e.target.value)}
                  placeholder="Ej: +57 300 1234567"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={config.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="Ej: contacto@miempresa.com"
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sección: Configuración DIAN */}
        <Card>
          <CardHeader>
            <CardTitle>Facturación Electrónica (DIAN)</CardTitle>
            <CardDescription>
              Configuración para facturación electrónica autorizada por la DIAN
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="prefijoFactura">Prefijo de factura</Label>
                <Input
                  id="prefijoFactura"
                  value={config.prefijoFactura}
                  onChange={(e) => handleChange("prefijoFactura", e.target.value.toUpperCase())}
                  placeholder="Ej: FACT"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="resolucionDian">Número de resolución DIAN</Label>
                <Input
                  id="resolucionDian"
                  value={config.resolucionDian}
                  onChange={(e) => handleChange("resolucionDian", e.target.value)}
                  placeholder="Ej: 18760000001"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="fechaResolucionDian">Fecha de resolución</Label>
                <Input
                  id="fechaResolucionDian"
                  type="date"
                  value={config.fechaResolucionDian}
                  onChange={(e) => handleChange("fechaResolucionDian", e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="rangoFacturaInicio">Rango desde</Label>
                <Input
                  id="rangoFacturaInicio"
                  type="number"
                  min="1"
                  value={config.rangoFacturaInicio ?? ""}
                  onChange={(e) => handleIntChange("rangoFacturaInicio", e.target.value)}
                  placeholder="Ej: 1"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="rangoFacturaFin">Rango hasta</Label>
                <Input
                  id="rangoFacturaFin"
                  type="number"
                  min="1"
                  value={config.rangoFacturaFin ?? ""}
                  onChange={(e) => handleIntChange("rangoFacturaFin", e.target.value)}
                  placeholder="Ej: 10000"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> Los cambios en la configuración de la DIAN deben corresponder 
                a una resolución válida. Consulta con tu contador antes de modificar estos valores.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex gap-3">
          <Button type="submit" disabled={guardando} className="w-full md:w-auto">
            {guardando ? (
              <>
                <Loader /> Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" /> Guardar Configuración
              </>
            )}
          </Button>
        </div>
      </form>

      {config.actualizadoEn && (
        <div className="text-xs text-muted-foreground pt-4 border-t">
          Última actualización: {new Date(config.actualizadoEn).toLocaleString("es-CO")}
        </div>
      )}
    </div>
  );
}
