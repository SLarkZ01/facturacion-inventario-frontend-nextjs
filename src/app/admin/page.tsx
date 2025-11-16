"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Página de redirección después del login.
 * Redirige directamente al dashboard.
 */
export default function AdminRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir directamente al dashboard
    router.replace("/admin/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="mt-2 text-gray-600">Redirigiendo al dashboard...</p>
      </div>
    </div>
  );
}
