import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { verifyAccessToken } from "../lib/auth";

export type AuthenticatedRequest = Request & {
  user?: {
    id: string;
    email: string;
    role: "STUDENT" | "ADMIN";
  };
};

export async function attachUser(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const authHeader = req.header("authorization");
  if (!authHeader?.startsWith("Bearer ")) return next();

  try {
    const payload = verifyAccessToken(authHeader.slice(7));
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
      };
    }
  } catch {
    // Ignore invalid tokens and continue as anonymous.
  }

  return next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  return next();
}

export function requireRole(role: "STUDENT" | "ADMIN") {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    if (req.user.role !== role) {
      return res.status(403).json({ error: "Forbidden" });
    }
    return next();
  };
}
