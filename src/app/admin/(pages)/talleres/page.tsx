"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, Warehouse, Building2 } from "lucide-react";
import { toast } from "sonner";
import Loader from "@/components/ui/loading";
import DeleteButton from "@/components/ui/delete";
import EditButton from "@/components/ui/edit";

interface Taller {
  id: number;
  nombre: string;
  descripcion: string;
  almacenes?: Almacen[];
}

interface Almacen {
  id: number;
  nombre: string;
  direccion: string;
  tallerId: number;
}

export default function TalleresPage() {
  const router = useRouter();
  const [talleres, setTalleres] = useState<Taller[]>([]);
  const [almacenes, setAlmacenes] = useState<Almacen[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para diálogos de Taller
  const [tallerDialogOpen, setTallerDialogOpen] = useState(false);
  const [editingTaller, setEditingTaller] = useState<Taller | null>(null);
  const [tallerForm, setTallerForm] = useState({ nombre: "", descripcion: "" });

  // Estados para diálogos de Almacén
  const [almacenDialogOpen, setAlmacenDialogOpen] = useState(false);
  const [editingAlmacen, setEditingAlmacen] = useState<Almacen | null>(null);
  const [almacenForm, setAlmacenForm] = useState({
    nombre: "",
    direccion: "",
    tallerId: "",
  });

  // Estados para confirmar eliminación
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "taller" | "almacen";
    id: number;
    tallerId?: number;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [talleresRes, almacenesRes] = await Promise.all([
        fetch("/api/talleres"),
        getAllAlmacenes(),
      ]);

      if (talleresRes.ok) {
        const talleresData = await talleresRes.json();
        // Asegurar que siempre sea un array
        setTalleres(Array.isArray(talleresData) ? talleresData : []);
      } else {
        setTalleres([]);
      }

      setAlmacenes(almacenesRes);
    } catch (error) {
      console.error("Error cargando datos:", error);
      toast.error("Error al cargar los datos");
      setTalleres([]);
      setAlmacenes([]);
    } finally {
      setLoading(false);
    }
  };

  const getAllAlmacenes = async (): Promise<Almacen[]> => {
    try {
      const talleresRes = await fetch("/api/talleres");
      if (!talleresRes.ok) return [];

      const talleresData: Taller[] = await talleresRes.json();
      const allAlmacenes: Almacen[] = [];

      for (const taller of talleresData) {
        const almacenesRes = await fetch(
          `/api/talleres/${taller.id}/almacenes`
        );
        if (almacenesRes.ok) {
          const almacenesData = await almacenesRes.json();
          allAlmacenes.push(...almacenesData);
        }
      }

      return allAlmacenes;
    } catch {
      return [];
    }
  };

  // ============= TALLER HANDLERS =============
  const openTallerDialog = (taller?: Taller) => {
    if (taller) {
      setEditingTaller(taller);
      setTallerForm({
        nombre: taller.nombre,
        descripcion: taller.descripcion,
      });
    } else {
      setEditingTaller(null);
      setTallerForm({ nombre: "", descripcion: "" });
    }
    setTallerDialogOpen(true);
  };

  const handleSaveTaller = async () => {
    if (!tallerForm.nombre.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }

    try {
      const url = editingTaller
        ? `/api/talleres/${editingTaller.id}`
        : "/api/talleres";
      const method = editingTaller ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tallerForm),
      });

      if (response.ok) {
        toast.success(
          editingTaller
            ? "Taller actualizado correctamente"
            : "Taller creado correctamente"
        );
        setTallerDialogOpen(false);
        loadData();
      } else {
        const error = await response.json();
        // Manejar el error de límite de talleres
        if (error.errors && typeof error.errors === "string") {
          toast.error(error.errors);
        } else if (error.message) {
          toast.error(error.message);
        } else {
          toast.error("Error al guardar el taller");
        }
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      toast.error("Error de conexión");
    }
  };

  const handleDeleteTaller = async () => {
    if (!deleteTarget || deleteTarget.type !== "taller") return;

    try {
      const response = await fetch(`/api/talleres/${deleteTarget.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Taller eliminado correctamente");
        setDeleteDialogOpen(false);
        setDeleteTarget(null);
        loadData();
      } else {
        const error = await response.json();
        toast.error(error.message || "Error al eliminar el taller");
      }
    } catch {
      toast.error("Error de conexión");
    }
  };

  // ============= ALMACÉN HANDLERS =============
  const openAlmacenDialog = (almacen?: Almacen) => {
    if (almacen) {
      setEditingAlmacen(almacen);
      setAlmacenForm({
        nombre: almacen.nombre,
        direccion: almacen.direccion,
        tallerId: almacen.tallerId.toString(),
      });
    } else {
      setEditingAlmacen(null);
      setAlmacenForm({ nombre: "", direccion: "", tallerId: "" });
    }
    setAlmacenDialogOpen(true);
  };

  const handleSaveAlmacen = async () => {
    if (!almacenForm.nombre.trim() || !almacenForm.tallerId) {
      toast.error("El nombre y el taller son obligatorios");
      return;
    }

    try {
      const url = editingAlmacen
        ? `/api/talleres/${almacenForm.tallerId}/almacenes/${editingAlmacen.id}`
        : `/api/talleres/${almacenForm.tallerId}/almacenes`;
      const method = editingAlmacen ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: almacenForm.nombre,
          direccion: almacenForm.direccion,
        }),
      });

      if (response.ok) {
        toast.success(
          editingAlmacen
            ? "Almacén actualizado correctamente"
            : "Almacén creado correctamente"
        );
        setAlmacenDialogOpen(false);
        loadData();
      } else {
        const error = await response.json();
        // Manejar el error de límite de almacenes
        if (error.errors && typeof error.errors === "string") {
          toast.error(error.errors);
        } else if (error.message) {
          toast.error(error.message);
        } else {
          toast.error("Error al guardar el almacén");
        }
      }
    } catch {
      toast.error("Error de conexión");
    }
  };

  const handleDeleteAlmacen = async () => {
    if (!deleteTarget || deleteTarget.type !== "almacen") return;

    try {
      const response = await fetch(
        `/api/talleres/${deleteTarget.tallerId}/almacenes/${deleteTarget.id}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        toast.success("Almacén eliminado correctamente");
        setDeleteDialogOpen(false);
        setDeleteTarget(null);
        loadData();
      } else {
        const error = await response.json();
        toast.error(error.message || "Error al eliminar el almacén");
      }
    } catch {
      toast.error("Error de conexión");
    }
  };

  const openDeleteDialog = (
    type: "taller" | "almacen",
    id: number,
    tallerId?: number
  ) => {
    setDeleteTarget({ type, id, tallerId });
    setDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestión de Talleres y Almacenes</h1>
      </div>

      <Tabs defaultValue="talleres" className="space-y-4">
        <TabsList>
          <TabsTrigger value="talleres" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Talleres
          </TabsTrigger>
          <TabsTrigger value="almacenes" className="flex items-center gap-2">
            <Warehouse className="h-4 w-4" />
            Almacenes
          </TabsTrigger>
        </TabsList>

        {/* ============= TAB TALLERES ============= */}
        <TabsContent value="talleres" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => openTallerDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Taller
            </Button>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {talleres.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No hay talleres registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  talleres.map((taller) => (
                    <TableRow key={taller.id}>
                      <TableCell>{taller.id}</TableCell>
                      <TableCell className="font-medium">{taller.nombre}</TableCell>
                      <TableCell>{taller.descripcion || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <div onClick={() => openTallerDialog(taller)}>
                            <EditButton />
                          </div>
                          <div onClick={() => openDeleteDialog("taller", taller.id)}>
                            <DeleteButton />
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ============= TAB ALMACENES ============= */}
        <TabsContent value="almacenes" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => openAlmacenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Almacén
            </Button>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Dirección</TableHead>
                  <TableHead>Taller</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {almacenes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No hay almacenes registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  almacenes.map((almacen) => (
                    <TableRow key={almacen.id}>
                      <TableCell>{almacen.id}</TableCell>
                      <TableCell className="font-medium">{almacen.nombre}</TableCell>
                      <TableCell>{almacen.direccion || "-"}</TableCell>
                      <TableCell>
                        {talleres.find((t) => t.id === almacen.tallerId)?.nombre || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <div onClick={() => openAlmacenDialog(almacen)}>
                            <EditButton />
                          </div>
                          <div onClick={() =>
                            openDeleteDialog("almacen", almacen.id, almacen.tallerId)
                          }>
                            <DeleteButton />
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* ============= DIÁLOGO TALLER ============= */}
      <Dialog open={tallerDialogOpen} onOpenChange={setTallerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTaller ? "Editar Taller" : "Nuevo Taller"}
            </DialogTitle>
            <DialogDescription>
              {editingTaller
                ? "Modifica los datos del taller"
                : "Completa los datos del nuevo taller"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="taller-nombre">Nombre *</Label>
              <Input
                id="taller-nombre"
                value={tallerForm.nombre}
                onChange={(e) =>
                  setTallerForm({ ...tallerForm, nombre: e.target.value })
                }
                placeholder="Ej: Taller Principal"
              />
            </div>
            <div>
              <Label htmlFor="taller-descripcion">Descripción</Label>
              <Input
                id="taller-descripcion"
                value={tallerForm.descripcion}
                onChange={(e) =>
                  setTallerForm({ ...tallerForm, descripcion: e.target.value })
                }
                placeholder="Ej: Taller de producción y ensamblaje"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTallerDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveTaller}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============= DIÁLOGO ALMACÉN ============= */}
      <Dialog open={almacenDialogOpen} onOpenChange={setAlmacenDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAlmacen ? "Editar Almacén" : "Nuevo Almacén"}
            </DialogTitle>
            <DialogDescription>
              {editingAlmacen
                ? "Modifica los datos del almacén"
                : "Completa los datos del nuevo almacén"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="almacen-taller">Taller *</Label>
              <Select
                value={almacenForm.tallerId}
                onValueChange={(value) =>
                  setAlmacenForm({ ...almacenForm, tallerId: value })
                }
                disabled={!!editingAlmacen}
              >
                <SelectTrigger id="almacen-taller">
                  <SelectValue placeholder="Selecciona un taller" />
                </SelectTrigger>
                <SelectContent>
                  {talleres.map((taller) => (
                    <SelectItem key={taller.id} value={taller.id.toString()}>
                      {taller.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="almacen-nombre">Nombre *</Label>
              <Input
                id="almacen-nombre"
                value={almacenForm.nombre}
                onChange={(e) =>
                  setAlmacenForm({ ...almacenForm, nombre: e.target.value })
                }
                placeholder="Ej: Almacén Central"
              />
            </div>
            <div>
              <Label htmlFor="almacen-direccion">Dirección</Label>
              <Input
                id="almacen-direccion"
                value={almacenForm.direccion}
                onChange={(e) =>
                  setAlmacenForm({ ...almacenForm, direccion: e.target.value })
                }
                placeholder="Ej: Calle Principal 123"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAlmacenDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveAlmacen}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============= DIÁLOGO ELIMINAR ============= */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este{" "}
              {deleteTarget?.type === "taller" ? "taller" : "almacén"}? Esta
              acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={
                deleteTarget?.type === "taller"
                  ? handleDeleteTaller
                  : handleDeleteAlmacen
              }
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
