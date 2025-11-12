import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const stats = [
  { id: 1, title: "Productos Totales", value: 248, delta: "+12%" },
  { id: 2, title: "Pedidos del Mes", value: 156, delta: "+23%" },
  { id: 3, title: "Ventas del Mes", value: "$12,450", delta: "+18%" },
  { id: 4, title: "Clientes Activos", value: 89, delta: "-5%" },
];

const recentOrders = [
  { id: "ORD-001", customer: "Juan Pérez", total: "$145.99", date: "2025-01-15", status: "Completado" },
  { id: "ORD-002", customer: "María García", total: "$89.50", date: "2025-01-15", status: "Pendiente" },
  { id: "ORD-003", customer: "Carlos López", total: "$234.00", date: "2025-01-14", status: "En proceso" },
  { id: "ORD-004", customer: "Ana Martínez", total: "$67.25", date: "2025-01-14", status: "Completado" },
  { id: "ORD-005", customer: "Luis Rodríguez", total: "$189.99", date: "2025-01-13", status: "Completado" },
];

const lowStock = [
  { id: 1, name: "Kit de Embrague Completo", category: "Transmisión", qty: 5 },
  { id: 2, name: "Neumático Delantero 120/70", category: "Neumáticos", qty: 6 },
  { id: 3, name: "Pastillas de Freno Delanteras", category: "Frenos", qty: 8 },
  { id: 4, name: "Batería 12V 10Ah", category: "Eléctrico", qty: 10 },
];

export default function AdminIndex() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
        <p className="text-sm text-gray-600 mt-1">Resumen general de tu tienda</p>
      </header>

      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <Card key={s.id} className="p-4">
              <CardContent>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm text-gray-500">{s.title}</div>
                    <div className="text-2xl font-semibold mt-2">{s.value}</div>
                    <div className="text-xs text-green-500 mt-1">{s.delta} vs mes anterior</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pedidos Recientes</CardTitle>
            <CardDescription>Últimos pedidos recibidos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {recentOrders.map((o) => (
                <div key={o.id} className="py-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{o.id}</div>
                    <div className="text-sm text-gray-500">{o.customer}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{o.total}</div>
                    <div className="text-sm text-gray-500">{o.date}</div>
                  </div>
                  <div className="ml-4">
                    <Badge variant="outline">{o.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Productos con Bajo Stock</CardTitle>
            <CardDescription>Artículos que necesitan reposición</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {lowStock.map((p) => (
                <div key={p.id} className="py-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-sm text-gray-500">{p.category}</div>
                  </div>
                  <div>
                    <div className="text-sm text-red-600 font-medium">{p.qty} unidades</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
