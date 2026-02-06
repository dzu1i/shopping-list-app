import { ObjectId } from "mongodb";
import { getDb } from "./db";

export interface User {
  _id?: ObjectId;
  name: string;
  createdAt: Date;
}

const COLLECTION = "users";

export async function createUser(name: string): Promise<User> {
  const db = await getDb();

  const existing = await db.collection<User>(COLLECTION).findOne({ name });
  if (existing) throw new Error("User already exists");

  const user: User = {
    name,
    createdAt: new Date(),
  };

  const result = await db.collection<User>(COLLECTION).insertOne(user);
  return { ...user, _id: result.insertedId };
}

export async function listUsers(): Promise<User[]> {
  const db = await getDb();
  return db.collection<User>(COLLECTION).find().toArray();
}

export async function deleteUser(id: string): Promise<boolean> {
  const db = await getDb();
  const result = await db.collection<User>(COLLECTION).deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}

export async function getUserById(id: string): Promise<User | null> {
  const db = await getDb();
  return db.collection<User>(COLLECTION).findOne({ _id: new ObjectId(id) });
}

export async function getUserByName(name: string): Promise<User | null> {
  const db = await getDb();
  return db.collection<User>(COLLECTION).findOne({ name });
}
