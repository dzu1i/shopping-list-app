// src/middleware/requireRole.ts
import { Request, Response, NextFunction } from "express";
import { UserProfile } from "./auth";

export function requireRole(allowedRoles: UserProfile[]) {
  return function (req: Request, res: Response, next: NextFunction) {
    const userRole = req.user?.profile;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        errorCode: "forbidden",
        message: "Insufficient permissions.",
      });
    }

    next();
  };
}