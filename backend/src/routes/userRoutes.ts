import express from "express";
import {
  createUser,
  listUsers,
  deleteUser
} from "../controllers/userController";

const router = express.Router();

router.post("/", createUser);
router.get("/", listUsers);
router.delete("/:userId", deleteUser);

export default router;
