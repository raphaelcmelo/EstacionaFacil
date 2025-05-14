import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  loginSchema,
  registerSchema,
  insertVehicleSchema,
  quickBuySchema,
  checkPermitSchema,
  PaymentStatus,
  PaymentMethod,
  VerificationResult,
  InfringementType,
  InsertZone,
  UserRole,
  insertPriceConfigSchema,
} from "@shared/schema";
import { ZodError } from "zod";
import { formatErrors } from "./utils";
import { generateTransactionCode } from "./utils";
import bcrypt from "bcryptjs";
import session from "express-session";
import MemoryStore from "memorystore";
import { faker } from "@faker-js/faker";

export async function registerRoutes(app: Express): Promise<Server> {
  // Session setup with memory store
  const SessionStore = MemoryStore(session);

  app.use(
    session({
      secret: process.env.SESSION_SECRET || "parking-system-secret",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }, // 24 hours
      store: new SessionStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
    })
  );

  // Current user middleware
  app.use((req: any, res, next) => {
    req.user = req.session.user || null;
    next();
  });

  // Auth routes
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const data = registerSchema.parse(req.body);

      // Check if email already exists
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ message: "E-mail já está em uso" });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(data.password, 10);

      // Create user
      const user = await storage.createUser({
        name: data.name,
        email: data.email,
        cpf: data.cpf,
        phone: data.phone,
        password: passwordHash,
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      // Set session
      (req.session as any).user = userWithoutPassword;

      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof ZodError) {
        return res
          .status(400)
          .json({ message: "Dados inválidos", errors: formatErrors(error) });
      }
      return res.status(500).json({ message: "Erro ao registrar usuário" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const data = loginSchema.parse(req.body);

      // Find user
      const user = await storage.getUserByEmail(data.email);
      if (!user) {
        return res.status(401).json({ message: "E-mail ou senha inválidos" });
      }

      // Check if user is active
      if (!user.active) {
        return res.status(401).json({
          message: "Conta desativada. Entre em contato com o suporte.",
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(
        data.password,
        user.password
      );
      if (!isPasswordValid) {
        return res.status(401).json({ message: "E-mail ou senha inválidos" });
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      // Set session
      (req.session as any).user = userWithoutPassword;

      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof ZodError) {
        return res
          .status(400)
          .json({ message: "Dados inválidos", errors: formatErrors(error) });
      }
      return res.status(500).json({ message: "Erro ao fazer login" });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Erro ao fazer logout" });
      }
      res.status(200).json({ message: "Logout realizado com sucesso" });
    });
  });

  app.get("/api/auth/me", (req: any, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Não autenticado" });
    }
    return res.status(200).json(req.user);
  });

  // Vehicle routes
  app.get("/api/vehicles", async (req: any, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    const vehicles = await storage.listVehiclesByUserId(req.user.id);
    return res.status(200).json(vehicles);
  });

  app.post("/api/vehicles", async (req: any, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const data = insertVehicleSchema.parse(req.body);

      // Check if license plate already exists
      const existingVehicle = await storage.getVehicleByLicensePlate(
        data.licensePlate
      );
      if (existingVehicle) {
        return res.status(400).json({ message: "Placa já está cadastrada" });
      }

      // Create vehicle
      const vehicle = await storage.createVehicle({
        ...data,
        userId: req.user.id,
      });

      return res.status(201).json(vehicle);
    } catch (error) {
      if (error instanceof ZodError) {
        return res
          .status(400)
          .json({ message: "Dados inválidos", errors: formatErrors(error) });
      }
      return res.status(500).json({ message: "Erro ao criar veículo" });
    }
  });

  app.put("/api/vehicles/:id", async (req: any, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    const vehicleId = parseInt(req.params.id);
    if (isNaN(vehicleId)) {
      return res.status(400).json({ message: "ID de veículo inválido" });
    }

    // Check if vehicle exists and belongs to user
    const vehicle = await storage.getVehicle(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: "Veículo não encontrado" });
    }

    if (vehicle.userId !== req.user.id) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    try {
      const data = insertVehicleSchema.partial().parse(req.body);

      // If license plate is being updated, check if it already exists
      if (data.licensePlate && data.licensePlate !== vehicle.licensePlate) {
        const existingVehicle = await storage.getVehicleByLicensePlate(
          data.licensePlate
        );
        if (existingVehicle) {
          return res.status(400).json({ message: "Placa já está cadastrada" });
        }
      }

      // Update vehicle
      const updatedVehicle = await storage.updateVehicle(vehicleId, data);

      return res.status(200).json(updatedVehicle);
    } catch (error) {
      if (error instanceof ZodError) {
        return res
          .status(400)
          .json({ message: "Dados inválidos", errors: formatErrors(error) });
      }
      return res.status(500).json({ message: "Erro ao atualizar veículo" });
    }
  });

  app.delete("/api/vehicles/:id", async (req: any, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    const vehicleId = parseInt(req.params.id);
    if (isNaN(vehicleId)) {
      return res.status(400).json({ message: "ID de veículo inválido" });
    }

    // Check if vehicle exists and belongs to user
    const vehicle = await storage.getVehicle(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: "Veículo não encontrado" });
    }

    if (vehicle.userId !== req.user.id) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    // Delete vehicle
    const success = await storage.deleteVehicle(vehicleId);

    if (success) {
      return res.status(200).json({ message: "Veículo excluído com sucesso" });
    } else {
      return res.status(500).json({ message: "Erro ao excluir veículo" });
    }
  });

  // Zone routes
  app.get("/api/admin/zones", async (req: any, res: Response) => {
    if (
      !req.user ||
      (req.user.role !== "MANAGER" && req.user.role !== "ADMIN")
    ) {
      return res.status(403).json({ message: "Acesso negado" });
    }
    try {
      const allZones = await storage.listZones();
      return res.status(200).json(allZones);
    } catch (error) {
      console.error("Erro ao listar zonas [admin]:", error);
      return res.status(500).json({ message: "Erro ao listar zonas" });
    }
  });

  // POST /api/admin/zones - Criar uma nova zona
  app.post("/api/admin/zones", async (req: any, res: Response) => {
    if (
      !req.user ||
      (req.user.role !== UserRole.MANAGER && req.user.role !== UserRole.ADMIN)
    ) {
      return res.status(403).json({ message: "Acesso negado" });
    }
    try {
      // Idealmente, valide com um schema Zod aqui:
      // const data = zoneAdminSchema.parse(req.body);
      // Se não tiver o schema backend ainda, use uma validação mais simples ou confie nos tipos
      const data: InsertZone = req.body; // Cuidado: sem validação Zod aqui, o req.body deve bater com InsertZone

      // Validação manual mínima (exemplo, Zod é melhor)
      if (!data.name || typeof data.name !== "string" || data.name.length < 2) {
        return res
          .status(400)
          .json({ message: "Nome da zona é inválido ou muito curto." });
      }
      if (typeof data.active !== "boolean" && data.active !== undefined) {
        return res
          .status(400)
          .json({ message: "Status 'active' deve ser booleano." });
      }

      const newZone = await storage.createZone({
        name: data.name,
        description: data.description,
        active: data.active !== undefined ? data.active : true, // Default para true se não enviado
      });
      return res.status(201).json(newZone);
    } catch (error) {
      if (error instanceof ZodError) {
        // Se você usar Zod para parse
        return res
          .status(400)
          .json({ message: "Dados inválidos", errors: formatErrors(error) });
      }
      console.error("Erro ao criar zona [admin]:", error);
      return res.status(500).json({ message: "Erro ao criar zona" });
    }
  });

  // PUT /api/admin/zones/:id - Atualizar uma zona existente
  app.put("/api/admin/zones/:id", async (req: any, res: Response) => {
    if (
      !req.user ||
      (req.user.role !== "MANAGER" && req.user.role !== "ADMIN")
    ) {
      return res.status(403).json({ message: "Acesso negado" });
    }
    try {
      const zoneId = parseInt(req.params.id);
      if (isNaN(zoneId)) {
        return res.status(400).json({ message: "ID de zona inválido" });
      }

      // const data = zoneAdminSchema.partial().parse(req.body); // Com Zod
      const data: Partial<InsertZone> = req.body; // Sem Zod

      // Validação manual mínima (exemplo)
      if (
        data.name !== undefined &&
        (typeof data.name !== "string" || data.name.length < 2)
      ) {
        return res
          .status(400)
          .json({ message: "Nome da zona é inválido ou muito curto." });
      }
      if (data.active !== undefined && typeof data.active !== "boolean") {
        return res
          .status(400)
          .json({ message: "Status 'active' deve ser booleano." });
      }

      const updatedZone = await storage.updateZone(zoneId, data);

      if (!updatedZone) {
        return res.status(404).json({ message: "Zona não encontrada" });
      }
      return res.status(200).json(updatedZone);
    } catch (error) {
      if (error instanceof ZodError) {
        // Se você usar Zod para parse
        return res
          .status(400)
          .json({ message: "Dados inválidos", errors: formatErrors(error) });
      }
      console.error("Erro ao atualizar zona [admin]:", error);
      return res.status(500).json({ message: "Erro ao atualizar zona" });
    }
  });

  // DELETE /api/admin/zones/:id - Excluir uma zona
  app.delete("/api/admin/zones/:id", async (req: any, res: Response) => {
    if (
      !req.user ||
      (req.user.role !== UserRole.MANAGER && req.user.role !== UserRole.ADMIN)
    ) {
      return res.status(403).json({ message: "Acesso negado" });
    }
    try {
      const zoneId = parseInt(req.params.id);
      if (isNaN(zoneId)) {
        return res.status(400).json({ message: "ID de zona inválido" });
      }

      const success = await storage.deleteZone(zoneId);

      if (!success) {
        return res
          .status(404)
          .json({ message: "Zona não encontrada ou erro ao deletar" });
      }
      return res.status(200).json({ message: "Zona excluída com sucesso" });
    } catch (error) {
      console.error("Erro ao deletar zona [admin]:", error);
      // Poderia haver um erro se, por exemplo, a zona estiver em uso (foreign key constraint)
      // Você pode querer tratar isso de forma mais específica.
      return res.status(500).json({ message: "Erro ao deletar zona" });
    }
  });

  // Price routes
  app.get("/api/prices/:zoneId", async (req: Request, res: Response) => {
    const zoneId = parseInt(req.params.zoneId);
    if (isNaN(zoneId)) {
      return res.status(400).json({ message: "ID de zona inválido" });
    }

    const priceConfig = await storage.getCurrentPriceConfig(zoneId);
    if (!priceConfig) {
      return res
        .status(404)
        .json({ message: "Configuração de preço não encontrada" });
    }

    return res.status(200).json(priceConfig);
  });

  // Parking permit routes
  app.get("/api/permits/active", async (req: any, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    const activePermits = await storage.listActiveParkingPermitsByUserId(
      req.user.id
    );
    return res.status(200).json(activePermits);
  });

  app.get("/api/permits/history", async (req: any, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

    const permitHistory = await storage.listParkingPermitHistory(
      req.user.id,
      limit,
      offset
    );
    return res.status(200).json(permitHistory);
  });

  // Quick buy (no auth required)
  app.post("/api/permits/quick-buy", async (req: Request, res: Response) => {
    try {
      const data = quickBuySchema.parse(req.body);

      // Check if zone exists
      const zone = await storage.getZone(data.zoneId);
      if (!zone) {
        return res.status(404).json({ message: "Zona não encontrada" });
      }

      // Check if price config exists
      const priceConfig = await storage.getCurrentPriceConfig(data.zoneId);
      if (!priceConfig) {
        return res
          .status(404)
          .json({ message: "Configuração de preço não encontrada" });
      }

      // Get or create vehicle
      let vehicle = await storage.getVehicleByLicensePlate(data.licensePlate);

      if (!vehicle) {
        vehicle = await storage.createVehicle({
          licensePlate: data.licensePlate,
          model: data.model,
          userId: (req as any).user?.id, // Might be null for non-authenticated users
        });
      }

      // Calculate amount based on duration
      let amount = "0.00";
      switch (data.durationHours) {
        case 1:
          amount = priceConfig.hour1Price.toString();
          break;
        case 2:
          amount = priceConfig.hour2Price.toString();
          break;
        case 3:
          amount = priceConfig.hour3Price.toString();
          break;
        case 4:
          amount = priceConfig.hour4Price.toString();
          break;
        case 5:
          amount = priceConfig.hour5Price.toString();
          break;
        case 6:
          amount = priceConfig.hour6Price.toString();
          break;
        case 12:
          amount = priceConfig.hour12Price.toString();
          break;
        default:
          return res.status(400).json({ message: "Duração inválida" });
      }

      // Calculate start and end times
      const startTime = new Date();
      const endTime = new Date(
        startTime.getTime() + data.durationHours * 60 * 60 * 1000
      );

      // Create permit
      const transactionCode = generateTransactionCode();
      const permit = await storage.createParkingPermit({
        vehicleId: vehicle.id,
        userId: (req as any).user?.id, // Might be null for non-authenticated users
        durationHours: data.durationHours,
        startTime,
        endTime,
        zoneId: data.zoneId,
        priceId: priceConfig.id,
        amount,
        paymentStatus: PaymentStatus.COMPLETED, // For simplicity, assuming payment is completed
        paymentMethod: data.paymentMethod,
        paymentId: "pay_" + Math.random().toString(36).substring(2, 10),
        transactionCode,
        notificationSent: false,
      });

      // Get full details for response
      const permitWithDetails = {
        ...permit,
        vehicle,
        zone,
      };

      return res.status(201).json(permitWithDetails);
    } catch (error) {
      if (error instanceof ZodError) {
        return res
          .status(400)
          .json({ message: "Dados inválidos", errors: formatErrors(error) });
      }
      return res.status(500).json({ message: "Erro ao criar permissão" });
    }
  });

  // Check permit
  app.post("/api/permits/check", async (req: Request, res: Response) => {
    try {
      const data = checkPermitSchema.parse(req.body);

      const activePermit = await storage.getActiveParkingPermitByLicensePlate(
        data.licensePlate
      );

      if (!activePermit) {
        return res.status(404).json({
          found: false,
          message: "Nenhuma permissão ativa encontrada para esta placa",
        });
      }

      return res.status(200).json({
        found: true,
        permit: activePermit,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res
          .status(400)
          .json({ message: "Dados inválidos", errors: formatErrors(error) });
      }
      return res.status(500).json({ message: "Erro ao verificar permissão" });
    }
  });

  // Fiscal routes
  app.post("/api/fiscal/verify", async (req: any, res: Response) => {
    if (
      !req.user ||
      (req.user.role !== "FISCAL" && req.user.role !== "ADMIN")
    ) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    try {
      const { licensePlate, latitude, longitude } = req.body;

      if (!licensePlate) {
        return res.status(400).json({ message: "Placa é obrigatória" });
      }

      // Create fiscal action
      const fiscalAction = await storage.createFiscalAction({
        fiscalId: req.user.id,
        actionType: "VERIFICATION",
        licensePlate,
        latitude,
        longitude,
      });

      // Check if permit is active
      const activePermit = await storage.getActiveParkingPermitByLicensePlate(
        licensePlate
      );

      if (!activePermit) {
        // If no active permit, record verification with NOT_FOUND result
        const verification = await storage.createVerification({
          fiscalActionId: fiscalAction.id,
          permitId: 0, // Dummy value, won't be used
          result: VerificationResult.NOT_FOUND,
          notes: "Nenhuma permissão ativa encontrada",
        });

        return res.status(200).json({
          status: "NOT_FOUND",
          message: "Nenhuma permissão ativa encontrada para esta placa",
          fiscalAction,
          verification,
        });
      }

      // Record verification with VALID result
      const verification = await storage.createVerification({
        fiscalActionId: fiscalAction.id,
        permitId: activePermit.id,
        result: VerificationResult.VALID,
        notes: "Permissão ativa verificada",
      });

      return res.status(200).json({
        status: "VALID",
        permit: activePermit,
        fiscalAction,
        verification,
      });
    } catch (error) {
      return res.status(500).json({ message: "Erro ao verificar permissão" });
    }
  });

  app.post("/api/fiscal/infringement", async (req: any, res: Response) => {
    if (
      !req.user ||
      (req.user.role !== "FISCAL" && req.user.role !== "ADMIN")
    ) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    try {
      const {
        licensePlate,
        infringementType,
        notes,
        evidencePhotos,
        latitude,
        longitude,
      } = req.body;

      if (!licensePlate || !infringementType) {
        return res
          .status(400)
          .json({ message: "Placa e tipo de infração são obrigatórios" });
      }

      // Get vehicle
      let vehicle = await storage.getVehicleByLicensePlate(licensePlate);

      // If vehicle doesn't exist, create it
      if (!vehicle) {
        vehicle = await storage.createVehicle({
          licensePlate,
          model: "Veículo Desconhecido",
          userId: null,
        });
      }

      // Create fiscal action
      const fiscalAction = await storage.createFiscalAction({
        fiscalId: req.user.id,
        actionType: "INFRINGEMENT",
        licensePlate,
        latitude,
        longitude,
      });

      // Create infringement
      const infringement = await storage.createInfringement({
        fiscalActionId: fiscalAction.id,
        vehicleId: vehicle.id,
        infringementType,
        evidencePhotos: evidencePhotos || [],
        notes,
        status: "REGISTERED",
      });

      return res.status(201).json({
        infringement,
        fiscalAction,
      });
    } catch (error) {
      return res.status(500).json({ message: "Erro ao registrar infração" });
    }
  });

  app.get("/api/fiscal/activity", async (req: any, res: Response) => {
    if (
      !req.user ||
      (req.user.role !== "FISCAL" && req.user.role !== "ADMIN")
    ) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const fiscalActions = await storage.listFiscalActionsByFiscalId(
        req.user.id,
        limit
      );

      return res.status(200).json(fiscalActions);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao listar atividades" });
    }
  });

  // Admin and manager routes
  app.get("/api/admin/stats", async (req: any, res: Response) => {
    if (
      !req.user ||
      (req.user.role !== "MANAGER" && req.user.role !== "ADMIN")
    ) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    try {
      const permitStats = await storage.getPermitStats();
      const zoneOccupancy = await storage.getZoneOccupancyStats();
      const fiscalPerformance = await storage.getFiscalPerformanceStats();

      return res.status(200).json({
        permitStats,
        zoneOccupancy,
        fiscalPerformance,
      });
    } catch (error) {
      return res.status(500).json({ message: "Erro ao obter estatísticas" });
    }
  });

  app.get("/api/admin/users", async (req: any, res: Response) => {
    if (!req.user || req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Acesso negado" });
    }

    try {
      const users = await storage.listUsers();
      // Remove passwords from response
      const usersWithoutPasswords = users.map((user) => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });

      return res.status(200).json(usersWithoutPasswords);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao listar usuários" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
