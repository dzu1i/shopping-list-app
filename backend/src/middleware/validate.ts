import { Request, Response, NextFunction } from "express";

type CommandName =
  | "shoppingList/create"
  | "shoppingList/get"
  | "shoppingItem/create"
  | "shoppingItem/update"
  | "shoppingListMember/list";

export function validate(cmd: CommandName) {
  return (req: Request, res: Response, next: NextFunction) => {
    const dtoIn = req.method === "GET" ? req.query : req.body;

    if (cmd === "shoppingList/create") {
      if (!dtoIn.name || typeof dtoIn.name !== "string") {
        return res.status(400).json({ error: "name is required" });
      }
    }

    if (cmd === "shoppingList/get") {
      if (!dtoIn.id || typeof dtoIn.id !== "string") {
        return res.status(400).json({ error: "id is required" });
      }
    }

    if (cmd === "shoppingItem/create") {
      if (!dtoIn.listId || typeof dtoIn.listId !== "string") {
        return res.status(400).json({ error: "listId is required" });
      }
      if (!dtoIn.name || typeof dtoIn.name !== "string") {
        return res.status(400).json({ error: "name is required" });
      }
    }

    if (cmd === "shoppingItem/update") {
      if (!dtoIn.listId || !dtoIn.itemId) {
        return res.status(400).json({ error: "listId and itemId are required" });
      }
    }

    if (cmd === "shoppingListMember/list") {
      if (!dtoIn.listId || typeof dtoIn.listId !== "string") {
        return res.status(400).json({ error: "listId is required" });
      }
    }

    (req as any).dtoIn = dtoIn;
    next();
  };
}
