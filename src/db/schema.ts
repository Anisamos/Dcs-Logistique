import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// ============ USERS / ADMINS ============
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("admin"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ============ SPACES (Espaces) ============
export const spaces = sqliteTable("spaces", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // "artistic_studio", "eco_lab", "maison_hote"
  status: text("status").notNull().default("active"), // "active", "renovation", "inactive"
  address: text("address"),
  surface: real("surface"), // m²
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ============ EQUIPMENT (Equipements) ============
export const equipment = sqliteTable("equipment", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(), // "sound", "light", "furniture", "it", "cleaning", "other"
  spaceId: integer("space_id").references(() => spaces.id),
  quantity: integer("quantity").notNull().default(1),
  condition: text("condition").notNull().default("good"), // "excellent", "good", "fair", "poor", "broken"
  purchaseDate: integer("purchase_date", { mode: "timestamp" }),
  purchasePrice: real("purchase_price"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ============ STOCK (Stock / Inventaire) ============
export const stockItems = sqliteTable("stock_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(), // "office_supply", "cleaning", "material", "consumable", "other"
  unit: text("unit").notNull().default("piece"), // "piece", "kg", "liter", "box", "pack"
  quantity: integer("quantity").notNull().default(0),
  minQuantity: integer("min_quantity").notNull().default(0), // alert threshold
  unitPrice: real("unit_price"),
  spaceId: integer("space_id").references(() => spaces.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ============ PROJECTS ============
export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("planning"), // "planning", "active", "completed", "cancelled"
  startDate: integer("start_date", { mode: "timestamp" }),
  endDate: integer("end_date", { mode: "timestamp" }),
  budget: real("budget"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ============ ACTIVITIES ============
export const activities = sqliteTable("activities", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // "workshop", "performance", "meeting", "event", "training", "other"
  projectId: integer("project_id").references(() => projects.id),
  spaceId: integer("space_id").references(() => spaces.id),
  status: text("status").notNull().default("planned"), // "planned", "in_progress", "completed", "cancelled"
  date: integer("date", { mode: "timestamp" }),
  budget: real("budget"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ============ PURCHASES / INVOICES (Achats / Factures) ============
export const purchases = sqliteTable("purchases", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  supplier: text("supplier"),
  category: text("category").notNull(), // "equipment", "material", "office_supply", "cleaning", "maintenance", "activity_supply", "other"
  amount: real("amount").notNull(),
  invoiceNumber: text("invoice_number"),
  invoiceDate: integer("invoice_date", { mode: "timestamp" }).notNull(),
  paymentStatus: text("payment_status").notNull().default("pending"), // "pending", "paid", "cancelled"
  spaceId: integer("space_id").references(() => spaces.id),
  projectId: integer("project_id").references(() => projects.id),
  activityId: integer("activity_id").references(() => activities.id),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ============ STOCK MOVEMENTS (Mouvements de stock) ============
export const stockMovements = sqliteTable("stock_movements", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  stockItemId: integer("stock_item_id").notNull().references(() => stockItems.id),
  type: text("type").notNull(), // "in", "out"
  quantity: integer("quantity").notNull(),
  reason: text("reason"), // "purchase", "usage", "transfer", "adjustment", "loss"
  reference: text("reference"), // purchase ID or activity reference
  notes: text("notes"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ============ CLEANLINESS CHECKS (Controles de propreté) ============
export const cleanlinessChecks = sqliteTable("cleanliness_checks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  spaceId: integer("space_id").notNull().references(() => spaces.id),
  status: text("status").notNull(), // "clean", "needs_attention", "dirty"
  notes: text("details"),
  checkedBy: integer("checked_by").references(() => users.id),
  checkedAt: integer("checked_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});
