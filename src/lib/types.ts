export type Category = {
  id: string;
  name: string;
};

// Insumo / materia prima (harina, huevos, azúcar…)
export type Supply = {
  id: string;
  name: string;
  unit: string; // unidad de medida (lb, u, L, kg…)
  cost: number; // costo por 1 unidad de medida
  stock: number; // existencia de insumo
  minStock: number;
};

// Un ingrediente dentro de la receta de un producto elaborado
export type RecipeItem = {
  supplyId: string;
  name: string;
  unit: string;
  qty: number; // cantidad de ese insumo por 1 unidad del producto
  cost: number; // costo unitario del insumo (copia para histórico)
};

export type ProductKind = "reventa" | "elaborado";

export type Product = {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  unit: string;
  cost: number; // costo unitario CUP (en elaborados se calcula de la receta + extra)
  price: number; // precio venta CUP
  stock: number;
  minStock: number;
  kind?: ProductKind; // "reventa" (por defecto) o "elaborado"
  recipe?: RecipeItem[]; // insumos del producto elaborado
  laborCost?: number; // costo extra por unidad (mano de obra, gas, electricidad)
};

export type Contact = {
  id: string;
  name: string;
  kind: "cliente" | "proveedor";
  phone: string;
  note: string;
};

export type SaleItem = {
  productId: string;
  name: string;
  qty: number;
  price: number;
  cost: number;
};

export type PaymentMethod = "efectivo" | "transferencia" | "mlc";

export type Sale = {
  id: string;
  date: string; // ISO
  customerId: string | null;
  customerName: string;
  items: SaleItem[];
  discount: number; // CUP
  payment: PaymentMethod;
  subtotal: number;
  total: number;
  cogs: number; // costo de la mercancia vendida
  profit: number;
};

export type PurchaseItem = {
  productId: string;
  name: string;
  qty: number;
  cost: number;
};

export type Purchase = {
  id: string;
  date: string;
  supplierId: string | null;
  supplierName: string;
  items: PurchaseItem[];
  total: number;
  payment: PaymentMethod;
};

export type Employee = {
  id: string;
  name: string;
  role: string;
  baseSalary: number; // salario base mensual CUP
  commissionPct: number; // % sobre ventas
  active: boolean;
};

export type Payroll = {
  id: string;
  date: string;
  period: string; // ej "2026-01"
  employeeId: string;
  employeeName: string;
  base: number;
  commission: number;
  bonus: number;
  deductions: number;
  net: number;
};

export type ExpenseCategory =
  | "alquiler"
  | "servicios"
  | "transporte"
  | "impuestos"
  | "salarios"
  | "compras"
  | "otros";

export type Expense = {
  id: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  payment: PaymentMethod;
};

// Una moneda configurable por el dueño (nombre + tasa de compra y pago)
export type Currency = {
  id: string;
  code: string; // ej "USD", "EUR", "MLC", "ZELLE"
  buy: number; // CUP por 1 unidad al COMPRAR (más baja)
  pay: number; // CUP por 1 unidad al ACEPTAR como pago
};

export type Warehouse = {
  id: string;
  name: string;
  location: string;
  active: boolean;
};

export type Business = {
  name: string;
  owner: string;
  taxRate: number; // % impuesto sobre ingresos (ONAT)
  currency: string;
  currencies: Currency[]; // monedas que el dueño puede editar/renombrar
  warehouses?: Warehouse[]; // almacenes/negocios (plan Pro)
  notifications?: boolean; // activar/desactivar avisos (por defecto activadas)
};

// ---- Cuadre / cierre de turno ----
export type ShiftStatus = "abierto" | "cerrado";

// Conteo físico de un producto al cerrar el turno
export type ShiftCount = {
  productId: string;
  name: string;
  expected: number; // lo que debería haber según el sistema
  counted: number; // lo que contó físicamente la persona
  diff: number; // counted - expected (negativo = faltante)
};

// Resumen de un producto vendido durante el turno
export type ShiftSoldItem = {
  productId: string;
  name: string;
  qty: number;
  amount: number;
};

export type Shift = {
  id: string;
  status: ShiftStatus;
  sellerId: string;
  sellerName: string;
  openedAt: string; // ISO
  closedAt: string | null;
  openingCash: number; // fondo de caja inicial
  // Calculado al cerrar:
  cashSalesExpected: number; // ventas en efectivo del turno
  transferSales: number; // ventas por transferencia/MLC (referencia)
  expectedCash: number; // openingCash + cashSalesExpected
  countedCash: number; // efectivo contado físicamente
  cashDiff: number; // countedCash - expectedCash
  salesCount: number;
  productCounts: ShiftCount[];
  soldItems: ShiftSoldItem[]; // productos vendidos en el turno
  note: string;
};

export type AppData = {
  business: Business;
  categories: Category[];
  products: Product[];
  supplies: Supply[];
  contacts: Contact[];
  sales: Sale[];
  purchases: Purchase[];
  employees: Employee[];
  payrolls: Payroll[];
  expenses: Expense[];
  shifts: Shift[];
};

export type ModuleKey =
  | "dashboard"
  | "ventas"
  | "productos"
  | "insumos"
  | "elaborados"
  | "compras"
  | "contactos"
  | "empleados"
  | "contabilidad"
  | "reportes"
  | "cuadre"
  | "cambio"
  | "calculadora"
  | "almacenes"
  | "usuarios"
  | "suscripcion"
  | "ajustes";
