import { Request, Response, NextFunction } from "express";
import { ObjectId } from "mongodb";
import * as shoppingListDao from "../dao/shoppingListDao";

export async function listShoppingLists(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).userId;

    const lists = await shoppingListDao.getListsByUser(userId);
    res.json({ list: lists });
  } catch (err) {
    next(err);
  }
}

export async function getShoppingList(req: Request, res: Response, next: NextFunction) {
  try {
    const list = await shoppingListDao.getShoppingListById(req.params.listId);

    if (!list) {
      return res.status(404).json({
        errorCode: "shoppingListDoesNotExist",
        listId: req.params.listId,
      });
    }

    res.json(list);
  } catch (err) {
    next(err);
  }
}

export async function createShoppingList(req: Request, res: Response, next: NextFunction) {
  try {
    const { name } = req.body;
    const userId = (req as any).userId;

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    const ownerId = new ObjectId(userId);

    const created = await shoppingListDao.createShoppingList({
      name: name.trim(),
      ownerId,
      members: [],
    });

    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

export async function renameShoppingList(req: Request, res: Response, next: NextFunction) {
  try {
    const { listId } = req.params;
    const userId = (req as any).userId;

    const list = await shoppingListDao.getShoppingListById(listId);
    if (!list) {
      return res.status(404).json({ errorCode: "shoppingListDoesNotExist", listId });
    }

    if (list.ownerId.toString() !== userId) {
      return res.status(403).json({ message: "Only owner can rename the list" });
    }

    const updated = await shoppingListDao.updateShoppingList(listId, {
      name: req.body.name,
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function deleteShoppingList(req: Request, res: Response, next: NextFunction) {
  try {
    const { listId } = req.params;
    const userId = (req as any).userId;

    const list = await shoppingListDao.getShoppingListById(listId);
    if (!list) {
      return res.status(404).json({ errorCode: "shoppingListDoesNotExist", listId });
    }

    if (list.ownerId.toString() !== userId) {
      return res.status(403).json({ message: "Only owner can delete the list" });
    }

    await shoppingListDao.deleteShoppingList(listId);
    res.json({ deletedId: listId });
  } catch (err) {
    next(err);
  }
}

export async function archiveShoppingList(req: Request, res: Response, next: NextFunction) {
  try {
    const { listId } = req.params;

    const updated = await shoppingListDao.updateShoppingList(listId, {
      isArchived: true,
    });

    if (!updated) {
      return res.status(404).json({ errorCode: "shoppingListNotFound" });
    }

    res.json({ archived: true, id: listId });
  } catch (err) {
    next(err);
  }
}

export async function removeMemberFromList(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { listId, memberId } = req.params;
    const userId = (req as any).userId; // logged-in user

    // validate IDs
    if (!ObjectId.isValid(listId) || !ObjectId.isValid(memberId)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const list = await shoppingListDao.getShoppingListById(listId);

    if (!list) {
      return res.status(404).json({ message: "Shopping list not found" });
    }

    // 🔐 only owner can remove members
    if (list.ownerId.toString() !== userId) {
      return res.status(403).json({
        message: "Only owner can remove members",
      });
    }

    const updated = await shoppingListDao.removeMember(
      listId,
      memberId
    );

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function addMemberToList(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { listId, memberId } = req.params;
    const userId = (req as any).userId;

    if (!ObjectId.isValid(listId) || !ObjectId.isValid(memberId)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const list = await shoppingListDao.getShoppingListById(listId);
    if (!list) {
      return res.status(404).json({ message: "List not found" });
    }

    // 🔐 only owner can add members
    if (list.ownerId.toString() !== userId) {
      return res.status(403).json({
        message: "Only owner can add members",
      });
    }

    // cannot add owner as member
    if (list.ownerId.toString() === memberId) {
      return res.status(400).json({
        message: "Owner is already part of the list",
      });
    }

    const updated = await shoppingListDao.addMember(listId, memberId);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function leaveList(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { listId } = req.params;
    const userId = (req as any).userId;

    if (!ObjectId.isValid(listId)) {
      return res.status(400).json({ message: "Invalid listId" });
    }

    const list = await shoppingListDao.getShoppingListById(listId);
    if (!list) {
      return res.status(404).json({ message: "List not found" });
    }

    // owner cannot leave
    if (list.ownerId.toString() === userId) {
      return res.status(400).json({
        message: "Owner cannot leave their own list",
      });
    }

    // user must be member
    if (!list.members.some(m => m.toString() === userId)) {
      return res.status(403).json({
        message: "You are not a member of this list",
      });
    }

    const updated = await shoppingListDao.removeMember(listId, userId);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}
