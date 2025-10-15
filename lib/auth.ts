export type Role = "admin" | "vendedor" | null

// Helper de autenticación demo (NO usar en producción)
// Usuarios hardcodeados para demo:
// admin / admin123 -> admin
// vendedor / vendedor123 -> vendedor
export function validateCredentials(usuario: string, password: string): Role {
  if (!usuario || !password) return null
  const u = usuario.toLowerCase()
  if ((u === "admin" || u === "administrador") && password === "admin123") {
    return "admin"
  }
  if ((u === "vendedor" || u === "seller") && password === "vendedor123") {
    return "vendedor"
  }
  return null
}

export default validateCredentials
