import { listarFacturasService } from "@/lib/server/facturasServer";
import { cookies } from "next/headers";
import { FacturasTable } from "./components/FacturasTable";

/**
 * Función para obtener todas las facturas
 */
async function getFacturasData() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return { facturas: [] };
  }

  const result = await listarFacturasService({}, accessToken);

  if (result.status === 200) {
    // Extraer datos correctamente (el backend puede envolver la respuesta)
    let facturas: any[] = [];
    
    if (Array.isArray(result.body)) {
      facturas = result.body;
    } else if (result.body && typeof result.body === "object" && "facturas" in result.body) {
      facturas = (result.body as any).facturas;
    }

    // Mapear _id a id si es necesario
    const facturasConId = facturas.map((factura) => ({
      ...factura,
      id: factura.id || factura._id,
    }));

    return { facturas: facturasConId };
  }

  return { facturas: [] };
}

export default async function FacturasPage() {
  const { facturas } = await getFacturasData();

  return <FacturasTable facturas={facturas} />;
}
