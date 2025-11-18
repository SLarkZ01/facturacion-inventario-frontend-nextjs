import { listarMovimientosService } from "@/lib/server/movimientosServer";
import { listarProductosService } from "@/lib/server/productosServer";
import { MovimientosTable } from "./components/MovimientosTable";

type Movimiento = {
  id: string;
  tipo: string;
  productoId: string;
  cantidad: number;
  creadoEn?: string;
  fecha?: string;
  referencia?: string;
  observaciones?: string;
  realizadoPor?: string;
  usuarioId?: string;
};

type Producto = {
  id: string;
  nombre: string;
};

/**
 * Obtiene los datos de movimientos y productos
 */
async function getMovimientosData() {
  try {
    const [movimientos, productosResult] = await Promise.all([
      listarMovimientosService(),
      listarProductosService({}, undefined),
    ]);

    // Extraer array de productos según la respuesta
    let productos: Producto[] = [];
    if (Array.isArray(productosResult)) {
      productos = productosResult;
    } else if (productosResult && typeof productosResult === 'object') {
      const result = productosResult as any;
      if (result.body) {
        if (Array.isArray(result.body)) {
          productos = result.body;
        } else if (result.body.content) {
          productos = result.body.content;
        } else if (result.body.productos) {
          productos = result.body.productos;
        }
      }
    }

    return { movimientos, productos };
  } catch (error) {
    console.error("Error cargando datos:", error);
    return { movimientos: [], productos: [] };
  }
}

/**
 * Enriquece movimientos con información del producto
 */
function enrichMovimientos(movimientos: Movimiento[], productos: Producto[]) {
  return movimientos.map((mov) => {
    const producto = productos.find((p) => p.id === mov.productoId);
    return {
      ...mov,
      productoNombre: producto?.nombre || "Producto desconocido",
    };
  });
}

export default async function MovimientosStockPage() {
  const { movimientos, productos } = await getMovimientosData();

  // Enriquecer movimientos con nombre del producto
  const movimientosEnriquecidos = enrichMovimientos(movimientos, productos);

  return <MovimientosTable movimientos={movimientosEnriquecidos} />;
}
