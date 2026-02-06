import { Router } from "express";
import {
  listShoppingLists,
  getShoppingList,
  createShoppingList,
  renameShoppingList,
  archiveShoppingList,
  deleteShoppingList,
  removeMemberFromList,
  addMemberToList,
  leaveList,
} from "../controllers/shoppingListController";
import { auth } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";

const router = Router();
router.use(auth);

// každý přihlášený:
router.get("/", listShoppingLists);
router.get("/:listId", getShoppingList);
router.post("/", createShoppingList);

// jen owner:
router.patch("/:listId", requireRole(["owner"]), renameShoppingList);
router.patch("/:listId/archive", requireRole(["owner"]), archiveShoppingList);
router.delete("/:listId", requireRole(["owner"]), deleteShoppingList);
router.delete("/:listId/members/:memberId", requireRole(["owner"]), removeMemberFromList);
router.post("/:listId/members/:memberId", requireRole(["owner"]), addMemberToList);

// leave dává smysl pro member (owner stejně ve controlleru blokuješ):
router.post("/:listId/leave", requireRole(["member"]), leaveList);

export default router;