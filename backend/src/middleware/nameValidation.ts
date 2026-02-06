import { Request, Response, NextFunction } from "express";

// společná logika validace a formátování
export function validateAndFormatName(input: unknown): string {
  if (typeof input !== "string") {
    throw new Error("invalidNameType");
  }

  const trimmed = input.trim();

  if (trimmed.length === 0) {
    throw new Error("emptyName");
  }

  if (trimmed.length > 20) {
    throw new Error("nameTooLong");
  }

  // jen písmena a mezery
  if (!/^[A-Za-z ]+$/.test(trimmed)) {
    throw new Error("invalidCharacters");
  }

  // "julie vitkova" -> "Julie vitkova"
  const lower = trimmed.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

// middleware pro CREATE shopping listu – validuje name + ownerId
export function validateListNames(req: Request, res: Response, next: NextFunction) {
  const { name, ownerId } = req.body;

  if (!name || !ownerId) {
    return res.status(400).json({
      errorCode: "invalidDtoIn",
      message: "name and ownerId are required",
    });
  }

  try {
    req.body.name = validateAndFormatName(name);
    req.body.ownerId = validateAndFormatName(ownerId);
    next();
  } catch (e: any) {
    return res.status(400).json({
      errorCode: e.message,
      message: "Invalid name format",
    });
  }
}

// middleware pro CREATE membera – validuje name
export function validateMemberName(req: Request, res: Response, next: NextFunction) {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({
      errorCode: "invalidDtoIn",
      message: "name is required",
    });
  }

  try {
    req.body.name = validateAndFormatName(name);
    next();
  } catch (e: any) {
    return res.status(400).json({
      errorCode: e.message,
      message: "Invalid name format",
    });
  }
}