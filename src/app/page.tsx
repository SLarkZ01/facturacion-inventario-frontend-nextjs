import { cookies } from "next/headers";
import { meService } from "@/lib/server/authServer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import AuthActions from "@/components/landing/AuthActions";

export default async function LandingPage() {
  // Leer cookie de access token y verificar con backend si el usuario está autenticado
  const cookieStore = await cookies();
  const access = cookieStore.get("access_token")?.value;

  let user: unknown = null;
  if (access) {
    try {
      const result = await meService(access);
      if (result?.status === 200) {
        user = result.body;
      }
    } catch {
      // si falla, consideramos no autenticado
      user = null;
    }
  }

  // Obtener un string representativo del usuario si está disponible
  let userName = null as string | null;
  if (user && typeof user === "object") {
    const u = user as Record<string, unknown>;
    if (typeof u["nombre"] === "string") userName = u["nombre"] as string;
    else if (typeof u["username"] === "string") userName = u["username"] as string;
    else if (typeof u["name"] === "string") userName = u["name"] as string;
  }

  return (
    <main className="max-w-6xl mx-auto py-12 px-4">
      {/* Usar bg-card/text-card-foreground para asegurar contraste en modo claro/oscuro */}
      <Card className="bg-card p-8">
        <CardHeader>
          <CardTitle className="text-3xl text-card-foreground">Gestión de facturación e inventario</CardTitle>
          <CardDescription className="mt-2 text-card-foreground/90">
            Plataforma para administrar productos, stock, carritos y facturas. Accede para ver tu panel de control con estadísticas, movimientos y más.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mt-6">
            {/* Componente cliente que muestra acciones según estado de sesión */}
            {/* Pasamos la información mínima: si user existe y su nombre para saludo */}
            <AuthActions isLoggedIn={!!user} userName={userName} />
          </div>
        </CardContent>
      </Card>

      <section className="mt-8 text-sm text-muted-foreground">
        <p>
          Si eres administrador o personal del taller, inicia sesión para administrar el inventario y consultar facturas. Si no tienes cuenta, puedes registrarte.
        </p>
        <p className="mt-4">
          También puedes explorar el demo o ver la documentación del API en el repositorio.
        </p>
      </section>
    </main>
  );
}
