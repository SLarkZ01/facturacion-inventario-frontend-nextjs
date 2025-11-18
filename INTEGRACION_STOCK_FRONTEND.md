# 📦 INTEGRACIÓN STOCK POR ALMACÉN - Guía Frontend

**Fecha:** 2025-11-17  
**Backend Actualizado:** ✅ Completado

## 🎯 Resumen de Cambios

Se ha implementado un sistema de gestión de stock por almacén, reemplazando el sistema anterior de "stock simple" en el modelo de Producto.

### ❌ Arquitectura Anterior (DEPRECADA)

```javascript
// Producto tenía stock directo
{
  "id": "691a725aaba13b365dff6b93",
  "nombre": "Filtro de aceite",
  "stock": 53  // ❌ Ya no existe
}
```

### ✅ Nueva Arquitectura (ACTUAL)

```javascript
// Producto sin stock directo
{
  "id": "691a725aaba13b365dff6b93",
  "nombre": "Filtro de aceite"
  // stock ya NO está aquí
}

// Stock se maneja en colección separada
{
  "productoId": "691a725aaba13b365dff6b93",
  "almacenId": "ertgerfgsrf",
  "almacenNombre": "Almacén Principal",
  "cantidad": 53,
  "ultimaActualizacion": "2025-11-17T20:30:00Z"
}
```

## 🔄 Cambios Requeridos en Frontend

### 1. **Pantalla de Productos - Listar**

#### ❌ Código Anterior (NO FUNCIONA)
```tsx
// INCORRECTO - producto.stock ya no existe
{productos.map((producto) => (
  <div key={producto.id}>
    <h3>{producto.nombre}</h3>
    <p>Stock: {producto.stock}</p>  {/* ❌ Siempre será undefined */}
  </div>
))}
```

#### ✅ Código Actualizado (CORRECTO)

**Opción A: Mostrar stock total (suma de todos los almacenes)**

```tsx
// 1. Obtener stock por producto
const obtenerStockTotal = async (productoId: string) => {
  const response = await fetch(
    `http://localhost:8080/api/stock/producto/${productoId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  const stocks = await response.json(); // Array de stock por almacén
  
  // Sumar stock de todos los almacenes
  const stockTotal = stocks.reduce((sum, s) => sum + s.cantidad, 0);
  return stockTotal;
};

// 2. En el componente
{productos.map((producto) => (
  <div key={producto.id}>
    <h3>{producto.nombre}</h3>
    <StockDisplay productoId={producto.id} />
  </div>
))}

