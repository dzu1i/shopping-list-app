import { ObjectId } from "mongodb";
import { getDb } from "./db";
import { ShoppingItem } from "../types";

const COLLECTION = "shoppingItems";

export async function listItems(listId: string): Promise<ShoppingItem[]> {
  const db = await getDb();
  return db.collection<ShoppingItem>(COLLECTION).find({ listId }).toArray();
}

export async function createItem(item: Omit<ShoppingItem, "_id" | "createdAt" | "updatedAt">): Promise<ShoppingItem> {
  const db = await getDb();
  const now = new Date();
  const newItem = {
    ...item,
    isDone: false,
    createdAt: now,
    updatedAt: now,
  };
  const result = await db.collection(COLLECTION).insertOne(newItem);
  return { ...newItem, _id: result.insertedId };
}

export async function updateItem(itemId: string, updates: Partial<ShoppingItem>): Promise<ShoppingItem | null> {
  const db = await getDb();

  const result = await db
    .collection(COLLECTION)
    .findOneAndUpdate(
      { _id: new ObjectId(itemId) },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: "after" }
    );

  // Vracíme buď aktualizovaný dokument, nebo null
  return result?.value ?? null;
}


export async function deleteItem(itemId: string): Promise<boolean> {
  const db = await getDb();
  const result = await db.collection<ShoppingItem>(COLLECTION).deleteOne({ _id: new ObjectId(itemId) });
  return result.deletedCount === 1;
}

export async function resolveItem(itemId: string): Promise<ShoppingItem | null> {
  return updateItem(itemId, { isDone: true });
}

export async function unresolveItem(itemId: string): Promise<ShoppingItem | null> {
  return updateItem(itemId, { isDone: false });
}
