import { MongoClient, Db } from "mongodb";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getDb(): Promise<Db> {
  if (!client) {
    const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
    const dbName = process.env.DB_NAME || "shopping-list-app";

    client = await MongoClient.connect(uri);
    db = client.db(dbName);
    console.log(`✅ Connected to MongoDB database: ${dbName}`);
  }

  if (!db) {
    throw new Error("Database not initialized");
  }

  return db;
}
