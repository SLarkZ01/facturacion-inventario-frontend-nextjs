"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {Card,CardAction,CardContent,CardDescription,CardFooter,CardHeader,CardTitle,} from "@/components/ui/Card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/Label"

import { validateCredentials as validate } from "@/lib/auth"

export function Login() {
  const router = useRouter()
  const [usuario, setUsuario] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
  const role = validate(usuario.trim(), password)
    if (!role) {
      setError("Usuario o contraseña incorrectos")
      return
    }

    // Guardar cookie simple (demostración) y forzar navegación completa
    // para que el layout se vuelva a renderizar server-side con la cookie.
    try {
      // set cookie expirable a 1 day
      document.cookie = `auth=${role}; Path=/; max-age=${60 * 60 * 24}`
    } catch (e) {
      // ignore
    }

    // usar navegación completa para que el server render muestre la UI autenticada
    if (role === "admin") {
      window.location.href = "/admin"
    } else if (role === "vendedor") {
      window.location.href = "/vendedor"
    } else {
      setError("Rol no soportado")
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Iniciar sesión</CardTitle>
          <CardDescription>Ingrese su usuario y contraseña</CardDescription>
          <CardAction>
            <Button variant="link">Registrarse</Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="usuario">Usuario</Label>
                <Input
                  id="usuario"
                  type="text"
                  placeholder="usuario"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Contraseña</Label>
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="flex items-center gap-2 mt-2">
                  <input
                    id="show-password"
                    type="checkbox"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <label htmlFor="show-password" className="text-sm select-none">
                    Mostrar contraseña
                  </label>
                </div>
              </div>
              {error && (
                <div className="text-sm text-red-600">{error}</div>
              )}
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button onClick={(e) => handleSubmit(e as unknown as React.FormEvent)} type="submit" className="w-full">
            Iniciar sesión
          </Button>
          <Button variant="outline" className="w-full">
            Iniciar con Google
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default Login;