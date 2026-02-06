// src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import { ObjectId } from "mongodb";

export type UserProfile = "owner" | "member" | "viewer";

declare global {
  namespace Express {
    interface Request {
      user?: { profile: UserProfile };
      userId?: string;
    }
  }
}

export function auth(req: Request, res: Response, next: NextFunction) {
  const userId = req.headers["x-user-id"];
  const profileRaw = req.headers["x-user-profile"]; // 👈 přidáme

  if (!userId || typeof userId !== "string") {
    return res.status(401).json({ message: "Invalid or missing user" });
  }

  if (!ObjectId.isValid(userId)) {
    return res.status(401).json({ message: "Invalid or missing user" });
  }

  // profil: buď z FE hlavičky, nebo default (např. member)
  const profile: UserProfile =
    profileRaw === "owner" || profileRaw === "member" || profileRaw === "viewer"
      ? profileRaw
      : "member";

  (req as any).userId = userId;
  req.user = { profile }; // 👈 aby requireRole fungoval

  next();
}