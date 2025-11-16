import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Plus, Eye, Edit, Trash2, Search } from "lucide-react";
import Link from "next/link";

const sample = [
  { id: 1, title: "Filtro de Aceite Premium", sku: "FLT-001-PRE", category: "Filtros", price: "$24.99", stock: 15, estado: "Activo" },
  { id: 2, title: "Pastillas de Freno Delanteras", sku: "FRN-002-DEL", category: "Frenos", price: "$45.99", stock: 8, estado: "Activo" },
  { id: 3, title: "Cadena de Transmisión 520", sku: "TRN-003-520", category: "Transmisión", price: "$89.99", stock: 12, estado: "Activo" },
  { id: 4, title: "Kit de Embrague Completo", sku: "TRN-004-KIT", category: "Transmisión", price: "$159.99", stock: 5, estado: "Bajo Stock" },
  { id: 5, title: "Bujías NGK Iridium", sku: "MTR-005-NGK", category: "Motor", price: "$18.99", stock: 25, estado: "Activo" },
];

export default function ProductosPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Productos</h1>
          <p className="text-sm text-gray-600 mt-1">Administra tu inventario de productos</p>
        </div>

        <div>
          <Link href="/admin/productos/nuevo">
            <Button variant="default" className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> Nuevo Producto
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex gap-4 items-center mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input className="pl-10" placeholder="Buscar productos..." />
            </div>
          </div>

          <div>
            <select className="rounded-md border px-3 py-2">
              <option>Todas las categorías</option>
            </select>
          </div>

          <div>
            <select className="rounded-md border px-3 py-2">
              <option>Todos los estados</option>
            </select>
          </div>
        </div>

        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sample.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.title}</TableCell>
                  <TableCell className="text-sm text-gray-600">{p.sku}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{p.category}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{p.price}</TableCell>
                  <TableCell className={p.stock <= 5 ? "text-red-500 font-medium" : "text-gray-700"}>{p.stock}</TableCell>
                  <TableCell>
                    {p.estado === "Activo" ? (
                      <Badge className="bg-green-500 text-white" asChild>
                        <span>Activo</span>
                      </Badge>
                    ) : (
                      <Badge className="bg-red-500 text-white" asChild>
                        <span>Bajo Stock</span>
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <button className="text-gray-600 hover:text-gray-900"><Eye className="w-4 h-4" /></button>
                      <button className="text-gray-600 hover:text-gray-900"><Edit className="w-4 h-4" /></button>
                      <button className="text-red-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
