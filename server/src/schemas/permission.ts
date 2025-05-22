import { z } from "zod";

export const permissionSchema = z.object({
  id: z.string().uuid(),
  plate: z.string().min(7).max(8),
  startDate: z.date(),
  endDate: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const checkPermissionSchema = z.object({
  plate: z.string().min(7).max(8),
  checkTime: z.date(),
});

export type Permission = z.infer<typeof permissionSchema>;
export type CheckPermission = z.infer<typeof checkPermissionSchema>;
