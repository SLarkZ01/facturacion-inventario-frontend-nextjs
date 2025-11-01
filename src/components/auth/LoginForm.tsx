"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast/ToastProvider";
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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(LoginSchema) });

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
        let message = "Error al iniciar sesión";
        try {
          const json = await res.json();
          message = json?.message || message;
        } catch {}
  push({ title: "Error", description: message, variant: "error" });
        return;
      }

      // On success redirect to dashboard
  push({ title: "Bienvenido", description: "Sesión iniciada correctamente", variant: "success" });
      router.push("/");
    } catch {
  push({ title: "Error", description: "Error en el servidor", variant: "error" });
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="usernameOrEmail">Usuario o correo</Label>
            <Input id="usernameOrEmail" type="text" {...register("usernameOrEmail")} />
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
            <Input id="password" type="password" {...register("password")} />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
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
          >
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
