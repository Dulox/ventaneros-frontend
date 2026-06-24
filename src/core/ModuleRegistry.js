// ═══ MODULE REGISTRY ═══════════════════════════════════════════════════════
// Catálogo central de TODOS los módulos posibles en Ventaneros.
// Cada empresa tiene una lista de módulos activos (campo `modulos_activos`
// en la tabla `empresas`), y el Sidebar solo muestra los que están en esa lista.
//
// Para agregar un módulo nuevo: agrégalo aquí con un id único, luego crea
// el componente en modules/<id>/index.jsx y conéctalo en el `component` map
// dentro de core/Shell.jsx (import perezoso).

export const MODULES = [
  {
    id: "agenda",
    nombre: "Agenda",
    icono: "📅",
    categoria: "General",
    descripcion: "Calendario, seguimiento de clientes y recordatorios",
    soloAdmin: false,
  },
  {
    id: "dashboard",
    nombre: "Dashboard",
    icono: "📊",
    categoria: "General",
    descripcion: "Resumen general de actividad",
  },
  {
    id: "calculadoras",
    nombre: "Calculadoras",
    icono: "📐",
    categoria: "Producción",
    descripcion: "Las 6 calculadoras de ventanas y puertas",
  },
  {
    id: "ordenes",
    nombre: "Órdenes de Producción",
    icono: "📋",
    categoria: "Producción",
    descripcion: "Crear y dar seguimiento a órdenes de producción",
  },
  {
    id: "clientes",
    nombre: "Clientes",
    icono: "👥",
    categoria: "Ventas",
    descripcion: "CRM básico de clientes",
  },
  {
    id: "presupuestos",
    nombre: "Presupuestos",
    icono: "🔄",
    categoria: "Ventas",
    descripcion: "Cotizaciones para clientes",
  },
  {
    id: "facturacion",
    nombre: "Facturación",
    icono: "📄",
    categoria: "Ventas",
    descripcion: "Facturas con ITBIS y NCF",
  },
  {
    id: "proveedores",
    nombre: "Proveedores",
    icono: "🚚",
    categoria: "Compras",
    descripcion: "Gestión de proveedores",
  },
  {
    id: "inventario",
    nombre: "Inventario",
    icono: "📦",
    categoria: "Compras",
    descripcion: "Control de stock de materiales",
  },
  {
    id: "precios",
    nombre: "Lista de Precios",
    icono: "💲",
    categoria: "Compras",
    descripcion: "Costos y precios de venta por material",
  },
  {
    id: "cuentas-por-pagar",
    nombre: "Cuentas por Pagar",
    icono: "💸",
    categoria: "Finanzas",
    descripcion: "Facturas de proveedores y pagos pendientes",
  },
  {
    id: "caja",
    nombre: "Caja",
    icono: "🏦",
    categoria: "Finanzas",
    descripcion: "Control de efectivo diario",
  },
  {
    id: "contabilidad",
    nombre: "Contabilidad",
    icono: "📈",
    categoria: "Finanzas",
    descripcion: "Diario de transacciones y balances",
  },
  {
    id: "despachos",
    nombre: "Despachos",
    icono: "🚛",
    categoria: "Logística",
    descripcion: "Seguimiento de entregas",
  },
  {
    id: "instalaciones",
    nombre: "Instalaciones",
    icono: "🔧",
    categoria: "Logística",
    descripcion: "Agendar y dar seguimiento a instalaciones",
  },
  {
    id: "configuracion",
    nombre: "Configuración",
    icono: "⚙️",
    categoria: "Administración",
    descripcion: "Empresa, NCF, políticas de precios y producción",
    soloAdmin: true,
  },
  {
    id: "usuarios",
    nombre: "Usuarios",
    icono: "👤",
    categoria: "Administración",
    descripcion: "Gestión de usuarios y permisos",
    soloAdmin: true,
  },
  {
    id: "licencias",
    nombre: "Licencias",
    icono: "🔑",
    categoria: "Administración",
    descripcion: "Panel de administración de clientes del SaaS (solo tú)",
    soloAdmin: true,
  },
  {
    id: "referidos",
    nombre: "Referidos",
    icono: "🎁",
    categoria: "Administración",
    descripcion: "Programa de referidos",
    soloAdmin: true,
  },
];

export function getModuleById(id) {
  return MODULES.find((m) => m.id === id);
}

export function getModulesByCategory() {
  const cats = {};
  for (const m of MODULES) {
    if (!cats[m.categoria]) cats[m.categoria] = [];
    cats[m.categoria].push(m);
  }
  return cats;
}
