import request from "supertest";

jest.mock("../middleware/auth", () => ({
  auth: (req: any, _res: any, next: any) => {
    req.userId = "507f1f77bcf86cd799439011";
    next();
  },
}));

jest.mock("../dao/shoppingListDao", () => ({
  getListsByUser: jest.fn(),
  getShoppingListById: jest.fn(),
  createShoppingList: jest.fn(),
  updateShoppingList: jest.fn(),
  deleteShoppingList: jest.fn(),
  addMember: jest.fn(),
  removeMember: jest.fn(),
}));

import app from "../app";
import * as shoppingListDao from "../dao/shoppingListDao";

describe("ShoppingList API", () => {
  beforeEach(() => jest.clearAllMocks());

  test("GET /api/shopping-lists - happy day", async () => {
    (shoppingListDao.getListsByUser as jest.Mock).mockResolvedValue([
      { _id: "l1", name: "Groceries" },
      { _id: "l2", name: "Holidays" },
    ]);

    const res = await request(app).get("/api/shopping-lists");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      list: [
        { _id: "l1", name: "Groceries" },
        { _id: "l2", name: "Holidays" },
      ],
    });

    expect(shoppingListDao.getListsByUser).toHaveBeenCalledWith(
      "507f1f77bcf86cd799439011"
    );
  });

  test("GET /api/shopping-lists - alternative (DAO error => 500)", async () => {
    (shoppingListDao.getListsByUser as jest.Mock).mockRejectedValue(
      new Error("DB down")
    );

    const res = await request(app).get("/api/shopping-lists");

    expect(res.status).toBe(500);
    expect(res.body).toMatchObject({
      message: "Internal server error",
      error: "DB down",
    });
  });

  test("GET /api/shopping-lists/:listId - happy day", async () => {
    (shoppingListDao.getShoppingListById as jest.Mock).mockResolvedValue({
      _id: "l1",
      name: "Groceries",
      ownerId: "507f1f77bcf86cd799439011",
      members: [],
    });

    const res = await request(app).get("/api/shopping-lists/l1");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ name: "Groceries" });
    expect(shoppingListDao.getShoppingListById).toHaveBeenCalledWith("l1");
  });

  test("GET /api/shopping-lists/:listId - alternative (not found)", async () => {
    (shoppingListDao.getShoppingListById as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get("/api/shopping-lists/does-not-exist");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      errorCode: "shoppingListDoesNotExist",
      listId: "does-not-exist",
    });
  });

  test("POST /api/shopping-lists - happy day", async () => {
    (shoppingListDao.createShoppingList as jest.Mock).mockResolvedValue({
      _id: "l9",
      name: "New list",
      isArchived: false,
    });

    const res = await request(app)
      .post("/api/shopping-lists")
      .send({ name: "New list" });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: "New list" });
    expect(shoppingListDao.createShoppingList).toHaveBeenCalled();
  });

  test("POST /api/shopping-lists - alternative (missing/empty name)", async () => {
    const res = await request(app).post("/api/shopping-lists").send({ name: "" });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: "Name is required" });
  });

  test("PATCH /api/shopping-lists/:listId - happy day (owner)", async () => {
    (shoppingListDao.getShoppingListById as jest.Mock).mockResolvedValue({
      _id: "l1",
      name: "Old",
      ownerId: { toString: () => "507f1f77bcf86cd799439011" },
      members: [],
    });

    (shoppingListDao.updateShoppingList as jest.Mock).mockResolvedValue({
      _id: "l1",
      name: "Renamed",
    });

    const res = await request(app)
      .patch("/api/shopping-lists/l1")
      .send({ name: "Renamed" });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ name: "Renamed" });
    expect(shoppingListDao.updateShoppingList).toHaveBeenCalledWith("l1", {
      name: "Renamed",
    });
  });

  test("PATCH /api/shopping-lists/:listId - alternative (not found)", async () => {
    (shoppingListDao.getShoppingListById as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .patch("/api/shopping-lists/l404")
      .send({ name: "X" });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      errorCode: "shoppingListDoesNotExist",
      listId: "l404",
    });
  });

  test("PATCH /api/shopping-lists/:listId - alternative (not owner => 403)", async () => {
    (shoppingListDao.getShoppingListById as jest.Mock).mockResolvedValue({
      _id: "l1",
      ownerId: { toString: () => "aaaaaaaaaaaaaaaaaaaaaaaa" },
      members: [],
    });

    const res = await request(app)
      .patch("/api/shopping-lists/l1")
      .send({ name: "X" });

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ message: "Only owner can rename the list" });
  });

  test("DELETE /api/shopping-lists/:listId - happy day (owner)", async () => {
    (shoppingListDao.getShoppingListById as jest.Mock).mockResolvedValue({
      _id: "l1",
      ownerId: { toString: () => "507f1f77bcf86cd799439011" },
    });

    (shoppingListDao.deleteShoppingList as jest.Mock).mockResolvedValue(true);

    const res = await request(app).delete("/api/shopping-lists/l1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ deletedId: "l1" });
    expect(shoppingListDao.deleteShoppingList).toHaveBeenCalledWith("l1");
  });

  test("DELETE /api/shopping-lists/:listId - alternative (not found)", async () => {
    (shoppingListDao.getShoppingListById as jest.Mock).mockResolvedValue(null);

    const res = await request(app).delete("/api/shopping-lists/l404");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      errorCode: "shoppingListDoesNotExist",
      listId: "l404",
    });
  });

  test("DELETE /api/shopping-lists/:listId - alternative (not owner => 403)", async () => {
    (shoppingListDao.getShoppingListById as jest.Mock).mockResolvedValue({
      _id: "l1",
      ownerId: { toString: () => "bbbbbbbbbbbbbbbbbbbbbbbb" },
    });

    const res = await request(app).delete("/api/shopping-lists/l1");

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ message: "Only owner can delete the list" });
  });
});