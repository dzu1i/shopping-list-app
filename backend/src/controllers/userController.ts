import { Request, Response, NextFunction } from "express";
import * as userDao from "../dao/userDao";

export async function createUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { name } = req.body;
    const created = await userDao.createUser(name);
    res.status(201).json(created);
  } catch (err: any) {
    if (err.message === "User already exists") {
      res.status(409).json({ errorCode: "userExists", message: "Name already taken" });
    } else {
      next(err);
    }
  }
}

export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await userDao.listUsers();
    res.json({ users });
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
  try {
    const success = await userDao.deleteUser(req.params.userId);
    if (!success) {
      return res.status(404).json({ errorCode: "userNotFound" });
    }
    res.json({ deleted: true });
  } catch (err) {
    next(err);
  }
}