// 3. Componente para mostrar stock
const StockDisplay = ({ productoId }) => {
  const [stockTotal, setStockTotal] = useState(0);
  
  useEffect(() => {
    obtenerStockTotal(productoId).then(setStockTotal);
  }, [productoId]);
  
  return <p>Stock Total: {stockTotal} unidades</p>;
};
```

**Opción B: Mostrar stock desglosado por almacén**

```tsx
const StockPorAlmacen = ({ productoId }) => {
  const [stocks, setStocks] = useState([]);
  
  useEffect(() => {
    fetch(`http://localhost:8080/api/stock/producto/${productoId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setStocks);
  }, [productoId]);
  
  return (
    <div>
      <h4>Stock por Almacén:</h4>
      {stocks.map((stock) => (
        <div key={stock.almacenId}>
          <span>{stock.almacenNombre}: </span>
          <strong>{stock.cantidad}</strong> unidades
        </div>
      ))}
      <div>
        <strong>Total: {stocks.reduce((sum, s) => sum + s.cantidad, 0)}</strong>
      </div>
    </div>
  );
};
```

### 2. **Pantalla de Stock - Ajustar Stock**

#### Nueva Pantalla: `/admin/stock/ajustar`

```tsx
import { useState, useEffect } from 'react';

const AjustarStockPage = () => {
  const [productos, setProductos] = useState([]);
  const [almacenes, setAlmacenes] = useState([]);
  const [selectedProducto, setSelectedProducto] = useState('');
  const [selectedAlmacen, setSelectedAlmacen] = useState('');
  const [nuevaCantidad, setNuevaCantidad] = useState(0);
  const [stockActual, setStockActual] = useState(null);
  const [motivo, setMotivo] = useState('');

  // Cargar productos
  useEffect(() => {
    fetch('http://localhost:8080/api/productos', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setProductos(data.productos || data));
  }, []);

  // Cargar almacenes (talleres)
  useEffect(() => {
    fetch('http://localhost:8080/api/talleres', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setAlmacenes);
  }, []);

  // Obtener stock actual cuando se selecciona producto y almacén
  useEffect(() => {
    if (selectedProducto && selectedAlmacen) {
      fetch(
        `http://localhost:8080/api/stock/producto/${selectedProducto}/almacen/${selectedAlmacen}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )
        .then(res => res.json())
        .then(stock => {
          setStockActual(stock.cantidad || 0);
          setNuevaCantidad(stock.cantidad || 0);
        })
        .catch(() => {
          setStockActual(0);
          setNuevaCantidad(0);
        });
    }
  }, [selectedProducto, selectedAlmacen]);

  const handleAjustar = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/stock/set', {
        method: 'POST', // o PUT (ambos funcionan)
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productoId: selectedProducto,
          almacenId: selectedAlmacen,
          cantidad: nuevaCantidad,
          motivo: motivo
        })
      });

      if (response.ok) {
        alert('Stock actualizado correctamente');
        setStockActual(nuevaCantidad);
      }
    } catch (error) {
      console.error('Error al ajustar stock:', error);
    }
  };

  return (
    <div className="ajustar-stock-container">
      <h1>Ajustar Stock</h1>

      {/* Selector de Producto */}
      <div>
        <label>Producto:</label>
        <select 
          value={selectedProducto} 
          onChange={(e) => setSelectedProducto(e.target.value)}
        >
          <option value="">Seleccionar producto...</option>
          {productos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Selector de Almacén */}
      <div>
        <label>Almacén:</label>
        <select 
          value={selectedAlmacen} 
          onChange={(e) => setSelectedAlmacen(e.target.value)}
        >
          <option value="">Seleccionar almacén...</option>
          {almacenes.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Mostrar stock actual */}
      {stockActual !== null && (
        <div className="stock-actual-info">
          <p>Stock actual en {selectedAlmacen}: <strong>{stockActual}</strong> unidades</p>
        </div>
      )}

      {/* Input de nueva cantidad */}
      <div>
        <label>Nueva Cantidad:</label>
        <input 
          type="number" 
          value={nuevaCantidad}
          onChange={(e) => setNuevaCantidad(parseInt(e.target.value) || 0)}
        />
      </div>

      {/* Preview del cambio */}
      {stockActual !== null && (
        <div className="preview-cambio">
          <p>
            Nuevo stock: {nuevaCantidad} unidades
            {nuevaCantidad > stockActual && (
              <span className="increment"> (+{nuevaCantidad - stockActual})</span>
            )}
            {nuevaCantidad < stockActual && (
              <span className="decrement"> (-{stockActual - nuevaCantidad})</span>
            )}
          </p>
        </div>
      )}

      {/* Motivo (opcional) */}
      <div>
        <label>Motivo (opcional):</label>
        <textarea 
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="Ej: Inventario físico, corrección de error..."
        />
      </div>

      {/* Botones */}
      <div>
        <button onClick={() => window.history.back()}>
          Cancelar
        </button>
        <button 
          onClick={handleAjustar}
          disabled={!selectedProducto || !selectedAlmacen}
        >
          Guardar
        </button>
      </div>
    </div>
  );
};

