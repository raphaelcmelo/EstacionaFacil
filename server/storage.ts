import { 
  User, InsertUser, 
  Vehicle, InsertVehicle, 
  Zone, InsertZone, 
  PriceConfig, InsertPriceConfig, 
  ParkingPermit, InsertParkingPermit, 
  FiscalAction, InsertFiscalAction,
  Verification, InsertVerification,
  Infringement, InsertInfringement,
  UserRole, PaymentStatus, PaymentMethod
} from "@shared/schema";
import { generateTransactionCode } from "./utils";
import bcrypt from "bcryptjs";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined>;
  listUsers(): Promise<User[]>;
  listUsersByRole(role: UserRole): Promise<User[]>;

  // Vehicle operations
  getVehicle(id: number): Promise<Vehicle | undefined>;
  getVehicleByLicensePlate(licensePlate: string): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: number, vehicleData: Partial<InsertVehicle>): Promise<Vehicle | undefined>;
  deleteVehicle(id: number): Promise<boolean>;
  listVehiclesByUserId(userId: number): Promise<Vehicle[]>;

  // Zone operations
  getZone(id: number): Promise<Zone | undefined>;
  createZone(zone: InsertZone): Promise<Zone>;
  updateZone(id: number, zoneData: Partial<InsertZone>): Promise<Zone | undefined>;
  listZones(): Promise<Zone[]>;
  listActiveZones(): Promise<Zone[]>;

  // Price config operations
  getPriceConfig(id: number): Promise<PriceConfig | undefined>;
  createPriceConfig(priceConfig: InsertPriceConfig): Promise<PriceConfig>;
  updatePriceConfig(id: number, priceData: Partial<InsertPriceConfig>): Promise<PriceConfig | undefined>;
  listPriceConfigsByZone(zoneId: number): Promise<PriceConfig[]>;
  getCurrentPriceConfig(zoneId: number): Promise<PriceConfig | undefined>;

  // Parking permit operations
  getParkingPermit(id: number): Promise<ParkingPermit | undefined>;
  getActiveParkingPermitByLicensePlate(licensePlate: string): Promise<(ParkingPermit & { vehicle: Vehicle, zone: Zone }) | undefined>;
  createParkingPermit(permit: InsertParkingPermit): Promise<ParkingPermit>;
  updateParkingPermit(id: number, permitData: Partial<InsertParkingPermit>): Promise<ParkingPermit | undefined>;
  listParkingPermitsByUserId(userId: number): Promise<ParkingPermit[]>;
  listActiveParkingPermitsByUserId(userId: number): Promise<(ParkingPermit & { vehicle: Vehicle, zone: Zone })[]>;
  listParkingPermitHistory(userId: number, limit: number, offset: number): Promise<(ParkingPermit & { vehicle: Vehicle, zone: Zone })[]>;
  getParkingPermitByTransactionCode(code: string): Promise<ParkingPermit | undefined>;

  // Fiscal operations
  createFiscalAction(action: InsertFiscalAction): Promise<FiscalAction>;
  createVerification(verification: InsertVerification): Promise<Verification>;
  createInfringement(infringement: InsertInfringement): Promise<Infringement>;
  listFiscalActionsByFiscalId(fiscalId: number, limit: number): Promise<FiscalAction[]>;
  listVerificationsByFiscalId(fiscalId: number, limit: number): Promise<Verification[]>;
  
  // Stats and dashboard
  getPermitStats(): Promise<{
    todayCount: number;
    todayRevenue: number;
    yesterdayCount: number;
    yesterdayRevenue: number;
  }>;
  getZoneOccupancyStats(): Promise<{ zoneId: number; zoneName: string; occupancyRate: number }[]>;
  getFiscalPerformanceStats(): Promise<{ fiscalId: number; fiscalName: string; verifications: number; performance: number }[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private vehicles: Map<number, Vehicle>;
  private zones: Map<number, Zone>;
  private priceConfigs: Map<number, PriceConfig>;
  private parkingPermits: Map<number, ParkingPermit>;
  private fiscalActions: Map<number, FiscalAction>;
  private verifications: Map<number, Verification>;
  private infringements: Map<number, Infringement>;
  
  private currentIds: {
    users: number;
    vehicles: number;
    zones: number;
    priceConfigs: number;
    parkingPermits: number;
    fiscalActions: number;
    verifications: number;
    infringements: number;
  };

  constructor() {
    this.users = new Map();
    this.vehicles = new Map();
    this.zones = new Map();
    this.priceConfigs = new Map();
    this.parkingPermits = new Map();
    this.fiscalActions = new Map();
    this.verifications = new Map();
    this.infringements = new Map();
    
    this.currentIds = {
      users: 1,
      vehicles: 1,
      zones: 1,
      priceConfigs: 1,
      parkingPermits: 1,
      fiscalActions: 1,
      verifications: 1,
      infringements: 1,
    };
    
    // Initialize with some data
    this.initializeData();
  }

  // Initialize demo data
  private async initializeData() {
    // Create default admin user
    const adminPassword = await bcrypt.hash("admin123", 10);
    this.createUser({
      name: "Administrador",
      email: "admin@estacionafacil.com",
      password: adminPassword,
      role: UserRole.ADMIN,
      active: true
    });
    
    // Create a fiscal user
    const fiscalPassword = await bcrypt.hash("fiscal123", 10);
    this.createUser({
      name: "Carlos Almeida",
      email: "fiscal@estacionafacil.com",
      password: fiscalPassword,
      fiscalCode: "F-12345",
      role: UserRole.FISCAL,
      active: true
    });
    
    // Create a manager user
    const managerPassword = await bcrypt.hash("manager123", 10);
    this.createUser({
      name: "Ana Gerente",
      email: "gerente@estacionafacil.com",
      password: managerPassword,
      managerDept: "Estacionamento",
      role: UserRole.MANAGER,
      active: true
    });
    
    // Create a regular user
    const citizenPassword = await bcrypt.hash("user123", 10);
    const user = this.createUser({
      name: "João Silva",
      email: "joao@example.com",
      cpf: "123.456.789-00",
      phone: "(27) 99999-9999",
      password: citizenPassword,
      role: UserRole.CITIZEN,
      active: true
    });
    
    // Create zones
    const centro = this.createZone({
      name: "Centro",
      description: "Região central da cidade",
      active: true
    });
    
    const orla = this.createZone({
      name: "Orla",
      description: "Região da orla marítima",
      active: true
    });
    
    const comercial = this.createZone({
      name: "Comercial",
      description: "Região comercial da cidade",
      active: true
    });
    
    // Create price configurations
    const now = new Date();
    const centroPriceConfig = this.createPriceConfig({
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
    
    const orlaPriceConfig = this.createPriceConfig({
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
    
    const comercialPriceConfig = this.createPriceConfig({
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
    const vehicle1 = this.createVehicle({
      licensePlate: "ABC1234",
      model: "Fiat Palio",
      userId: user.id
    });
    
    const vehicle2 = this.createVehicle({
      licensePlate: "XYZ5678",
      model: "Honda Civic",
      userId: user.id
    });
    
    // Create parking permits
    const startTime1 = new Date();
    const endTime1 = new Date(startTime1.getTime() + 2 * 60 * 60 * 1000); // +2 hours
    
    this.createParkingPermit({
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
      paymentId: "pay_123456",
      transactionCode: generateTransactionCode(),
      notificationSent: false
    });
    
    // Create past permits for history
    const pastDate1 = new Date();
    pastDate1.setDate(pastDate1.getDate() - 1);
    const pastEndDate1 = new Date(pastDate1.getTime() + 1 * 60 * 60 * 1000);
    
    this.createParkingPermit({
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
      paymentId: "pay_123457",
      transactionCode: generateTransactionCode(),
      notificationSent: true
    });
    
    const pastDate2 = new Date();
    pastDate2.setDate(pastDate2.getDate() - 3);
    const pastEndDate2 = new Date(pastDate2.getTime() + 3 * 60 * 60 * 1000);
    
    this.createParkingPermit({
      vehicleId: vehicle2.id,
      userId: user.id,
      durationHours: 3,
      startTime: pastDate2,
      endTime: pastEndDate2,
      zoneId: orla.id,
      priceId: orlaPriceConfig.id,
      amount: "10.00",
      paymentStatus: PaymentStatus.COMPLETED,
      paymentMethod: PaymentMethod.PIX,
      paymentId: "pay_123458",
      transactionCode: generateTransactionCode(),
      notificationSent: true
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.currentIds.users++;
    const now = new Date();
    const user: User = {
      ...userData,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      ...userData,
      id,
      updatedAt: new Date()
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async listUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async listUsersByRole(role: UserRole): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === role);
  }

  // Vehicle operations
  async getVehicle(id: number): Promise<Vehicle | undefined> {
    return this.vehicles.get(id);
  }

  async getVehicleByLicensePlate(licensePlate: string): Promise<Vehicle | undefined> {
    return Array.from(this.vehicles.values()).find(
      vehicle => vehicle.licensePlate.toLowerCase() === licensePlate.toLowerCase()
    );
  }

  async createVehicle(vehicleData: InsertVehicle): Promise<Vehicle> {
    const id = this.currentIds.vehicles++;
    const now = new Date();
    const vehicle: Vehicle = {
      ...vehicleData,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.vehicles.set(id, vehicle);
    return vehicle;
  }

  async updateVehicle(id: number, vehicleData: Partial<InsertVehicle>): Promise<Vehicle | undefined> {
    const vehicle = this.vehicles.get(id);
    if (!vehicle) return undefined;
    
    const updatedVehicle: Vehicle = {
      ...vehicle,
      ...vehicleData,
      id,
      updatedAt: new Date()
    };
    this.vehicles.set(id, updatedVehicle);
    return updatedVehicle;
  }

  async deleteVehicle(id: number): Promise<boolean> {
    return this.vehicles.delete(id);
  }

  async listVehiclesByUserId(userId: number): Promise<Vehicle[]> {
    return Array.from(this.vehicles.values()).filter(vehicle => vehicle.userId === userId);
  }

  // Zone operations
  async getZone(id: number): Promise<Zone | undefined> {
    return this.zones.get(id);
  }

  async createZone(zoneData: InsertZone): Promise<Zone> {
    const id = this.currentIds.zones++;
    const now = new Date();
    const zone: Zone = {
      ...zoneData,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.zones.set(id, zone);
    return zone;
  }

  async updateZone(id: number, zoneData: Partial<InsertZone>): Promise<Zone | undefined> {
    const zone = this.zones.get(id);
    if (!zone) return undefined;
    
    const updatedZone: Zone = {
      ...zone,
      ...zoneData,
      id,
      updatedAt: new Date()
    };
    this.zones.set(id, updatedZone);
    return updatedZone;
  }

  async listZones(): Promise<Zone[]> {
    return Array.from(this.zones.values());
  }

  async listActiveZones(): Promise<Zone[]> {
    return Array.from(this.zones.values()).filter(zone => zone.active);
  }

  // Price config operations
  async getPriceConfig(id: number): Promise<PriceConfig | undefined> {
    return this.priceConfigs.get(id);
  }

  async createPriceConfig(priceConfigData: InsertPriceConfig): Promise<PriceConfig> {
    const id = this.currentIds.priceConfigs++;
    const now = new Date();
    const priceConfig: PriceConfig = {
      ...priceConfigData,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.priceConfigs.set(id, priceConfig);
    return priceConfig;
  }

  async updatePriceConfig(id: number, priceData: Partial<InsertPriceConfig>): Promise<PriceConfig | undefined> {
    const priceConfig = this.priceConfigs.get(id);
    if (!priceConfig) return undefined;
    
    const updatedPriceConfig: PriceConfig = {
      ...priceConfig,
      ...priceData,
      id,
      updatedAt: new Date()
    };
    this.priceConfigs.set(id, updatedPriceConfig);
    return updatedPriceConfig;
  }

  async listPriceConfigsByZone(zoneId: number): Promise<PriceConfig[]> {
    return Array.from(this.priceConfigs.values()).filter(config => config.zoneId === zoneId);
  }

  async getCurrentPriceConfig(zoneId: number): Promise<PriceConfig | undefined> {
    const now = new Date();
    
    return Array.from(this.priceConfigs.values()).find(config => 
      config.zoneId === zoneId && 
      new Date(config.validFrom) <= now && 
      (!config.validTo || new Date(config.validTo) >= now)
    );
  }

  // Parking permit operations
  async getParkingPermit(id: number): Promise<ParkingPermit | undefined> {
    return this.parkingPermits.get(id);
  }

  async getActiveParkingPermitByLicensePlate(licensePlate: string): Promise<(ParkingPermit & { vehicle: Vehicle, zone: Zone }) | undefined> {
    const vehicle = await this.getVehicleByLicensePlate(licensePlate);
    if (!vehicle) return undefined;
    
    const now = new Date();
    const activePermit = Array.from(this.parkingPermits.values()).find(permit => 
      permit.vehicleId === vehicle.id && 
      new Date(permit.startTime) <= now && 
      new Date(permit.endTime) >= now &&
      permit.paymentStatus === PaymentStatus.COMPLETED
    );
    
    if (!activePermit) return undefined;
    
    const zone = await this.getZone(activePermit.zoneId);
    if (!zone) return undefined;
    
    return {
      ...activePermit,
      vehicle,
      zone
    };
  }

  async createParkingPermit(permitData: InsertParkingPermit): Promise<ParkingPermit> {
    const id = this.currentIds.parkingPermits++;
    const now = new Date();
    const permit: ParkingPermit = {
      ...permitData,
      id,
      transactionCode: permitData.transactionCode || generateTransactionCode(),
      createdAt: now,
      updatedAt: now
    };
    this.parkingPermits.set(id, permit);
    return permit;
  }

  async updateParkingPermit(id: number, permitData: Partial<InsertParkingPermit>): Promise<ParkingPermit | undefined> {
    const permit = this.parkingPermits.get(id);
    if (!permit) return undefined;
    
    const updatedPermit: ParkingPermit = {
      ...permit,
      ...permitData,
      id,
      updatedAt: new Date()
    };
    this.parkingPermits.set(id, updatedPermit);
    return updatedPermit;
  }

  async listParkingPermitsByUserId(userId: number): Promise<ParkingPermit[]> {
    return Array.from(this.parkingPermits.values()).filter(permit => permit.userId === userId);
  }

  async listActiveParkingPermitsByUserId(userId: number): Promise<(ParkingPermit & { vehicle: Vehicle, zone: Zone })[]> {
    const now = new Date();
    const activePermits = Array.from(this.parkingPermits.values()).filter(permit => 
      permit.userId === userId && 
      new Date(permit.startTime) <= now && 
      new Date(permit.endTime) >= now &&
      permit.paymentStatus === PaymentStatus.COMPLETED
    );
    
    const result: (ParkingPermit & { vehicle: Vehicle, zone: Zone })[] = [];
    
    for (const permit of activePermits) {
      const vehicle = await this.getVehicle(permit.vehicleId);
      const zone = await this.getZone(permit.zoneId);
      if (vehicle && zone) {
        result.push({
          ...permit,
          vehicle,
          zone
        });
      }
    }
    
    return result;
  }

  async listParkingPermitHistory(userId: number, limit: number, offset: number): Promise<(ParkingPermit & { vehicle: Vehicle, zone: Zone })[]> {
    const permits = Array.from(this.parkingPermits.values())
      .filter(permit => permit.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(offset, offset + limit);
    
    const result: (ParkingPermit & { vehicle: Vehicle, zone: Zone })[] = [];
    
    for (const permit of permits) {
      const vehicle = await this.getVehicle(permit.vehicleId);
      const zone = await this.getZone(permit.zoneId);
      if (vehicle && zone) {
        result.push({
          ...permit,
          vehicle,
          zone
        });
      }
    }
    
    return result;
  }

  async getParkingPermitByTransactionCode(code: string): Promise<ParkingPermit | undefined> {
    return Array.from(this.parkingPermits.values()).find(permit => permit.transactionCode === code);
  }

  // Fiscal operations
  async createFiscalAction(actionData: InsertFiscalAction): Promise<FiscalAction> {
    const id = this.currentIds.fiscalActions++;
    const action: FiscalAction = {
      ...actionData,
      id,
      actionTime: new Date()
    };
    this.fiscalActions.set(id, action);
    return action;
  }

  async createVerification(verificationData: InsertVerification): Promise<Verification> {
    const id = this.currentIds.verifications++;
    const verification: Verification = {
      ...verificationData,
      id
    };
    this.verifications.set(id, verification);
    return verification;
  }

  async createInfringement(infringementData: InsertInfringement): Promise<Infringement> {
    const id = this.currentIds.infringements++;
    const infringement: Infringement = {
      ...infringementData,
      id
    };
    this.infringements.set(id, infringement);
    return infringement;
  }

  async listFiscalActionsByFiscalId(fiscalId: number, limit: number): Promise<FiscalAction[]> {
    return Array.from(this.fiscalActions.values())
      .filter(action => action.fiscalId === fiscalId)
      .sort((a, b) => new Date(b.actionTime).getTime() - new Date(a.actionTime).getTime())
      .slice(0, limit);
  }

  async listVerificationsByFiscalId(fiscalId: number, limit: number): Promise<Verification[]> {
    const fiscalActions = await this.listFiscalActionsByFiscalId(fiscalId, Number.MAX_SAFE_INTEGER);
    const actionIds = fiscalActions.map(action => action.id);
    
    return Array.from(this.verifications.values())
      .filter(verification => actionIds.includes(verification.fiscalActionId))
      .slice(0, limit);
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
    
    const permits = Array.from(this.parkingPermits.values());
    
    const todayPermits = permits.filter(permit => 
      new Date(permit.createdAt) >= today && 
      new Date(permit.createdAt) < tomorrow &&
      permit.paymentStatus === PaymentStatus.COMPLETED
    );
    
    const yesterdayPermits = permits.filter(permit => 
      new Date(permit.createdAt) >= yesterday && 
      new Date(permit.createdAt) < today &&
      permit.paymentStatus === PaymentStatus.COMPLETED
    );
    
    const todayRevenue = todayPermits.reduce((sum, permit) => sum + parseFloat(permit.amount.toString()), 0);
    const yesterdayRevenue = yesterdayPermits.reduce((sum, permit) => sum + parseFloat(permit.amount.toString()), 0);
    
    return {
      todayCount: todayPermits.length,
      todayRevenue,
      yesterdayCount: yesterdayPermits.length,
      yesterdayRevenue
    };
  }

  async getZoneOccupancyStats(): Promise<{ zoneId: number; zoneName: string; occupancyRate: number }[]> {
    const now = new Date();
    const activeZones = await this.listActiveZones();
    const result: { zoneId: number; zoneName: string; occupancyRate: number }[] = [];
    
    for (const zone of activeZones) {
      const activePermits = Array.from(this.parkingPermits.values()).filter(permit => 
        permit.zoneId === zone.id && 
        new Date(permit.startTime) <= now && 
        new Date(permit.endTime) >= now &&
        permit.paymentStatus === PaymentStatus.COMPLETED
      );
      
      // Simulate occupancy rate - in a real system this would be based on
      // the actual capacity of the zone and the number of active permits
      let occupancyRate = 0;
      switch(zone.name) {
        case "Centro":
          occupancyRate = 78;
          break;
        case "Orla":
          occupancyRate = 92;
          break;
        case "Comercial":
          occupancyRate = 45;
          break;
        default:
          occupancyRate = Math.min(100, Math.floor(Math.random() * 100));
      }
      
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
      const actions = await this.listFiscalActionsByFiscalId(fiscal.id, Number.MAX_SAFE_INTEGER);
      const todayActions = actions.filter(action => {
        const actionDate = new Date(action.actionTime);
        const today = new Date();
        return actionDate.getDate() === today.getDate() &&
               actionDate.getMonth() === today.getMonth() &&
               actionDate.getFullYear() === today.getFullYear();
      });
      
      // Mock performance data
      let performance = 0;
      let verifications = 0;
      
      if (fiscal.name === "Carlos Almeida") {
        verifications = 12;
        performance = 85;
      } else if (fiscal.name.includes("Ana")) {
        verifications = 8;
        performance = 67;
      } else if (fiscal.name.includes("Pedro")) {
        verifications = 15;
        performance = 92;
      } else {
        verifications = todayActions.length;
        performance = Math.min(100, Math.floor(Math.random() * 100));
      }
      
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

export const storage = new MemStorage();
