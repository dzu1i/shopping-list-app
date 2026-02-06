import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";

import shoppingListRoutes from "./routes/shoppingListRoutes";
import shoppingItemRoutes from "./routes/shoppingItemRoutes";
import userRoutes from "./routes/userRoutes";

if (process.env.NODE_ENV !== "test") {
  dotenv.config();
}

const app = express();

app.use(cors());
app.use(express.json());

// routes
app.use("/api/shopping-lists", shoppingListRoutes);
app.use("/api/shopping-lists/:listId/items", shoppingItemRoutes);
app.use("/api/users", userRoutes);

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (process.env.NODE_ENV !== "test") {
    console.error("❌ Error:", err);
  }
  res.status(500).json({
    message: "Internal server error",
    error: err?.message,
  });
});

export default app;