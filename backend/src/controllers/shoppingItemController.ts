import { Request, Response, NextFunction } from "express";
import * as shoppingItemDao from "../dao/shoppingItemDao";

export async function listItems(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await shoppingItemDao.listItems(req.params.listId);
    res.json(items);
  } catch (err) {
    next(err);
  }
}

export async function createItem(req: Request, res: Response, next: NextFunction) {
  try {
    const newItem = await shoppingItemDao.createItem({
      listId: req.params.listId,
      name: req.body.name,
      quantity: req.body.quantity,
      isDone: false,
    });
    res.status(201).json(newItem);
  } catch (err) {
    next(err);
  }
}

export async function updateItem(req: Request, res: Response, next: NextFunction) {
  try {
    const updated = await shoppingItemDao.updateItem(req.params.itemId, req.body);
    if (!updated) {
      return res.status(404).json({ errorCode: "itemNotFound" });
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function deleteItem(req: Request, res: Response, next: NextFunction) {
  try {
    const deleted = await shoppingItemDao.deleteItem(req.params.itemId);
    if (!deleted) {
      return res.status(404).json({ errorCode: "itemNotFound" });
    }
    res.json({ deletedId: req.params.itemId });
  } catch (err) {
    next(err);
  }
}

export async function resolveItem(req: Request, res: Response, next: NextFunction) {
  try {
    const updated = await shoppingItemDao.resolveItem(req.params.itemId);
    if (!updated) {
      return res.status(404).json({ errorCode: "itemNotFound" });
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function unresolveItem(req: Request, res: Response, next: NextFunction) {
  try {
    const updated = await shoppingItemDao.unresolveItem(req.params.itemId);
    if (!updated) {
      return res.status(404).json({ errorCode: "itemNotFound" });
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
}
