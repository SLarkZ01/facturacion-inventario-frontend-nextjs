"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast/ToastProvider";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Adaptado al modelo generado `LoginRequest` (gen): { usernameOrEmail, password, device? }
const LoginSchema = z.object({
  usernameOrEmail: z.string().min(1, { message: "Usuario o email requerido" }),
  password: z.string().min(6, { message: "Password too short" }),
});

type LoginValues = z.infer<typeof LoginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const { push } = useToast();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(LoginSchema) });

  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(values: LoginValues) {
    // Minimal example: call a login API route. Replace with real auth.
    try {
      // Añadimos `device` por compatibilidad con backend si lo requiere
      const payload = { ...values, device: typeof navigator !== 'undefined' ? navigator.userAgent : undefined };

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // Mostrar mensaje inline en vez de un toast para errores de login
        try {
          const json = await res.json();
          if (res.status === 401) {
            // Mensaje pedido: exactamente "contraseña incorreta"
            setErrorMessage("contraseña incorreta");
          } else if (json?.message) {
            setErrorMessage(String(json.message));
          } else {
            setErrorMessage("Error al iniciar sesión");
          }
        } catch {
          setErrorMessage("Error al iniciar sesión");
        }
        return;
      }

      // On success: clear inline error, show toast and redirect to dashboard
      setErrorMessage(null);
      push({ title: "Bienvenido", description: "Sesión iniciada correctamente", variant: "success" });
      router.push("/");
    } catch {
      // Mostrar error inline en caso de fallo de red/servidor
      setErrorMessage("Error en el servidor");
    }
  }

  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardHeader>
        <CardTitle>Inicia sesión en tu cuenta</CardTitle>
        <CardDescription>Ingresa tu correo electrónico a continuación para iniciar sesión en tu cuenta</CardDescription>
        <CardAction>
          <Button variant="link" onClick={() => router.push("/register")}>
            Registrarse
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" aria-busy={isSubmitting}>
          <div className="grid gap-2">
            <Label htmlFor="usernameOrEmail">Usuario o correo</Label>
            <Input id="usernameOrEmail" type="text" {...register("usernameOrEmail")} disabled={isSubmitting} />
            {errors.usernameOrEmail && (
              <p className="text-sm text-destructive">{errors.usernameOrEmail.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Contraseña</Label>
              <a
                href="#"
                className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
              >
              </a>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
                onInput={() => setErrorMessage(null)}
                disabled={isSubmitting}
                className="pr-10"
              />
              <button
                type="button"
                aria-pressed={showPassword}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
            {errorMessage && (
              <p className="text-sm text-destructive">{errorMessage}</p>
            )}
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <div className="w-full">
          <Button
            onClick={handleSubmit(onSubmit)}
            className="w-full"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting && (
              <svg
                className="animate-spin h-4 w-4 mr-2"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
                <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            )}
            Iniciar sesión
          </Button>
        </div>
        <div className="w-full">
          <Button variant="outline" className="w-full">
            Iniciar sesión con Google
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
