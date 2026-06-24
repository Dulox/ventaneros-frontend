// ═══ SHARED CONSTANTS ══════════════════════════════════════════════════════
export const MATS = ["Natural", "Lacado Blanco", "Lacado Bronce", "Anodizado Bronce", "Madera", "Oro", "Mate"];

export const VIDS = ["Natural transparente", "Bronce liso", "Bronce martillado", "Natural martillado", "Corrugado", "Reflectivo", "Blue green"];

export const VENTANAS = [
  { id: "cor", nombre: "Corrediza Tradicional", icon: "🪟", desc: "Marco GK, rieles ext/int, 2-6 hojas", on: true },
  { id: "pa", nombre: "Persiana Tipo A", icon: "🔳", desc: "Celosía por cuerpo, cabezal dividido", on: true },
  { id: "paa", nombre: "Persiana Tipo AA", icon: "⬡", desc: "Celosía ancho completo, cabezal único", on: true },
  { id: "p65", nombre: "Corrediza Med. P-65", icon: "🏛️", desc: "Perfiles ALD, riel Ext/Int, felpa 4 componentes", on: true },
  { id: "p92", nombre: "Corrediza Med. P-92", icon: "🏗️", desc: "Perfiles ALD-900, grandes dimensiones", on: true },
  { id: "int", nombre: "Corrediza Integrada", icon: "⬛", desc: "Acabado flush integrado en pared", on: false, hidden: true },
  { id: "pu", nombre: "Puertas Comercial & Residencial", icon: "🚪", desc: "GK-48/50/52/84/85, 1 o 2 hojas, Comercial/Residencial", on: true },
];

// Demo/sample data — used only as fallback or initial illustration before
// the empresa has its own real data in the database.
export const DC = [
  { id: 1, nombre: "Constructora Pérez & Asociados", contacto: "Luis Pérez", tel: "809-555-1234", email: "lperez@construc.do", ciudad: "Sto. Domingo", tipo: "Empresa", estado: "Activo", ordenes: 8 },
  { id: 2, nombre: "Ferretería El Martillo", contacto: "Carmen Rodríguez", tel: "829-555-5678", email: "carmen@martillo.do", ciudad: "Santiago", tipo: "Empresa", estado: "Activo", ordenes: 3 },
  { id: 3, nombre: "María González", contacto: "María González", tel: "849-555-9012", email: "mgonzalez@gmail.com", ciudad: "La Romana", tipo: "Particular", estado: "Activo", ordenes: 1 },
  { id: 4, nombre: "Inmobiliaria Vista Verde", contacto: "Roberto Méndez", tel: "809-555-3456", email: "rob@vverde.do", ciudad: "Punta Cana", tipo: "Empresa", estado: "Inactivo", ordenes: 12 },
];

export const DP = [
  { id: 1, nombre: "Aluminio del Caribe SRL", contacto: "Jorge Santos", tel: "809-555-2233", ciudad: "Sto. Domingo", producto: "Perfiles de Aluminio", estado: "Activo" },
  { id: 2, nombre: "Vidriera Nacional", contacto: "Patricia Cruz", tel: "829-555-4455", ciudad: "Santiago", producto: "Vidrios y Cristales", estado: "Activo" },
  { id: 3, nombre: "Herrajes RD Import", contacto: "Manuel Reyes", tel: "849-555-6677", ciudad: "Sto. Domingo", producto: "Herrajes", estado: "Activo" },
];
