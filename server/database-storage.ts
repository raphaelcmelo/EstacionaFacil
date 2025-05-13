import { db } from './db';
import { eq, and, or, desc, gte, lt, isNull } from 'drizzle-orm';
import { 
  users, vehicles, zones, priceConfigs, parkingPermits, 
  fiscalActions, verifications, infringements,
  User, Vehicle, Zone, PriceConfig, ParkingPermit, 
  FiscalAction, Verification, Infringement,
  InsertUser, InsertVehicle, InsertZone, InsertPriceConfig,
  InsertParkingPermit, InsertFiscalAction, InsertVerification, InsertInfringement,
  UserRole, PaymentMethod, PaymentStatus, InfringementStatus
} from '@shared/schema';
import { generateTransactionCode } from './utils';
import connectPg from "connect-pg-simple";
import session from "express-session";
import { pool } from './db';
import { sql } from 'drizzle-orm';
import { IStorage } from './storage';

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: any; // Workaround for type issue

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
    
    // Initialize database with seeds if needed
    this.initializeDatabase();
  }
  
  private async initializeDatabase() {
    try {
      // Check if we have any users already
      const userCount = await db.select({ count: sql<number>`count(*)` }).from(users);
      
      if (userCount[0].count === 0) {
        console.log("Initializing database with seed data...");
        await this.seedDatabase();
      }
    } catch (error) {
      console.error("Error checking or initializing database:", error);
    }
  }
  
  private async seedDatabase() {
    try {
      // Create users
      const admin = await this.createUser({
        name: "Administrador",
        email: "admin@estacionafacil.com",
        password: "$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9EB7G4qVqbCFdK", // admin123
        role: UserRole.ADMIN,
        active: true
      });
      
      const fiscal = await this.createUser({
        name: "Carlos Almeida",
        email: "fiscal@estacionafacil.com",
        password: "$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9EB7G4qVqbCFdK", // fiscal123
        fiscalCode: "F-12345",
        role: UserRole.FISCAL,
        active: true
      });
      
      const manager = await this.createUser({
        name: "Ana Gerente",
        email: "gerente@estacionafacil.com",
        password: "$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9EB7G4qVqbCFdK", // manager123
        managerDept: "Estacionamento",
        role: UserRole.MANAGER,
        active: true
      });
      
      const user = await this.createUser({
        name: "João Silva",
        email: "joao@example.com",
        cpf: "123.456.789-00",
        phone: "(27) 99999-9999",
        password: "$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9EB7G4qVqbCFdK", // user123
        role: UserRole.CITIZEN,
        active: true
      });
      
      // Create zones
      const centro = await this.createZone({
        name: "Centro",
        description: "Região central da cidade",
        active: true
      });
      
      const orla = await this.createZone({
        name: "Orla",
        description: "Região da orla marítima",
        active: true
      });
      
      const comercial = await this.createZone({
        name: "Comercial",
        description: "Região comercial da cidade",
        active: true
      });
      
      // Create price configurations
      const now = new Date();
      const centroPriceConfig = await this.createPriceConfig({
        zoneId: centro.id,
        validFrom: now,
        hour1Price: "3.00",
        hour2Price: "5.00",
        hour3Price: "7.00",
        hour4Price: "9.00",
        hour5Price: "11.00",
        hour6Price: "13.00",
        hour12Price: "20.00"
      });
      
      const orlaPriceConfig = await this.createPriceConfig({
        zoneId: orla.id,
        validFrom: now,
        hour1Price: "4.00",
        hour2Price: "7.00",
        hour3Price: "10.00",
        hour4Price: "12.00",
        hour5Price: "14.00",
        hour6Price: "16.00",
        hour12Price: "25.00"
      });
      
      const comercialPriceConfig = await this.createPriceConfig({
        zoneId: comercial.id,
        validFrom: now,
        hour1Price: "2.50",
        hour2Price: "4.50",
        hour3Price: "6.50",
        hour4Price: "8.50",
        hour5Price: "10.50",
        hour6Price: "12.50",
        hour12Price: "18.00"
      });
      
      // Create vehicles for the user
      const vehicle1 = await this.createVehicle({
        licensePlate: "ABC1234",
        model: "Fiat Palio",
        userId: user.id
      });
      
      const vehicle2 = await this.createVehicle({
        licensePlate: "XYZ5678",
        model: "Honda Civic",
        userId: user.id
      });
      
      // Create parking permits
      const startTime1 = new Date();
      const endTime1 = new Date(startTime1.getTime() + 2 * 60 * 60 * 1000); // +2 hours
      
      await this.createParkingPermit({
        vehicleId: vehicle1.id,
        userId: user.id,
        durationHours: 2,
        startTime: startTime1,
        endTime: endTime1,
        zoneId: centro.id,
        priceId: centroPriceConfig.id,
        amount: "5.00",
        paymentStatus: PaymentStatus.COMPLETED,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        transactionId: "pay_123456",
        transactionCode: generateTransactionCode(),
        notificationSent: false
      });
      
      // Create past permits for history
      const pastDate1 = new Date();
      pastDate1.setDate(pastDate1.getDate() - 1);
      const pastEndDate1 = new Date(pastDate1.getTime() + 1 * 60 * 60 * 1000);
      
      await this.createParkingPermit({
        vehicleId: vehicle1.id,
        userId: user.id,
        durationHours: 1,
        startTime: pastDate1,
        endTime: pastEndDate1,
        zoneId: centro.id,
        priceId: centroPriceConfig.id,
        amount: "3.00",
        paymentStatus: PaymentStatus.COMPLETED,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        transactionId: "pay_123457",
        transactionCode: generateTransactionCode(),
        notificationSent: true
      });
      
      const pastDate2 = new Date();
      pastDate2.setDate(pastDate2.getDate() - 3);
      const pastEndDate2 = new Date(pastDate2.getTime() + 3 * 60 * 60 * 1000);
      
      await this.createParkingPermit({
        vehicleId: vehicle2.id,
        userId: user.id,
        durationHours: 3,
        startTime: pastDate2,
        endTime: pastEndDate2,
        zoneId: orla.id,
        priceId: orlaPriceConfig.id,
        totalPrice: "10.00",
        paymentStatus: PaymentStatus.COMPLETED,
        paymentMethod: PaymentMethod.PIX,
        transactionId: "pay_123458",
        transactionCode: generateTransactionCode(),
        notificationSent: true
      });
      
      console.log("Database seeded successfully!");
    } catch (error) {
      console.error("Error seeding database:", error);
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async listUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async listUsersByRole(role: UserRole): Promise<User[]> {
    return db.select().from(users).where(eq(users.role, role));
  }

  // Vehicle operations
  async getVehicle(id: number): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return vehicle;
  }

  async getVehicleByLicensePlate(licensePlate: string): Promise<Vehicle | undefined> {
    const [vehicle] = await db
      .select()
      .from(vehicles)
      .where(eq(vehicles.licensePlate, licensePlate));
    return vehicle;
  }

  async createVehicle(vehicleData: InsertVehicle): Promise<Vehicle> {
    const [vehicle] = await db.insert(vehicles).values(vehicleData).returning();
    return vehicle;
  }

  async updateVehicle(id: number, vehicleData: Partial<InsertVehicle>): Promise<Vehicle | undefined> {
    const [updatedVehicle] = await db
      .update(vehicles)
      .set({ ...vehicleData, updatedAt: new Date() })
      .where(eq(vehicles.id, id))
      .returning();
    return updatedVehicle;
  }

  async deleteVehicle(id: number): Promise<boolean> {
    const result = await db.delete(vehicles).where(eq(vehicles.id, id)).returning();
    return result.length > 0;
  }

  async listVehiclesByUserId(userId: number): Promise<Vehicle[]> {
    return db.select().from(vehicles).where(eq(vehicles.userId, userId));
  }

  // Zone operations
  async getZone(id: number): Promise<Zone | undefined> {
    const [zone] = await db.select().from(zones).where(eq(zones.id, id));
    return zone;
  }

  async createZone(zoneData: InsertZone): Promise<Zone> {
    const [zone] = await db.insert(zones).values(zoneData).returning();
    return zone;
  }

  async updateZone(id: number, zoneData: Partial<InsertZone>): Promise<Zone | undefined> {
    const [updatedZone] = await db
      .update(zones)
      .set({ ...zoneData, updatedAt: new Date() })
      .where(eq(zones.id, id))
      .returning();
    return updatedZone;
  }

  async listZones(): Promise<Zone[]> {
    return db.select().from(zones);
  }

  async listActiveZones(): Promise<Zone[]> {
    return db.select().from(zones).where(eq(zones.active, true));
  }

  // Price config operations
  async getPriceConfig(id: number): Promise<PriceConfig | undefined> {
    const [priceConfig] = await db
      .select()
      .from(priceConfigs)
      .where(eq(priceConfigs.id, id));
    return priceConfig;
  }

  async createPriceConfig(priceConfigData: InsertPriceConfig): Promise<PriceConfig> {
    const [priceConfig] = await db
      .insert(priceConfigs)
      .values(priceConfigData)
      .returning();
    return priceConfig;
  }

  async updatePriceConfig(id: number, priceData: Partial<InsertPriceConfig>): Promise<PriceConfig | undefined> {
    const [updatedPriceConfig] = await db
      .update(priceConfigs)
      .set({ ...priceData, updatedAt: new Date() })
      .where(eq(priceConfigs.id, id))
      .returning();
    return updatedPriceConfig;
  }

  async listPriceConfigsByZone(zoneId: number): Promise<PriceConfig[]> {
    return db
      .select()
      .from(priceConfigs)
      .where(eq(priceConfigs.zoneId, zoneId))
      .orderBy(desc(priceConfigs.validFrom));
  }

  async getCurrentPriceConfig(zoneId: number): Promise<PriceConfig | undefined> {
    const now = new Date();
    const [currentConfig] = await db
      .select()
      .from(priceConfigs)
      .where(
        and(
          eq(priceConfigs.zoneId, zoneId),
          lt(priceConfigs.validFrom, now),
          or(isNull(priceConfigs.validTo), gte(priceConfigs.validTo, now))
        )
      )
      .orderBy(desc(priceConfigs.validFrom))
      .limit(1);
    
    return currentConfig;
  }

  // Parking permit operations
  async getParkingPermit(id: number): Promise<ParkingPermit | undefined> {
    const [permit] = await db
      .select()
      .from(parkingPermits)
      .where(eq(parkingPermits.id, id));
    return permit;
  }

  async getActiveParkingPermitByLicensePlate(licensePlate: string): Promise<(ParkingPermit & { vehicle: Vehicle, zone: Zone }) | undefined> {
    const now = new Date();
    
    const result = await db
      .select({
        permit: parkingPermits,
        vehicle: vehicles,
        zone: zones
      })
      .from(parkingPermits)
      .innerJoin(vehicles, eq(parkingPermits.vehicleId, vehicles.id))
      .innerJoin(zones, eq(parkingPermits.zoneId, zones.id))
      .where(
        and(
          eq(vehicles.licensePlate, licensePlate),
          gte(parkingPermits.endTime, now)
        )
      )
      .limit(1);
    
    if (result.length === 0) return undefined;
    
    const { permit, vehicle, zone } = result[0];
    return { ...permit, vehicle, zone };
  }

  async createParkingPermit(permitData: InsertParkingPermit): Promise<ParkingPermit> {
    // Generate transaction code if not provided
    const data = {
      ...permitData,
      transactionCode: permitData.transactionCode || generateTransactionCode()
    };
    
    const [permit] = await db
      .insert(parkingPermits)
      .values(data)
      .returning();
    
    return permit;
  }

  async updateParkingPermit(id: number, permitData: Partial<InsertParkingPermit>): Promise<ParkingPermit | undefined> {
    const [updatedPermit] = await db
      .update(parkingPermits)
      .set({ ...permitData, updatedAt: new Date() })
      .where(eq(parkingPermits.id, id))
      .returning();
    
    return updatedPermit;
  }

  async listParkingPermitsByUserId(userId: number): Promise<ParkingPermit[]> {
    return db
      .select()
      .from(parkingPermits)
      .where(eq(parkingPermits.userId, userId))
      .orderBy(desc(parkingPermits.createdAt));
  }

  async listActiveParkingPermitsByUserId(userId: number): Promise<(ParkingPermit & { vehicle: Vehicle, zone: Zone })[]> {
    const now = new Date();
    
    const result = await db
      .select({
        permit: parkingPermits,
        vehicle: vehicles,
        zone: zones
      })
      .from(parkingPermits)
      .innerJoin(vehicles, eq(parkingPermits.vehicleId, vehicles.id))
      .innerJoin(zones, eq(parkingPermits.zoneId, zones.id))
      .where(
        and(
          eq(parkingPermits.userId, userId),
          gte(parkingPermits.endTime, now)
        )
      )
      .orderBy(desc(parkingPermits.createdAt));
    
    return result.map(({ permit, vehicle, zone }) => ({
      ...permit,
      vehicle,
      zone
    }));
  }

  async listParkingPermitHistory(userId: number, limit: number, offset: number): Promise<(ParkingPermit & { vehicle: Vehicle, zone: Zone })[]> {
    const result = await db
      .select({
        permit: parkingPermits,
        vehicle: vehicles,
        zone: zones
      })
      .from(parkingPermits)
      .innerJoin(vehicles, eq(parkingPermits.vehicleId, vehicles.id))
      .innerJoin(zones, eq(parkingPermits.zoneId, zones.id))
      .where(eq(parkingPermits.userId, userId))
      .orderBy(desc(parkingPermits.createdAt))
      .limit(limit)
      .offset(offset);
    
    return result.map(({ permit, vehicle, zone }) => ({
      ...permit,
      vehicle,
      zone
    }));
  }

  async getParkingPermitByTransactionCode(code: string): Promise<ParkingPermit | undefined> {
    const [permit] = await db
      .select()
      .from(parkingPermits)
      .where(eq(parkingPermits.transactionCode, code));
    
    return permit;
  }

  // Fiscal operations
  async createFiscalAction(actionData: InsertFiscalAction): Promise<FiscalAction> {
    const [action] = await db
      .insert(fiscalActions)
      .values({
        ...actionData,
        actionTime: actionData.actionTime || new Date()
      })
      .returning();
    
    return action;
  }

  async createVerification(verificationData: InsertVerification): Promise<Verification> {
    const [verification] = await db
      .insert(verifications)
      .values(verificationData)
      .returning();
    
    return verification;
  }

  async createInfringement(infringementData: InsertInfringement): Promise<Infringement> {
    const [infringement] = await db
      .insert(infringements)
      .values({
        ...infringementData,
        status: infringementData.status || InfringementStatus.REGISTERED
      })
      .returning();
    
    return infringement;
  }

  async listFiscalActionsByFiscalId(fiscalId: number, limit: number): Promise<FiscalAction[]> {
    return db
      .select()
      .from(fiscalActions)
      .where(eq(fiscalActions.fiscalId, fiscalId))
      .orderBy(desc(fiscalActions.actionTime))
      .limit(limit);
  }

  async listVerificationsByFiscalId(fiscalId: number, limit: number): Promise<Verification[]> {
    const result = await db
      .select({
        verification: verifications,
        action: fiscalActions
      })
      .from(verifications)
      .innerJoin(fiscalActions, eq(verifications.fiscalActionId, fiscalActions.id))
      .where(eq(fiscalActions.fiscalId, fiscalId))
      .limit(limit);
    
    return result.map(r => r.verification);
  }

  // Stats and dashboard
  async getPermitStats(): Promise<{
    todayCount: number;
    todayRevenue: number;
    yesterdayCount: number;
    yesterdayRevenue: number;
  }> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Today's stats
    const todayStats = await db
      .select({
        count: sql<number>`count(*)`,
        revenue: sql<number>`sum(cast(${parkingPermits.totalPrice} as decimal))`
      })
      .from(parkingPermits)
      .where(
        and(
          gte(parkingPermits.createdAt, today),
          lt(parkingPermits.createdAt, tomorrow)
        )
      );
    
    // Yesterday's stats
    const yesterdayStats = await db
      .select({
        count: sql<number>`count(*)`,
        revenue: sql<number>`sum(cast(${parkingPermits.totalPrice} as decimal))`
      })
      .from(parkingPermits)
      .where(
        and(
          gte(parkingPermits.createdAt, yesterday),
          lt(parkingPermits.createdAt, today)
        )
      );
    
    return {
      todayCount: todayStats[0]?.count || 0,
      todayRevenue: todayStats[0]?.revenue || 0,
      yesterdayCount: yesterdayStats[0]?.count || 0,
      yesterdayRevenue: yesterdayStats[0]?.revenue || 0,
    };
  }

  async getZoneOccupancyStats(): Promise<{ zoneId: number; zoneName: string; occupancyRate: number }[]> {
    const now = new Date();
    const activeZones = await this.listActiveZones();
    const result: { zoneId: number; zoneName: string; occupancyRate: number }[] = [];
    
    for (const zone of activeZones) {
      // Count active permits for this zone
      const activePermitsCount = await db
        .select({
          count: sql<number>`count(*)`
        })
        .from(parkingPermits)
        .where(
          and(
            eq(parkingPermits.zoneId, zone.id),
            gte(parkingPermits.endTime, now)
          )
        );
      
      // This is dummy data for demo - in a real app would use capacity info from a zones_capacity table
      const zoneCapacity = zone.id * 25; // Dummy capacity based on id
      const count = activePermitsCount[0]?.count || 0;
      const occupancyRate = Math.min(Math.round((count / zoneCapacity) * 100), 100);
      
      result.push({
        zoneId: zone.id,
        zoneName: zone.name,
        occupancyRate
      });
    }
    
    return result;
  }

  async getFiscalPerformanceStats(): Promise<{ fiscalId: number; fiscalName: string; verifications: number; performance: number }[]> {
    const fiscals = await this.listUsersByRole(UserRole.FISCAL);
    const result: { fiscalId: number; fiscalName: string; verifications: number; performance: number }[] = [];
    
    for (const fiscal of fiscals) {
      // Count total actions
      const actionsCount = await db
        .select({
          count: sql<number>`count(*)`
        })
        .from(fiscalActions)
        .where(eq(fiscalActions.fiscalId, fiscal.id));
      
      // Count verifications
      const verificationsCount = await db
        .select({
          count: sql<number>`count(*)`
        })
        .from(verifications)
        .innerJoin(fiscalActions, eq(verifications.fiscalActionId, fiscalActions.id))
        .where(eq(fiscalActions.fiscalId, fiscal.id));
      
      const actions = actionsCount[0]?.count || 0;
      const verifications = verificationsCount[0]?.count || 0;
      
      // Performance calculation
      const performance = actions > 0 ? Math.min((verifications / actions) * 100, 100) : 0;
      
      result.push({
        fiscalId: fiscal.id,
        fiscalName: fiscal.name,
        verifications,
        performance
      });
    }
    
    return result;
  }
}