import zones from "@/pages/admin/zones";
import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  decimal,
  json,
  varchar,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export enum UserRole {
  CITIZEN = "CITIZEN",
  FISCAL = "FISCAL",
  MANAGER = "MANAGER",
  ADMIN = "ADMIN",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export enum PaymentMethod {
  CREDIT_CARD = "CREDIT_CARD",
  DEBIT_CARD = "DEBIT_CARD",
  PIX = "PIX",
}

export enum VerificationResult {
  VALID = "VALID",
  EXPIRED = "EXPIRED",
  NOT_FOUND = "NOT_FOUND",
}

export enum InfringementType {
  NO_PERMIT = "NO_PERMIT",
  EXPIRED_PERMIT = "EXPIRED_PERMIT",
  INVALID_ZONE = "INVALID_ZONE",
}

export enum InfringementStatus {
  REGISTERED = "REGISTERED",
  NOTIFIED = "NOTIFIED",
  CONTESTED = "CONTESTED",
  CONFIRMED = "CONFIRMED",
  PAID = "PAID",
  CANCELLED = "CANCELLED",
}

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  cpf: text("cpf").unique(),
  phone: text("phone"),
  password: text("password").notNull(),
  role: text("role", { enum: Object.values(UserRole) })
    .default("CITIZEN")
    .notNull(),
  fiscalCode: text("fiscal_code"),
  managerDept: text("manager_dept"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Vehicles table
export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  licensePlate: text("license_plate").notNull().unique(),
  model: text("model").notNull(),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Zones table
// export const zones = pgTable("zones", {
//   id: serial("id").primaryKey(),
//   name: text("name").notNull(),
//   description: text("description"),
//   active: boolean("active").default(true).notNull(),
//   createdAt: timestamp("created_at").defaultNow().notNull(),
//   updatedAt: timestamp("updated_at").defaultNow().notNull()
// });

// Price configuration table
export const priceConfigs = pgTable("price_configs", {
  id: serial("id").primaryKey(),
  validFrom: timestamp("valid_from").notNull(),
  validTo: timestamp("valid_to"),
  hour1Price: decimal("hour1_price", { precision: 10, scale: 2 }).notNull(),
  hour2Price: decimal("hour2_price", { precision: 10, scale: 2 }).notNull(),
  hour3Price: decimal("hour3_price", { precision: 10, scale: 2 }).notNull(),
  hour4Price: decimal("hour4_price", { precision: 10, scale: 2 }).notNull(),
  hour5Price: decimal("hour5_price", { precision: 10, scale: 2 }).notNull(),
  hour6Price: decimal("hour6_price", { precision: 10, scale: 2 }).notNull(),
  hour12Price: decimal("hour12_price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Parking permits table
export const parkingPermits = pgTable("parking_permits", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id")
    .references(() => vehicles.id)
    .notNull(),
  userId: integer("user_id").references(() => users.id),
  durationHours: integer("duration_hours").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  priceId: integer("price_id")
    .references(() => priceConfigs.id)
    .notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentStatus: text("payment_status", { enum: Object.values(PaymentStatus) })
    .default("PENDING")
    .notNull(),
  paymentMethod: text("payment_method", { enum: Object.values(PaymentMethod) }),
  paymentId: text("payment_id"),
  transactionCode: text("transaction_code").unique(),
  notificationSent: boolean("notification_sent").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Fiscal actions table
export const fiscalActions = pgTable("fiscal_actions", {
  id: serial("id").primaryKey(),
  fiscalId: integer("fiscal_id")
    .references(() => users.id)
    .notNull(),
  actionType: text("action_type").notNull(),
  licensePlate: text("license_plate"),
  latitude: decimal("latitude", { precision: 10, scale: 6 }),
  longitude: decimal("longitude", { precision: 10, scale: 6 }),
  actionTime: timestamp("action_time").defaultNow().notNull(),
});

// Verifications table
export const verifications = pgTable("verifications", {
  id: serial("id").primaryKey(),
  fiscalActionId: integer("fiscal_action_id")
    .references(() => fiscalActions.id)
    .notNull(),
  permitId: integer("permit_id")
    .references(() => parkingPermits.id)
    .notNull(),
  result: text("result", { enum: Object.values(VerificationResult) }).notNull(),
  notes: text("notes"),
});

// Infringements table
export const infringements = pgTable("infringements", {
  id: serial("id").primaryKey(),
  fiscalActionId: integer("fiscal_action_id")
    .references(() => fiscalActions.id)
    .notNull(),
  vehicleId: integer("vehicle_id")
    .references(() => vehicles.id)
    .notNull(),
  infringementType: text("infringement_type", {
    enum: Object.values(InfringementType),
  }).notNull(),
  evidencePhotos: json("evidence_photos").$type<string[]>(),
  notes: text("notes"),
  status: text("status", { enum: Object.values(InfringementStatus) })
    .default("REGISTERED")
    .notNull(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPriceConfigSchema = createInsertSchema(priceConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertParkingPermitSchema = createInsertSchema(
  parkingPermits
).omit({ id: true, createdAt: true, updatedAt: true });

export const insertFiscalActionSchema = createInsertSchema(fiscalActions).omit({
  id: true,
  actionTime: true,
});

export const insertVerificationSchema = createInsertSchema(verifications).omit({
  id: true,
});

export const insertInfringementSchema = createInsertSchema(infringements).omit({
  id: true,
});
// Registration and login schemas
export const registerSchema = z
  .object({
    name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    email: z.string().email("E-mail inválido"),
    cpf: z.string().optional(),
    phone: z.string().optional(),
    password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export const quickBuySchema = z.object({
  licensePlate: z
    .string()
    .min(7, "Placa deve ter no mínimo 7 caracteres")
    .max(8, "Placa deve ter no máximo 8 caracteres"),
  model: z.string().min(2, "Modelo deve ter pelo menos 2 caracteres"),
  durationHours: z.number().min(1).max(12),
  paymentMethod: z.enum([
    PaymentMethod.CREDIT_CARD,
    PaymentMethod.DEBIT_CARD,
    PaymentMethod.PIX,
  ]),
});

export const checkPermitSchema = z.object({
  licensePlate: z
    .string()
    .min(7, "Placa deve ter no mínimo 7 caracteres")
    .max(8, "Placa deve ter no máximo 8 caracteres"),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = typeof vehicles.$inferInsert;

export type Zone = typeof zones.$inferSelect;
export type InsertZone = typeof zones.$inferInsert;

export type PriceConfig = typeof priceConfigs.$inferSelect;
export type InsertPriceConfig = typeof priceConfigs.$inferInsert;

export type ParkingPermit = typeof parkingPermits.$inferSelect;
export type InsertParkingPermit = typeof parkingPermits.$inferInsert;

export type FiscalAction = typeof fiscalActions.$inferSelect;
export type InsertFiscalAction = typeof fiscalActions.$inferInsert;

export type Verification = typeof verifications.$inferSelect;
export type InsertVerification = typeof verifications.$inferInsert;

export type Infringement = typeof infringements.$inferSelect;
export type InsertInfringement = typeof infringements.$inferInsert;

export type RegisterData = z.infer<typeof registerSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type QuickBuyData = z.infer<typeof quickBuySchema>;
export type CheckPermitData = z.infer<typeof checkPermitSchema>;