export default AjustarStockPage;
```

### 3. **Crear Factura - Validar Stock**

```tsx
const CrearFacturaPage = () => {
  const [items, setItems] = useState([]);
  
  const agregarItem = async (productoId, cantidad, almacenId) => {
    // Validar stock antes de agregar
    const response = await fetch(
      `http://localhost:8080/api/stock/producto/${productoId}/almacen/${almacenId}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    
    const stock = await response.json();
    
    if (stock.cantidad < cantidad) {
      alert(`Stock insuficiente. Disponible: ${stock.cantidad}, Solicitado: ${cantidad}`);
      return;
    }
    
    // Agregar item
    setItems([...items, { productoId, cantidad }]);
  };
};
```

## 🌐 Endpoints Disponibles

### 1. **Obtener stock de un producto en todos los almacenes**

```http
GET /api/stock/producto/{productoId}
Authorization: Bearer {token}

Response 200:
[
  {
    "productoId": "691a725aaba13b365dff6b93",
    "almacenId": "ertgerfgsrf",
    "almacenNombre": "Almacén Principal",
    "cantidad": 53,
    "ultimaActualizacion": "2025-11-17T20:30:00Z"
  },
  {
    "productoId": "691a725aaba13b365dff6b93",
    "almacenId": "xyz123",
    "almacenNombre": "Almacén Secundario",
    "cantidad": 20,
    "ultimaActualizacion": "2025-11-17T19:00:00Z"
  }
]

Stock Total: 73 unidades (53 + 20)
```

### 2. **Obtener stock de un producto en un almacén específico**

```http
GET /api/stock/producto/{productoId}/almacen/{almacenId}
Authorization: Bearer {token}

Response 200:
{
  "productoId": "691a725aaba13b365dff6b93",
  "almacenId": "ertgerfgsrf",
  "almacenNombre": "Almacén Principal",
  "cantidad": 53,
  "ultimaActualizacion": "2025-11-17T20:30:00Z"
}

Response 404: (si no hay stock registrado)
{
  "error": "Stock no encontrado",
  "message": "No existe registro de stock para este producto en este almacén"
}
```

### 3. **Obtener todos los productos con stock en un almacén**

```http
GET /api/stock/almacen/{almacenId}
Authorization: Bearer {token}

Response 200:
[
  {
    "productoId": "691a725aaba13b365dff6b93",
    "productoNombre": "Filtro de aceite",
    "almacenId": "ertgerfgsrf",
    "cantidad": 53
  },
  {
    "productoId": "691aa58e3906a3260e566980",
    "productoNombre": "Pastillas de freno",
    "almacenId": "ertgerfgsrf",
    "cantidad": 25
  }
]
```

### 4. **Establecer/Actualizar stock (valor absoluto)**

```http
POST /api/stock/set
Content-Type: application/json
Authorization: Bearer {token}

{
  "productoId": "691a725aaba13b365dff6b93",
  "almacenId": "ertgerfgsrf",
  "cantidad": 57,
  "motivo": "Inventario físico realizado"
}

Response 200:
{
  "productoId": "691a725aaba13b365dff6b93",
  "almacenId": "ertgerfgsrf",
  "almacenNombre": "Almacén Principal",
  "cantidad": 57,
  "ultimaActualizacion": "2025-11-17T22:45:00Z"
}
```

**Nota:** También acepta `PUT /api/stock/set` (mismo comportamiento)

## 🔧 Tipos TypeScript Sugeridos

```typescript
// types/stock.ts

export interface StockPorAlmacen {
  productoId: string;
  productoNombre?: string; // Opcional, depende del endpoint
  almacenId: string;
  almacenNombre: string;
  cantidad: number;
  ultimaActualizacion: string; // ISO 8601 date string
}

export interface AjustarStockRequest {
  productoId: string;
  almacenId: string;
  cantidad: number;
  motivo?: string; // Opcional
}

export interface Producto {
  id: string;
  idString: string;
  nombre: string;
  descripcion: string;
  precio: number;
  tasaIva: number | null;
  categoriaId: string;
  // ❌ stock ya NO existe aquí
}
```

## 📋 Migraciones de Código

### Migración 1: Lista de Productos

```tsx
// ❌ ANTES
const ProductoCard = ({ producto }) => (
  <div>
    <h3>{producto.nombre}</h3>
    <p>Stock: {producto.stock}</p>
  </div>
);

// ✅ DESPUÉS
const ProductoCard = ({ producto }) => {
  const [stockTotal, setStockTotal] = useState(0);
  
  useEffect(() => {
    fetch(`/api/stock/producto/${producto.id}`)
      .then(res => res.json())
      .then(stocks => {
        const total = stocks.reduce((sum, s) => sum + s.cantidad, 0);
        setStockTotal(total);
      });
  }, [producto.id]);
  
  return (
    <div>
      <h3>{producto.nombre}</h3>
      <p>Stock Total: {stockTotal}</p>
    </div>
  );
};
```

### Migración 2: Formulario de Producto

```tsx
// ❌ ANTES - Input de stock en formulario de producto
<input 
  name="stock"
  type="number"
  value={producto.stock}
  onChange={handleChange}
/>

// ✅ DESPUÉS - Ya no se edita stock desde aquí
// El stock se maneja desde /admin/stock/ajustar

// Solo campos del producto:
<input name="nombre" ... />
<input name="precio" ... />
<select name="categoriaId" ... />
```

### Migración 3: Crear Producto

```tsx
// ❌ ANTES
const crearProducto = async (data) => {
  await fetch('/api/productos', {
    method: 'POST',
    body: JSON.stringify({
      nombre: data.nombre,
      precio: data.precio,
      stock: data.stock, // ❌ Ya no se envía
      categoriaId: data.categoriaId
    })
  });
};

// ✅ DESPUÉS
const crearProducto = async (data) => {
  // 1. Crear producto sin stock
  const responseProducto = await fetch('/api/productos', {
    method: 'POST',
    body: JSON.stringify({
      nombre: data.nombre,
      precio: data.precio,
      categoriaId: data.categoriaId
    })
  });
  
  const producto = await responseProducto.json();
  
  // 2. Si se quiere establecer stock inicial, usar endpoint de stock
  if (data.stockInicial > 0) {
    await fetch('/api/stock/set', {
      method: 'POST',
      body: JSON.stringify({
        productoId: producto.id,
        almacenId: data.almacenId, // Almacén seleccionado
        cantidad: data.stockInicial,
        motivo: "Stock inicial del producto"
      })
    });
  }
};
```

## 🎨 Componentes Reutilizables Sugeridos

### Componente: `<StockBadge />`

```tsx
// components/StockBadge.tsx
interface StockBadgeProps {
  productoId: string;
  showDetails?: boolean;
}

const StockBadge: React.FC<StockBadgeProps> = ({ 
  productoId, 
  showDetails = false 
}) => {
  const [stocks, setStocks] = useState<StockPorAlmacen[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch(`/api/stock/producto/${productoId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setStocks(data);
        setLoading(false);
      });
  }, [productoId]);
  
  if (loading) return <span>Cargando...</span>;
  
  const stockTotal = stocks.reduce((sum, s) => sum + s.cantidad, 0);
  
  return (
    <div className="stock-badge">
      <span className={stockTotal > 0 ? 'in-stock' : 'out-of-stock'}>
        {stockTotal} unidades
      </span>
      
      {showDetails && stocks.length > 1 && (
        <div className="stock-details">
          {stocks.map((stock) => (
            <div key={stock.almacenId}>
              {stock.almacenNombre}: {stock.cantidad}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

### Componente: `<StockSelector />`

```tsx
// components/StockSelector.tsx
interface StockSelectorProps {
  productoId: string;
  onSelect: (almacenId: string, stockDisponible: number) => void;
}

const StockSelector: React.FC<StockSelectorProps> = ({ 
  productoId, 
  onSelect 
}) => {
  const [stocks, setStocks] = useState<StockPorAlmacen[]>([]);
  
  useEffect(() => {
    fetch(`/api/stock/producto/${productoId}`)
      .then(res => res.json())
      .then(setStocks);
  }, [productoId]);
  
  return (
    <select onChange={(e) => {
      const stock = stocks.find(s => s.almacenId === e.target.value);
      if (stock) onSelect(stock.almacenId, stock.cantidad);
    }}>
      <option value="">Seleccionar almacén...</option>
      {stocks.map((stock) => (
        <option key={stock.almacenId} value={stock.almacenId}>
          {stock.almacenNombre} ({stock.cantidad} disponibles)
        </option>
      ))}
    </select>
  );
};
```

## ⚠️ Errores Comunes y Soluciones

### Error 1: "Stock is undefined"

```tsx
// ❌ PROBLEMA
console.log(producto.stock); // undefined

// ✅ SOLUCIÓN
// Usar endpoint de stock
fetch(`/api/stock/producto/${producto.id}`)
  .then(res => res.json())
  .then(stocks => {
    const total = stocks.reduce((sum, s) => sum + s.cantidad, 0);
    console.log(total);
  });
```

### Error 2: "404 Not Found al consultar stock"

```tsx
// ❌ PROBLEMA
// El producto nunca ha tenido stock registrado en ese almacén

// ✅ SOLUCIÓN
fetch(`/api/stock/producto/${productoId}/almacen/${almacenId}`)
  .then(res => {
    if (res.status === 404) {
      // No hay stock registrado, asumir 0
      return { cantidad: 0 };
    }
    return res.json();
  })
  .then(stock => {
    console.log(`Stock: ${stock.cantidad}`);
  });
```

### Error 3: "Request method 'POST' is not supported"

```tsx
// ❌ PROBLEMA
// Intentar usar POST en endpoint que solo acepta GET

// ✅ SOLUCIÓN
// Verificar método HTTP correcto:
// - GET /api/stock/producto/{id}
// - POST /api/stock/set (o PUT /api/stock/set)
```

## 📊 Flujo Completo: Crear Factura con Stock

```tsx
const CrearFacturaFlow = () => {
  // 1. Usuario selecciona producto
  const seleccionarProducto = (productoId) => {
    // 2. Obtener stock disponible en almacenes
    fetch(`/api/stock/producto/${productoId}`)
      .then(res => res.json())
      .then(stocks => {
        // 3. Usuario selecciona almacén
        mostrarOpcionesAlmacen(stocks);
      });
  };
  
  // 4. Usuario ingresa cantidad
  const validarCantidad = (cantidad, almacenId, productoId) => {
    fetch(`/api/stock/producto/${productoId}/almacen/${almacenId}`)
      .then(res => res.json())
      .then(stock => {
        if (cantidad > stock.cantidad) {
          alert(`Solo hay ${stock.cantidad} disponibles`);
          return false;
        }
        return true;
      });
  };
  
  // 5. Agregar a factura
  const agregarAFactura = (item) => {
    setItems([...items, item]);
  };
  
  // 6. Crear factura (backend descuenta stock automáticamente)
  const crearFactura = async () => {
    await fetch('/api/facturas', {
      method: 'POST',
      body: JSON.stringify({
        cliente: {...},
        items: items
      })
    });
    // Backend descuenta stock automáticamente
  };
};
```

## ✅ Checklist de Implementación Frontend

- [ ] Actualizar componente de lista de productos (quitar `producto.stock`)
- [ ] Crear pantalla `/admin/stock/ajustar`
- [ ] Actualizar formulario de crear/editar producto (quitar campo stock)
- [ ] Crear componente `<StockBadge />` reutilizable
- [ ] Actualizar creación de facturas con validación de stock
- [ ] Agregar tipos TypeScript para Stock
- [ ] Actualizar tests unitarios
- [ ] Documentar en README del frontend

## 📚 Recursos Adicionales

- **OpenAPI Docs:** `http://localhost:8080/docs/openapi.yaml`
- **Endpoint de prueba:** Use Postman o Thunder Client con los ejemplos de arriba
- **Código Backend:** `src/main/java/com/repobackend/api/stock/`

---

**Desarrollado:** 2025-11-17  
**Backend:** ✅ Implementado  
**Frontend:** ⏳ Pendiente de integración

