import { ListPreview, Member, ShoppingItem, ShoppingList } from "./types";

let mockLists: ShoppingList[] = [
  {
    id: "groceries",
    title: "Groceries",
    isArchived: false,
    createdAt: "2025-12-01",
    ownerId: "u1",
    members: [
      { id: "u1", name: "Julie" },
      { id: "u2", name: "Alex" },
    ],
    items: [
      { id: "i1", name: "Milk", qty: "1L", done: false },
      { id: "i2", name: "Bread", qty: "1", done: true },
      { id: "i3", name: "Cheese", qty: "200g", done: false },
    ],
  },
  {
    id: "xmas",
    title: "Xmas Gifts",
    isArchived: true,
    createdAt: "2025-12-02",
    ownerId: "u1",
    members: [{ id: "u1", name: "Julie" }],
    items: [{ id: "i4", name: "Milk", qty: "1L", done: false }],
  },
  {
    id: "holidays",
    title: "Holidays",
    isArchived: false,
    createdAt: "2025-12-08",
    ownerId: "u2",
    members: [
      { id: "u1", name: "Julie" },
      { id: "u2", name: "Filip" },
    ],
    items: [
      { id: "i5", name: "Milk", qty: "1L", done: false },
      { id: "i6", name: "Bread", qty: "1", done: true },
    ],
  },
];

export async function getLists(): Promise<ListPreview[]> {
  return mockLists.map((l) => ({
    id: l.id,
    title: l.title,
    isArchived: l.isArchived,
    isOwner: l.ownerId === "u1",
    itemCount: l.items.length,
    doneCount: l.items.filter((i) => i.done).length,
  }));
}

export async function getListDetail(id: string): Promise<ShoppingList> {
  const found = mockLists.find((l) => l.id === id);
  if (!found) throw new Error("List not found");
  return found;
}

/**
 * ✅ SIGNATURE MATCHES realApi:
 * addItem(listId, name, qty)
 */
export async function addItem(
  listId: string,
  name: string,
  qty: string
): Promise<ShoppingItem> {
  const list = mockLists.find((l) => l.id === listId);
  if (!list) throw new Error("List not found");

  const newItem: ShoppingItem = {
    id: "item" + Date.now(),
    name,
    qty: qty?.trim() || "1",
    done: false,
  };

  list.items.push(newItem);
  return newItem;
}

/**
 * ✅ SIGNATURE MATCHES realApi:
 * toggleItemStatus(listId, itemId, nextDone)
 */
export async function toggleItemStatus(
  listId: string,
  itemId: string,
  nextDone: boolean
): Promise<ShoppingItem> {
  const list = mockLists.find((l) => l.id === listId);
  if (!list) throw new Error("List not found");

  const item = list.items.find((i) => i.id === itemId);
  if (!item) throw new Error("Item not found");

  item.done = nextDone;
  return item;
}

export async function addList(
  title: string,
  items: ShoppingItem[],
  members: Member[]
): Promise<ListPreview> {
  const newList: ShoppingList = {
    id: "l" + Date.now(),
    title,
    isArchived: false,
    createdAt: new Date().toISOString(),
    ownerId: "u1",
    members,
    items,
  };

  mockLists.unshift(newList);

  return {
    id: newList.id,
    title: newList.title,
    isArchived: newList.isArchived,
    isOwner: true,
    itemCount: items.length,
    doneCount: items.filter((i) => i.done).length,
  };
}

export async function archiveList(id: string): Promise<void> {
  const list = mockLists.find((l) => l.id === id);
  if (!list) throw new Error("List not found");
  list.isArchived = true;
}

export async function deleteList(id: string): Promise<void> {
  mockLists = mockLists.filter((l) => l.id !== id);
}

export async function deleteItem(listId: string, itemId: string): Promise<void> {
  const list = mockLists.find((l) => l.id === listId);
  if (!list) throw new Error("List not found");
  list.items = list.items.filter((item) => item.id !== itemId);
}

export async function editItem(
  listId: string,
  itemId: string,
  patch: Partial<ShoppingItem>
): Promise<ShoppingItem> {
  const list = mockLists.find((l) => l.id === listId);
  if (!list) throw new Error("List not found");

  const item = list.items.find((i) => i.id === itemId);
  if (!item) throw new Error("Item not found");

  // patch uses FE shape (name/qty/done)
  Object.assign(item, patch);

  // normalize if patch.qty or patch.done were undefined
  item.qty = item.qty ?? "1";
  item.done = !!item.done;

  return item;
}

export async function leaveList(listId: string, userId: string): Promise<void> {
  const list = mockLists.find((l) => l.id === listId);
  if (!list) throw new Error("List not found");
  list.members = list.members.filter((m) => m.id !== userId);
}

export async function renameList(listId: string, newTitle: string): Promise<void> {
  const list = mockLists.find((l) => l.id === listId);
  if (!list) throw new Error("List not found");
  list.title = newTitle;
}