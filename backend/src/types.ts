import { ObjectId } from "mongodb";

export interface ShoppingItem {
  _id?: ObjectId;
  listId: string;            // References ShoppingList._id
  name: string;
  quantity?: string;
  isDone: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShoppingList {
  _id?: ObjectId;
  name: string;
  ownerId: ObjectId;           // References User._id
  members: ObjectId[];         // Array of User._id
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  _id?: ObjectId;
  name: string;              // Must be unique
  createdAt: Date;
}

export interface UserPublic {
  id: string;
  name: string;
}

