import { ObjectId } from "mongodb";
import { getDb } from "./db";
import { ShoppingList } from "../types";

const COLLECTION = "shoppingLists";

export async function createShoppingList(
  data: Omit<ShoppingList, "_id" | "isArchived" | "createdAt" | "updatedAt">
): Promise<ShoppingList> {
  const db = await getDb();
  const doc: ShoppingList = {
    ...data,
    isArchived: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db.collection<ShoppingList>(COLLECTION).insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

export async function getShoppingListById(id: string): Promise<ShoppingList | null> {
  const db = await getDb();
  return db.collection<ShoppingList>(COLLECTION).findOne({ _id: new ObjectId(id) });
}

export async function getListsByUser(userId: string): Promise<ShoppingList[]> {
  const db = await getDb();
  const userObjectId = new ObjectId(userId);

  return db
    .collection<ShoppingList>(COLLECTION)
    .find({
      $or: [
        { ownerId: userObjectId },
        { members: userObjectId }
      ],
      isArchived: { $ne: true },
    })
    .toArray();
}


export async function updateShoppingList(
  id: string,
  data: Partial<Pick<ShoppingList, "name" | "isArchived" | "members">>
): Promise<ShoppingList | null> {
  const db = await getDb();
  const collection = db.collection<ShoppingList>(COLLECTION);
  const objectId = new ObjectId(id);

  // First update
  await collection.updateOne(
    { _id: objectId },
    { $set: { ...data, updatedAt: new Date() } }
  );

  // Then fetch the updated document
  return collection.findOne({ _id: objectId });
}


export async function deleteShoppingList(id: string): Promise<boolean> {
  const db = await getDb();
  const result = await db
    .collection<ShoppingList>(COLLECTION)
    .deleteOne({ _id: new ObjectId(id) });

  return result.deletedCount === 1;
}

export async function removeMember(
  listId: string,
  memberId: string
) {
  const db = await getDb();

  await db.collection<ShoppingList>("shoppingLists").updateOne(
    { _id: new ObjectId(listId) },
    {
      $pull: { members: new ObjectId(memberId) },
      $set: { updatedAt: new Date() },
    }
  );

  return db
    .collection<ShoppingList>("shoppingLists")
    .findOne({ _id: new ObjectId(listId) });
}

export async function addMember(listId: string, memberId: string) {
  const db = await getDb();

  await db.collection<ShoppingList>("shoppingLists").updateOne(
    { _id: new ObjectId(listId) },
    {
      $addToSet: { members: new ObjectId(memberId) }, // no duplicates
      $set: { updatedAt: new Date() },
    }
  );

  return db
    .collection<ShoppingList>("shoppingLists")
    .findOne({ _id: new ObjectId(listId) });
}
