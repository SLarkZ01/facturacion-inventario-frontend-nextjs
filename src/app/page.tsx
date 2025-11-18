import { cookies } from "next/headers";
import Link from "next/link";
import { meService } from "@/lib/server/authServer";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import AuthActions from "@/components/landing/AuthActions";
import Navbar from "@/components/Navbar";

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
    <main className="min-h-screen">
      <Navbar userName={userName} showSidebarTrigger={false} />
      {/* Hero Section centrado sin logo */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[var(--background)] via-white to-[var(--background)] min-h-[60vh] sm:min-h-[70vh] flex items-center">
        {/* Decorative background elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--primary)]/5 rounded-full blur-3xl motion-safe:animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[var(--primary)]/5 rounded-full blur-3xl motion-safe:animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
          <div className="text-center motion-safe:animate-[fadeInUp_0.6s_ease-out]">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight text-[var(--foreground)] tracking-tight px-2">
              Repuestos de
              <br />
              <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-variant)] bg-clip-text text-transparent">
                Calidad
              </span>{" "}
              para tu Moto
            </h1>

            <p className="mt-5 sm:mt-6 text-base sm:text-lg lg:text-xl text-[var(--foreground)]/70 max-w-2xl mx-auto px-2 leading-relaxed">
              Encuentra todos los repuestos que necesitas para mantener tu motocicleta en perfecto estado. Calidad garantizada y los mejores precios.
            </p>

            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
              <AuthActions isLoggedIn={!!user} userName={userName} />
            </div>
          </div>
        </div>
      </section>

      {/* Feature cards con animación escalonada */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-colFFs-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {[
              {
                icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 3h15v13H1z"></path><path d="M16 8h4l3 3v5"></path><circle cx="7" cy="20" r="1"></circle><circle cx="18" cy="20" r="1"></circle></svg>,
                title: "Envío Rápido",
                description: "Entrega en 24-48 horas en todo el país",
                delay: "0s"
              },
              {
                icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l7 4v6c0 5-3.8 9-7 10-3.2-1-7-5-7-10V6l7-4z"></path></svg>,
                title: "Garantía de Calidad",
                description: "Todos nuestros productos están garantizados",
                delay: "0.1s"
              },
              {
                icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73L13 2.27a2 2 0 0 0-2 0L4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4.46a2 2 0 0 0 2 0l7-4.46A2 2 0 0 0 21 16z"></path></svg>,
                title: "Amplio Catálogo",
                description: "Miles de repuestos para todas las marcas",
                delay: "0.2s"
              }
            ].map((feature, idx) => (
              <Card
                key={idx}
                className="p-6 motion-safe:hover:shadow-xl motion-safe:transition-all motion-safe:duration-300 motion-safe:hover:-translate-y-1 motion-safe:animate-[fadeInUp_0.6s_ease-out_both] border-[var(--border)]"
                style={{ animationDelay: feature.delay }}
              >
                <CardHeader className="p-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-variant)] text-white flex items-center justify-center mb-3 sm:mb-4 motion-safe:group-hover:scale-110 motion-safe:transition-transform">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-bold">{feature.title}</CardTitle>
                  <CardDescription className="mt-2 sm:mt-3 text-sm sm:text-base text-[var(--muted-foreground)]">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-white to-[var(--background)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
            {[
              { value: "5000+", label: "Productos" },
              { value: "1000+", label: "Clientes" },
              { value: "24/7", label: "Soporte" },
              { value: "100%", label: "Garantía" }
            ].map((stat, idx) => (
              <div key={idx} className="motion-safe:animate-[fadeInUp_0.6s_ease-out_both]" style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold bg-gradient-to-r from-[var(--primary)] to-[var(--primary-variant)] bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="mt-1 sm:mt-2 text-xs sm:text-sm lg:text-base text-[var(--muted-foreground)] font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-variant)] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold mb-4 sm:mb-6 px-4">
            ¿Listo para empezar?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Únete a miles de motociclistas que confían en nosotros para mantener sus motos en perfecto estado.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            {!user ? (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-6 sm:px-8 py-3 text-sm sm:text-base font-medium rounded-lg bg-white text-[var(--primary)] hover:bg-white/90 motion-safe:transition-all motion-safe:duration-200 motion-safe:hover:scale-105 shadow-lg"
                >
                  Comenzar ahora
                </Link>
                <a
                  href="#"
                  className="inline-flex items-center justify-center px-6 sm:px-8 py-3 text-sm sm:text-base font-medium rounded-lg border-2 border-white text-white hover:bg-white/10 motion-safe:transition-all motion-safe:duration-200"
                >
                  Explorar catálogo
                </a>
              </>
            ) : (
              <Link
                href="/"
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 text-sm sm:text-base font-medium rounded-lg bg-white text-[var(--primary)] hover:bg-white/90 motion-safe:transition-all motion-safe:duration-200 motion-safe:hover:scale-105 shadow-lg"
              >
                Ir al Dashboard
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--foreground)] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--primary-variant)] flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
                <span className="text-xl font-bold">ERMOTOS</span>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">
                Tu tienda de confianza para repuestos de motocicletas. Calidad garantizada y los mejores precios del mercado.
              </p>
              <div className="flex gap-3 mt-6">
                {[
                  { icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>, label: "Facebook" },
                  { icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>, label: "Instagram" },
                  { icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>, label: "Twitter" }
                ].map((social, idx) => (
                  <a
                    key={idx}
                    href="#"
                    className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center motion-safe:transition-colors motion-safe:duration-200"
                    aria-label={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Links columns */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Productos</h3>
              <ul className="space-y-3 text-sm text-white/70">
                <li><a href="#" className="hover:text-white motion-safe:transition-colors">Repuestos</a></li>
                <li><a href="#" className="hover:text-white motion-safe:transition-colors">Lubricantes</a></li>
                <li><a href="#" className="hover:text-white motion-safe:transition-colors">Accesorios</a></li>
                <li><a href="#" className="hover:text-white motion-safe:transition-colors">Ofertas</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Empresa</h3>
              <ul className="space-y-3 text-sm text-white/70">
                <li><a href="#" className="hover:text-white motion-safe:transition-colors">Nosotros</a></li>
                <li><a href="#" className="hover:text-white motion-safe:transition-colors">Contacto</a></li>
                <li><a href="#" className="hover:text-white motion-safe:transition-colors">Testimonios</a></li>
                <li><a href="#" className="hover:text-white motion-safe:transition-colors">Blog</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Soporte</h3>
              <ul className="space-y-3 text-sm text-white/70">
                <li><a href="#" className="hover:text-white motion-safe:transition-colors">Centro de ayuda</a></li>
                <li><a href="#" className="hover:text-white motion-safe:transition-colors">Envíos</a></li>
                <li><a href="#" className="hover:text-white motion-safe:transition-colors">Devoluciones</a></li>
                <li><a href="#" className="hover:text-white motion-safe:transition-colors">Garantía</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white/60">
              © {new Date().getFullYear()} ERMOTOS. Todos los derechos reservados.
            </p>
            <div className="flex gap-6 text-sm text-white/60">
              <a href="#" className="hover:text-white motion-safe:transition-colors">Privacidad</a>
              <a href="#" className="hover:text-white motion-safe:transition-colors">Términos</a>
              <a href="#" className="hover:text-white motion-safe:transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
