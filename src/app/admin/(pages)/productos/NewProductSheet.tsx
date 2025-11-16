"use client";

import { useState, useRef } from "react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { XIcon, Plus } from "lucide-react";

export default function NewProductSheet() {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState({
    title: "",
    sku: "",
    brand: "",
    description: "",
    characteristics: "",
    specifications: "",
    category: "",
    price: "",
    stock: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!values.title.trim()) e.title = "Nombre del producto es requerido";
    if (!values.sku.trim()) e.sku = "SKU es requerido";
    if (!values.price || Number(values.price) <= 0) e.price = "Precio inválido";
    if (!values.stock || Number(values.stock) < 0) e.stock = "Stock inválido";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function onSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!validate()) return;
    // TODO: conectar con gen/apis/ProductosApi.ts para crear el producto
    console.log("Crear producto", values);
    setOpen(false);
  }

  const formRef = useRef<HTMLFormElement | null>(null);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="default" className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nuevo Producto
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-2xl">Nuevo Producto</SheetTitle>
              <SheetDescription className="text-sm text-gray-600">Agrega un nuevo producto a tu inventario</SheetDescription>
            </div>
            <div>
              <Button
                onClick={() => formRef.current?.requestSubmit()}
                className="bg-orange-600 text-white hover:bg-orange-700"
              >
                <Plus className="w-4 h-4 mr-2" /> Crear Producto
              </Button>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main form */}
            <div className="lg:col-span-2 bg-white rounded-2xl border p-8 shadow-md">
              <form ref={formRef} onSubmit={onSubmit} className="space-y-6">
                <div className="mb-1">
                  <h3 className="font-semibold text-lg">Información Básica</h3>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="title">Nombre del Producto *</Label>
                    <Input id="title" className="h-11" value={values.title} onChange={(e) => setValues({ ...values, title: e.target.value })} />
                    {errors.title && <p className="text-sm text-destructive mt-1">{errors.title}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sku">SKU *</Label>
                      <Input id="sku" className="h-11" value={values.sku} onChange={(e) => setValues({ ...values, sku: e.target.value })} />
                      {errors.sku && <p className="text-sm text-destructive mt-1">{errors.sku}</p>}
                    </div>
                    <div>
                      <Label htmlFor="brand">Marca *</Label>
                      <Input id="brand" className="h-11" value={values.brand} onChange={(e) => setValues({ ...values, brand: e.target.value })} />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Descripción</Label>
                    <textarea id="description" className="w-full rounded-md border px-4 py-3 min-h-[120px]" value={values.description} onChange={(e) => setValues({ ...values, description: e.target.value })} />
                  </div>

                  <div>
                    <Label htmlFor="characteristics">Características (una por línea)</Label>
                    <textarea id="characteristics" className="w-full rounded-md border px-4 py-3 min-h-[120px]" value={values.characteristics} onChange={(e) => setValues({ ...values, characteristics: e.target.value })} />
                  </div>

                  <div>
                    <Label htmlFor="specs">Especificaciones (Clave: Valor, una por línea)</Label>
                    <textarea id="specs" className="w-full rounded-md border px-4 py-3 min-h-[120px]" value={values.specifications} onChange={(e) => setValues({ ...values, specifications: e.target.value })} />
                  </div>
                </div>

                <div className="pt-4">
                  <div className="flex justify-end gap-3">
                    <SheetClose asChild>
                      <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                    </SheetClose>
                    <Button type="submit" className="bg-orange-600 text-white hover:bg-orange-700">Crear Producto</Button>
                  </div>
                </div>
              </form>
            </div>

            {/* Right column: categoría y precio/inventario */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border p-6 shadow-sm">
                <h4 className="font-medium mb-3">Categoría</h4>
                <Label htmlFor="category">Categoría *</Label>
                <select id="category" value={values.category} onChange={(e) => setValues({ ...values, category: e.target.value })} className="w-full rounded-md border px-3 py-2">
                  <option value="">Seleccionar categoría</option>
                  <option value="filtros">Filtros</option>
                  <option value="frenos">Frenos</option>
                  <option value="transmision">Transmisión</option>
                </select>
              </div>

              <div className="bg-white rounded-2xl border p-6 shadow-sm">
                <h4 className="font-medium mb-3">Precio e Inventario</h4>
                <div className="mb-4">
                  <Label htmlFor="price">Precio *</Label>
                  <Input id="price" type="number" className="h-11" value={values.price} onChange={(e) => setValues({ ...values, price: e.target.value })} />
                  {errors.price && <p className="text-sm text-destructive mt-1">{errors.price}</p>}
                </div>
                <div>
                  <Label htmlFor="stock">Stock *</Label>
                  <Input id="stock" type="number" className="h-11" value={values.stock} onChange={(e) => setValues({ ...values, stock: e.target.value })} />
                  {errors.stock && <p className="text-sm text-destructive mt-1">{errors.stock}</p>}
                </div>
                {Number(values.stock) === 0 && <div className="mt-4 rounded-md bg-red-50 text-red-700 px-3 py-2 text-sm">Producto agotado</div>}
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
