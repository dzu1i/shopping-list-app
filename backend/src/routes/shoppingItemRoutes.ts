import { Router } from "express";
import {
  listItems,
  createItem,
  updateItem,
  deleteItem,
  resolveItem,
  unresolveItem,
} from "../controllers/shoppingItemController";
import { auth } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";

const router = Router({ mergeParams: true });
router.use(auth);

// všichni v listu (viewer může koukat)
router.get("/", requireRole(["owner", "member", "viewer"]), listItems);

// owner+member mohou měnit
router.post("/", requireRole(["owner", "member"]), createItem);
router.patch("/:itemId", requireRole(["owner", "member"]), updateItem);
router.delete("/:itemId", requireRole(["owner", "member"]), deleteItem);
router.post("/:itemId/resolve", requireRole(["owner", "member"]), resolveItem);
router.post("/:itemId/unresolve", requireRole(["owner", "member"]), unresolveItem);

export default router;