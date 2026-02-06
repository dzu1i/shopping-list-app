import request from "supertest";

jest.mock("../middleware/auth", () => ({
  auth: (req: any, _res: any, next: any) => {
    req.userId = "507f1f77bcf86cd799439011";
    next();
  },
}));

jest.mock("../dao/shoppingItemDao", () => ({
  listItems: jest.fn(),
  createItem: jest.fn(),
  updateItem: jest.fn(),
  deleteItem: jest.fn(),
  resolveItem: jest.fn(),
  unresolveItem: jest.fn(),
}));

import app from "../app";
import * as shoppingItemDao from "../dao/shoppingItemDao";

describe("ShoppingItem API", () => {
  beforeEach(() => jest.clearAllMocks());

  test("GET /api/shopping-lists/:listId/items - happy day", async () => {
    (shoppingItemDao.listItems as jest.Mock).mockResolvedValue([
      { _id: "i1", name: "Milk", quantity: "1", isDone: false },
      { _id: "i2", name: "Bread", quantity: "2", isDone: true },
    ]);

    const res = await request(app).get("/api/shopping-lists/l1/items");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(shoppingItemDao.listItems).toHaveBeenCalledWith("l1");
  });

  test("GET /api/shopping-lists/:listId/items - alternative (DAO error => 500)", async () => {
    (shoppingItemDao.listItems as jest.Mock).mockRejectedValue(new Error("DB down"));

    const res = await request(app).get("/api/shopping-lists/l1/items");

    expect(res.status).toBe(500);
    expect(res.body).toMatchObject({
      message: "Internal server error",
      error: "DB down",
    });
  });

  test("POST /api/shopping-lists/:listId/items - happy day", async () => {
    (shoppingItemDao.createItem as jest.Mock).mockResolvedValue({
      _id: "i9",
      listId: "l1",
      name: "Eggs",
      quantity: "10",
      isDone: false,
    });

    const res = await request(app)
      .post("/api/shopping-lists/l1/items")
      .send({ name: "Eggs", quantity: "10" });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      name: "Eggs",
      quantity: "10",
      isDone: false,
    });

    expect(shoppingItemDao.createItem).toHaveBeenCalledWith({
      listId: "l1",
      name: "Eggs",
      quantity: "10",
      isDone: false,
    });
  });

  test("POST /api/shopping-lists/:listId/items - alternative (DAO error => 500)", async () => {
    (shoppingItemDao.createItem as jest.Mock).mockRejectedValue(
      new Error("Insert failed")
    );

    const res = await request(app)
      .post("/api/shopping-lists/l1/items")
      .send({ name: "Eggs", quantity: "10" });

    expect(res.status).toBe(500);
    expect(res.body).toMatchObject({
      message: "Internal server error",
      error: "Insert failed",
    });
  });

  test("PATCH /api/shopping-lists/:listId/items/:itemId - happy day", async () => {
    (shoppingItemDao.updateItem as jest.Mock).mockResolvedValue({
      _id: "i1",
      name: "Milk",
      quantity: "2",
      isDone: false,
    });

    const res = await request(app)
      .patch("/api/shopping-lists/l1/items/i1")
      .send({ quantity: "2" });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ quantity: "2" });
    expect(shoppingItemDao.updateItem).toHaveBeenCalledWith("i1", {
      quantity: "2",
    });
  });

  test("PATCH /api/shopping-lists/:listId/items/:itemId - alternative (not found)", async () => {
    (shoppingItemDao.updateItem as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .patch("/api/shopping-lists/l1/items/does-not-exist")
      .send({ quantity: "2" });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ errorCode: "itemNotFound" });
  });

  test("DELETE /api/shopping-lists/:listId/items/:itemId - happy day", async () => {
    (shoppingItemDao.deleteItem as jest.Mock).mockResolvedValue(true);

    const res = await request(app).delete("/api/shopping-lists/l1/items/i1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ deletedId: "i1" });
    expect(shoppingItemDao.deleteItem).toHaveBeenCalledWith("i1");
  });

  test("DELETE /api/shopping-lists/:listId/items/:itemId - alternative (not found)", async () => {
    (shoppingItemDao.deleteItem as jest.Mock).mockResolvedValue(false);

    const res = await request(app).delete(
      "/api/shopping-lists/l1/items/does-not-exist"
    );

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ errorCode: "itemNotFound" });
  });

  test("POST /api/shopping-lists/:listId/items/:itemId/resolve - happy day", async () => {
    (shoppingItemDao.resolveItem as jest.Mock).mockResolvedValue({
      _id: "i1",
      isDone: true,
    });

    const res = await request(app).post("/api/shopping-lists/l1/items/i1/resolve");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ isDone: true });
    expect(shoppingItemDao.resolveItem).toHaveBeenCalledWith("i1");
  });

  test("POST /api/shopping-lists/:listId/items/:itemId/unresolve - happy day", async () => {
    (shoppingItemDao.unresolveItem as jest.Mock).mockResolvedValue({
      _id: "i1",
      isDone: false,
    });

    const res = await request(app).post(
      "/api/shopping-lists/l1/items/i1/unresolve"
    );

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ isDone: false });
    expect(shoppingItemDao.unresolveItem).toHaveBeenCalledWith("i1");
  });
});