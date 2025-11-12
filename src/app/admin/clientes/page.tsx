"use client"

import { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Eye, Mail } from "lucide-react"

type Cliente = {
  id: string
  nombre: string
  email: string
  telefono?: string
  pedidos: number
  totalGastado: string
  estado: "Activo" | "Inactivo"
  fechaRegistro: string
}

const sample: Cliente[] = [
  { id: "1", nombre: "Juan Pérez", email: "juan@example.com", telefono: "+1 234 567 8900", pedidos: 12, totalGastado: "$1245.99", estado: "Activo", fechaRegistro: "2024-06-15" },
  { id: "2", nombre: "María García", email: "maria@example.com", telefono: "+1 234 567 8901", pedidos: 8, totalGastado: "$789.50", estado: "Activo", fechaRegistro: "2024-07-22" },
  { id: "3", nombre: "Carlos López", email: "carlos@example.com", telefono: "+1 234 567 8902", pedidos: 15, totalGastado: "$2134.00", estado: "Activo", fechaRegistro: "2024-05-10" },
  { id: "4", nombre: "Ana Martínez", email: "ana@example.com", telefono: "+1 234 567 8903", pedidos: 5, totalGastado: "$456.25", estado: "Inactivo", fechaRegistro: "2024-08-05" },
  { id: "5", nombre: "Luis Rodríguez", email: "luis@example.com", telefono: "+1 234 567 8904", pedidos: 20, totalGastado: "$3189.99", estado: "Activo", fechaRegistro: "2024-04-18" },
]

export default function ClientesPage() {
  const [q, setQ] = useState("")
  const [estadoFilter, setEstadoFilter] = useState<string>("Todos")
  const [rows] = useState<Cliente[]>(sample)

  const filtered = useMemo(() => {
    return rows.filter((c) => {
      if (estadoFilter !== "Todos" && c.estado !== estadoFilter) return false
      if (!q) return true
      const term = q.toLowerCase()
      return (
        c.nombre.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        (c.telefono || "").toLowerCase().includes(term)
      )
    })
  }, [rows, q, estadoFilter])

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Clientes</h1>
          <p className="text-sm text-muted-foreground mt-1">Administra la información de tus clientes</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex gap-4 items-center mb-4">
          <div className="flex-1">
            <div className="relative">
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar clientes..." className="w-full" />
            </div>
          </div>

          <div>
            <select className="rounded-md border px-3 py-2" value={estadoFilter} onChange={(e) => setEstadoFilter(e.target.value)}>
              <option value="Todos">Todos los estados</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>
        </div>

        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Pedidos</TableHead>
                <TableHead>Total Gastado</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha de Registro</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.nombre}</TableCell>
                  <TableCell>
                    <div className="text-sm">{c.email}</div>
                    <div className="text-xs text-muted-foreground">{c.telefono}</div>
                  </TableCell>
                  <TableCell>{c.pedidos} pedidos</TableCell>
                  <TableCell className="font-semibold">{c.totalGastado}</TableCell>
                  <TableCell>
                    {c.estado === "Activo" ? (
                      <Badge className="bg-green-500 text-white">Activo</Badge>
                    ) : (
                      <Badge className="bg-muted text-foreground">Inactivo</Badge>
                    )}
                  </TableCell>
                  <TableCell>{c.fechaRegistro}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <button title="Ver" className="text-gray-600 hover:text-gray-900"><Eye className="w-4 h-4" /></button>
                      <button title="Enviar correo" className="text-gray-600 hover:text-gray-900"><Mail className="w-4 h-4" /></button>
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
