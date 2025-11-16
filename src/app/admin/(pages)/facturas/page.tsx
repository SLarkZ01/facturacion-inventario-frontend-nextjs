"use client"

import { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Eye, Download, Send } from "lucide-react"

type Factura = {
  id: string
  numero: string
  orden?: string
  cliente: string
  email?: string
  fecha: string
  vencimiento: string
  total: string
  estado: "Pagada" | "Pendiente" | "Vencida"
}

const sample: Factura[] = [
  { id: "1", numero: "INV-2025-001", orden: "ORD-001", cliente: "Juan Pérez", email: "juan@example.com", fecha: "2025-01-15", vencimiento: "2025-02-14", total: "$145.99", estado: "Pagada" },
  { id: "2", numero: "INV-2025-002", orden: "ORD-002", cliente: "María García", email: "maria@example.com", fecha: "2025-01-15", vencimiento: "2025-02-14", total: "$89.50", estado: "Pendiente" },
  { id: "3", numero: "INV-2025-003", orden: "ORD-003", cliente: "Carlos López", email: "carlos@example.com", fecha: "2025-01-14", vencimiento: "2025-02-13", total: "$234.00", estado: "Pagada" },
  { id: "4", numero: "INV-2025-004", orden: "ORD-004", cliente: "Ana Martínez", email: "ana@example.com", fecha: "2025-01-14", vencimiento: "2025-02-13", total: "$67.25", estado: "Pagada" },
  { id: "5", numero: "INV-2025-005", orden: "ORD-005", cliente: "Luis Rodríguez", email: "luis@example.com", fecha: "2025-01-13", vencimiento: "2025-02-12", total: "$189.99", estado: "Vencida" },
]

export default function FacturasPage() {
  const [q, setQ] = useState("")
  const [estadoFilter, setEstadoFilter] = useState<string>("Todos")
  const [rows] = useState<Factura[]>(sample)

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (estadoFilter !== "Todos" && r.estado !== estadoFilter) return false
      if (!q) return true
      const term = q.toLowerCase()
      return (
        r.numero.toLowerCase().includes(term) ||
        (r.orden || "").toLowerCase().includes(term) ||
        r.cliente.toLowerCase().includes(term) ||
        (r.email || "").toLowerCase().includes(term)
      )
    })
  }, [rows, q, estadoFilter])

  function exportAll() {
    alert("Exportando todas las facturas... (mock)")
  }

  function download(f: Factura) {
    alert(`Descargando factura ${f.numero} (mock)`)
  }

  function sendInvoice(f: Factura) {
    alert(`Enviando factura ${f.numero} a ${f.email} (mock)`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Facturas</h1>
          <p className="text-sm text-muted-foreground mt-1">Administra todas las facturas de tu tienda</p>
        </div>

        <div>
          <Button variant="default" className="flex items-center gap-2" onClick={exportAll}>
            <Download className="w-4 h-4" /> Exportar Todo
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex gap-4 items-center mb-4">
          <div className="flex-1">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar facturas..." className="w-full" />
          </div>

          <div>
            <select className="rounded-md border px-3 py-2" value={estadoFilter} onChange={(e) => setEstadoFilter(e.target.value)}>
              <option value="Todos">Todos los estados</option>
              <option value="Pagada">Pagada</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Vencida">Vencida</option>
            </select>
          </div>
        </div>

        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Factura</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">
                    <div>{r.numero}</div>
                    <div className="text-xs text-muted-foreground">{r.orden}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{r.cliente}</div>
                    <div className="text-xs text-muted-foreground">{r.email}</div>
                  </TableCell>
                  <TableCell>{r.fecha}</TableCell>
                  <TableCell>{r.vencimiento}</TableCell>
                  <TableCell className="font-semibold">{r.total}</TableCell>
                  <TableCell>
                    {r.estado === "Pagada" ? (
                      <Badge className="bg-green-500 text-white">Pagada</Badge>
                    ) : r.estado === "Pendiente" ? (
                      <Badge className="bg-yellow-500 text-white">Pendiente</Badge>
                    ) : (
                      <Badge className="bg-red-500 text-white">Vencida</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <button title="Ver" className="text-gray-600 hover:text-gray-900"><Eye className="w-4 h-4" /></button>
                      <button title="Descargar" onClick={() => download(r)} className="text-gray-600 hover:text-gray-900"><Download className="w-4 h-4" /></button>
                      <button title="Enviar" onClick={() => sendInvoice(r)} className="text-gray-600 hover:text-gray-900"><Send className="w-4 h-4" /></button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
