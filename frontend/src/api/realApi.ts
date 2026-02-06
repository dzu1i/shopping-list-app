import { ListPreview, ShoppingItem, ShoppingList, Member } from "./types";
import { CURRENT_USER_ID, API_BASE_URL } from "./config";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = API_BASE_URL ? `${API_BASE_URL}${path}` : path;

  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "x-user-id": CURRENT_USER_ID,
      ...(init?.headers ?? {}),
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data?.message || data?.errorCode || "Request failed";
    throw new Error(msg);
  }

  return data as T;
}

function mapItem(it: any): ShoppingItem {
  return {
    id: it._id ?? it.id,
    name: it.name,
    qty: it.quantity ?? it.qty ?? "1",
    done: !!(it.isDone ?? it.done),
  };
}

function mapMember(m: any): Member {
  if (typeof m === "string") return { id: m, name: m.slice(0, 6) };
  return {
    id: m._id ?? m.id ?? String(m),
    name: m.name ?? (m._id ? String(m._id).slice(0, 6) : "Member"),
  };
}

/** GET /api/shopping-lists */
export async function getLists(): Promise<ListPreview[]> {
  const res = await request<{ list: any[] }>("/api/shopping-lists");

  // pokud tvůj backend v listu NEvrací itemCount/doneCount, dotahujeme přes /items
  const previews = await Promise.all(
    res.list.map(async (l) => {
      const id = l._id ?? l.id;
      const itemsRaw = await request<any[]>(`/api/shopping-lists/${id}/items`);
      const items = itemsRaw.map(mapItem);

      return {
        id,
        title: l.name ?? l.title ?? "Untitled",
        isArchived: !!l.isArchived,
        isOwner: (l.ownerId?.toString?.() ?? l.ownerId) === CURRENT_USER_ID,
        itemCount: items.length,
        doneCount: items.filter((i) => i.done).length,
      } as ListPreview;
    })
  );

  return previews;
}

/** GET /api/shopping-lists/:listId */
export async function getListDetail(id: string): Promise<ShoppingList> {
  const l = await request<any>(`/api/shopping-lists/${id}`);
  const itemsRaw = await request<any[]>(`/api/shopping-lists/${id}/items`);

  return {
    id: l._id ?? l.id,
    title: l.name ?? l.title,
    createdAt: l.createdAt ?? new Date().toISOString(),
    ownerId: l.ownerId?.toString?.() ?? l.ownerId,
    isArchived: !!l.isArchived,
    members: (l.members ?? []).map(mapMember),
    items: (itemsRaw ?? []).map(mapItem),
  };
}

/** POST /api/shopping-lists/:listId/items */
export async function addItem(listId: string, name: string, qty: string): Promise<ShoppingItem> {
  const created = await request<any>(`/api/shopping-lists/${listId}/items`, {
    method: "POST",
    body: JSON.stringify({ name, quantity: qty }),
  });
  return mapItem(created);
}

/** POST resolve/unresolve */
export async function toggleItemStatus(
  listId: string,
  itemId: string,
  nextDone: boolean
): Promise<ShoppingItem> {
  const endpoint = nextDone ? "resolve" : "unresolve";
  const updated = await request<any>(
    `/api/shopping-lists/${listId}/items/${itemId}/${endpoint}`,
    { method: "POST" }
  );
  return mapItem(updated);
}

export async function addList(title: string, _items: ShoppingItem[], _members: Member[]): Promise<ListPreview> {
  const created = await request<any>("/api/shopping-lists", {
    method: "POST",
    body: JSON.stringify({ name: title }),
  });

  return {
    id: created._id ?? created.id,
    title: created.name ?? created.title,
    isArchived: !!created.isArchived,
    isOwner: true,
    itemCount: 0,
    doneCount: 0,
  };
}

export async function archiveList(id: string): Promise<void> {
  await request(`/api/shopping-lists/${id}/archive`, { method: "PATCH" });
}

export async function deleteList(id: string): Promise<void> {
  await request(`/api/shopping-lists/${id}`, { method: "DELETE" });
}

export async function deleteItem(listId: string, itemId: string): Promise<void> {
  await request(`/api/shopping-lists/${listId}/items/${itemId}`, { method: "DELETE" });
}

export async function editItem(listId: string, itemId: string, patch: Partial<ShoppingItem>): Promise<ShoppingItem> {
  const updated = await request<any>(`/api/shopping-lists/${listId}/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify({
      name: patch.name,
      quantity: patch.qty,
      isDone: patch.done,
    }),
  });
  return mapItem(updated);
}

export async function leaveList(listId: string): Promise<void> {
  await request(`/api/shopping-lists/${listId}/leave`, { method: "POST" });
}

export async function renameList(listId: string, title: string): Promise<void> {
  await request(`/api/shopping-lists/${listId}`, {
    method: "PATCH",
    body: JSON.stringify({ name: title }),
  });
}