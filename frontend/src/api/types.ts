export type Member = {
  id: string;
  name: string;
};

export type ShoppingItem = {
  id: string;
  name: string;
  qty: string;
  done: boolean;
};

export type ShoppingList = {
  id: string;
  title: string;
  createdAt: string;
  ownerId: string;
  isArchived: boolean;
  members: Member[];
  items: ShoppingItem[];
};

export type ListPreview = {
  id: string;
  title: string;
  isArchived: boolean;
  isOwner: boolean;
  itemCount: number;
  doneCount: number;
};
