import { USE_MOCKS } from "./config";
import * as mockApi from "./mockApi";
import * as realApi from "./realApi"; // placeholder

export * from "./types";

const api = USE_MOCKS ? mockApi : realApi;

export const getLists = api.getLists;
export const getListDetail = api.getListDetail;
export const addItem = api.addItem;
export const toggleItemStatus = api.toggleItemStatus;

export const addList = api.addList;
export const archiveList = api.archiveList;
export const deleteList = api.deleteList;

export const deleteItem = api.deleteItem;
export const editItem = api.editItem;
export const leaveList = api.leaveList;
export const renameList = api.renameList;
