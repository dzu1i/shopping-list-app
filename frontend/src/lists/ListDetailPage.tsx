/* eslint-disable @typescript-eslint/no-unused-vars */
// ListDetailPage.tsx – mock mode + pending/error/ready + charts + theme/lang toggles

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CURRENT_USER_ID } from "../api/config";
import "../styles/ListDetailPage.css";
import ItemList, { Item } from "../components/ItemList";
import ActionButtons from "../components/ActionButtons";
import {
  getListDetail,
  addItem as apiAddItem,
  toggleItemStatus as apiToggleItem,
  deleteItem as apiDeleteItem,
  editItem as apiEditItem,
  leaveList as apiLeaveList,
  deleteList as apiDeleteList,
  archiveList as apiArchiveList,
  renameList as apiRenameList,
} from "../api";
import { ShoppingList as ApiShoppingList } from "../api/types";

import { useTranslation } from "react-i18next";
import { DonePieChart } from "../components/Charts";
import i18n from "../i18n";
import { applyTheme, getInitialTheme, type ThemeMode } from "../theme";

type LoadStatus = "pending" | "ready" | "error";

export type Member = {
  id: string;
  name: string;
};

export type ShoppingList = {
  id: string;
  title: string;
  createdAt: string;
  ownerId: string;
  members: Member[];
  items: Item[];
};

export default function ListDetailPage() {
  const { t } = useTranslation();
  const { listId } = useParams();
  const navigate = useNavigate();

  const [list, setList] = useState<ShoppingList | null>(null);
  const [backup, setBackup] = useState<ShoppingList | null>(null);
  const [edit, setEdit] = useState(false);

  const [filter, setFilter] = useState<"all" | "active">("all");
  const [prevFilter, setPrevFilter] = useState<"all" | "active">("all");
  const [sortMode, setSortMode] = useState<"default" | "az">("default");

  const [newItemName, setNewItemName] = useState("");
  const [newItemQty, setNewItemQty] = useState("");
  const [newMemberName, setNewMemberName] = useState("");

  const [status, setStatus] = useState<LoadStatus>("pending");
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // theme + language
  const [theme, setTheme] = useState<ThemeMode>(() => getInitialTheme());
  const [lang, setLang] = useState<"en" | "cs">(() =>
    i18n.language === "cs" ? "cs" : "en"
  );

  const toggleTheme = () => {
  const next: ThemeMode = theme === "light" ? "dark" : "light";
  applyTheme(next);     // 👈 hned teď nastav data-theme + localStorage
  setTheme(next);
  };

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    i18n.changeLanguage(lang);
  }, [lang]);

  const safeAction = async (fn: () => Promise<void>) => {
    try {
      setActionError(null);
      await fn();
    } catch (e) {
      console.error(e);
      setActionError(e instanceof Error ? e.message : "Action failed");
    }
  };

  const loadDetail = async () => {
    if (!listId) return;
    try {
      setStatus("pending");
      setError(null);

      const api: ApiShoppingList = await getListDetail(listId);
      const mapped: ShoppingList = {
        id: api.id,
        title: api.title,
        createdAt: api.createdAt,
        ownerId: api.ownerId ?? CURRENT_USER_ID,
        members: api.members ?? [{ id: CURRENT_USER_ID, name: "Julie" }],
        items: api.items,
      };

      setList(mapped);
      setBackup(structuredClone(mapped));
      setStatus("ready");
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Failed to load list detail");
      setStatus("error");
    }
  };

  useEffect(() => {
    loadDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listId]);

  const isOwner = list?.ownerId === CURRENT_USER_ID;
  const isMember = list?.members.some((m) => m.id === CURRENT_USER_ID);
  const allDone = useMemo(() => list?.items.every((i) => i.done), [list?.items]);
  const dateStr = list ? new Date(list.createdAt).toLocaleDateString("cs-CZ") : "";

  const doneCount = list ? list.items.filter((i) => i.done).length : 0;
  const activeCount = list ? list.items.length - doneCount : 0;

  const visibleItems = useMemo(() => {
    if (!list) return [];
    let items = [...list.items];
    let active = items.filter((i) => !i.done);
    let doneItems = items.filter((i) => i.done);

    if (filter === "active") doneItems = [];

    const collator = new Intl.Collator("cs-CZ", { sensitivity: "base" });
    if (sortMode === "az") {
      active = [...active].sort((a, b) => collator.compare(a.name, b.name));
      doneItems = [...doneItems].sort((a, b) => collator.compare(a.name, b.name));
    }

    return [...active, ...doneItems];
  }, [list, filter, sortMode]);

  const toggleItem = async (id: string) => {
    if (!list) return;

    const current = list.items.find((i) => i.id === id);
    if (!current) return;

    const nextDone = !current.done;

    // optimistic UI update
    setList((prev) =>
      prev
        ? {
            ...prev,
            items: prev.items.map((i) => (i.id === id ? { ...i, done: nextDone } : i)),
          }
        : prev
    );

    await safeAction(async () => {
      // ✅ nový podpis: (listId, itemId, nextDone)
      const updated = await apiToggleItem(list.id, id, nextDone);

      // sync UI with backend response (just in case)
      setList((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((i) =>
                i.id === id
                  ? {
                      ...i,
                      done: updated.done,
                      // kdyby backend někdy vrátil qty/name update
                      name: updated.name ?? i.name,
                      qty: updated.qty ?? i.qty,
                    }
                  : i
              ),
            }
          : prev
      );
    });
  };

  const changeItem = (id: string, patch: Partial<Item>) =>
    setList((prev) =>
      prev
        ? { ...prev, items: prev.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) }
        : prev
    );

  const toggleAll = () =>
    setList((prev) =>
      prev ? { ...prev, items: prev.items.map((i) => ({ ...i, done: !allDone })) } : prev
    );

  const handleTitleChange = (value: string) => {
    if (!isOwner || !list) return;
    setList({ ...list, title: value });
  };

  const handleEdit = () => {
    if (!list) return;
    setBackup(structuredClone(list));
    setPrevFilter(filter);
    setFilter("all");
    setEdit(true);
  };

  const handleDone = () => {
    setEdit(false);
    setFilter(prevFilter);
  };

  const handleCancel = () => {
    if (!backup) return;
    setList(structuredClone(backup));
    setEdit(false);
    setFilter(prevFilter);
  };

  const handleAddItem = (e: React.FormEvent) =>
    safeAction(async () => {
      e.preventDefault();
      if (!isOwner || !list || !newItemName.trim()) return;

      const qty = newItemQty.trim() || "1";
      const created = await apiAddItem(list.id, newItemName.trim(), qty);

      const newItem: Item = {
        id: created.id,
        name: created.name,
        qty: created.qty ?? qty,
        done: created.done ?? false,
      };

      setList((prev) => (prev ? { ...prev, items: [...prev.items, newItem] } : prev));
      setNewItemName("");
      setNewItemQty("");
    });

  const handleRemoveItem = (id: string) => {
    if (!isOwner || !list) return;

    // optimistic UI
    setList({ ...list, items: list.items.filter((i) => i.id !== id) });

    safeAction(async () => {
      await apiDeleteItem(list.id, id);
    });
  };
  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner || !list || !newMemberName.trim()) return;
    const newMember: Member = { id: "u" + Date.now(), name: newMemberName.trim() };
    setList({ ...list, members: [...list.members, newMember] });
    setNewMemberName("");
  };

  const handleRemoveMember = (id: string) => {
    if (!isOwner || !list || id === list.ownerId) return;
    setList({ ...list, members: list.members.filter((m) => m.id !== id) });
  };

  const handleLeaveList = () =>
    safeAction(async () => {
      if (!list || !isMember || isOwner) return;
      if (!window.confirm("Leave this shopping list?")) return;
      await apiLeaveList(list.id, CURRENT_USER_ID);
      navigate("/lists");
    });

  const handleDelete = () =>
    safeAction(async () => {
      if (!list || !window.confirm("Delete this list?")) return;
      await apiDeleteList(list.id);
      navigate("/lists");
    });

  const handleArchive = () =>
    safeAction(async () => {
      if (!list || !window.confirm("Archive this list?")) return;
      await apiArchiveList(list.id);
      navigate("/lists");
    });

  // ===== RENDER STATES =====
  if (status === "pending") return <p>{t("loadingList")}</p>;

  if (status === "error") {
    return (
      <div className="detail-page">
        <div className="detail-card">
          <button className="back-chip" type="button" onClick={() => navigate("/lists")}>
            {t("back")}
          </button>

          <p>{t("couldntLoadList")}</p>
          {error && <p style={{ opacity: 0.8 }}>{error}</p>}
          <button type="button" onClick={loadDetail}>
            {t("retry")}
          </button>
        </div>
      </div>
    );
  }

  if (!list) return <p>{t("loadingList")}</p>;

  const roleLabel = isOwner ? t("youAreOwner") : isMember ? t("youAreMember") : t("viewer");

  return (
    <div className="detail-page">
      <div className="detail-card">
        <div className="detail-topbar">
          <button className="back-chip" type="button" onClick={() => navigate("/lists")}>
            {t("back")}
          </button>

          <div className="detail-topbar-right">
            <button
              type="button"
              className="logout-chip"
              onClick={() => setLang((p) => (p === "en" ? "cs" : "en"))}
              title={lang === "en" ? "Switch to Czech" : "Switch to English"}
            >
              {lang === "en" ? "CS" : "EN"}
            </button>

            <button
              type="button"
              className="logout-chip theme-chip"
              onClick={toggleTheme} 
              title={theme === "light" ? t("darkMode") : t("lightMode")}
            >
              <span>{theme === "light" ? "🌙" : "☀️"}</span>
            </button>
          </div>
        </div>

        {actionError && <p style={{ color: "var(--danger)", marginTop: 8 }}>{actionError}</p>}

        <div className="detail-header">
          <div className="detail-header-main">
            {edit && isOwner ? (
              <input
                className="title-input"
                value={list.title}
                onChange={(e) => handleTitleChange(e.target.value)}
              />
            ) : (
              <h1 className="title">{list.title}</h1>
            )}
            <div className="date">{dateStr}</div>
          </div>
        </div>

        <div className="detail-panel">
          {/* CHART moved INSIDE panel */}
          <div className="chart-card">
            <div className="chart-head">
              <span className="chart-title">{t("doneVsActive")}</span>
              <span className="chart-sub">
                {t("done")}: {doneCount} · {t("active")}: {activeCount}
              </span>
            </div>
            <DonePieChart
              done={doneCount}
              active={activeCount}
              labels={{ done: t("done"), active: t("active") }}
            />
          </div>

          <div className="members-box">
            <div className="members-header">
              <span>{t("members")}</span>
              <span className="role-badge">{roleLabel}</span>
            </div>

            <div className="members-list">
              {list.members.map((m) => (
                <div key={m.id} className="member-pill">
                  <span>
                    {m.name}
                    {m.id === list.ownerId ? " (owner)" : ""}
                  </span>
                  {edit && isOwner && m.id !== list.ownerId && (
                    <button className="member-remove" onClick={() => handleRemoveMember(m.id)}>
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            {edit && isOwner && (
              <form className="members-add" onSubmit={handleAddMember}>
                <input
                  placeholder={t("memberName")}
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                />
                <button type="submit">{t("add")}</button>
              </form>
            )}
          </div>

          {!edit && (
            <div className="filter-row">
              <div className="filter-left">
                <button
                  type="button"
                  className={`toggle-all-square ${allDone ? "checked" : ""}`}
                  onClick={toggleAll}
                  title="Mark all as done/undone"
                >
                  {t("markAll")}
                </button>

                <div className="filter-group">
                  <span className="filter-label">{t("show")}</span>
                  <div className="filter-buttons">
                    <button
                      type="button"
                      className={filter === "active" ? "active" : ""}
                      onClick={() => setFilter("active")}
                    >
                      {t("activeOnly")}
                    </button>
                    <button
                      type="button"
                      className={filter === "all" ? "active" : ""}
                      onClick={() => setFilter("all")}
                    >
                      {lang === "cs" ? "Všechny položky" : "All items"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="filter-group">
                <span className="filter-label">{t("sort")}</span>
                <div className="filter-buttons">
                  <button
                    type="button"
                    className={sortMode === "default" ? "active" : ""}
                    onClick={() => setSortMode("default")}
                  >
                    {t("default")}
                  </button>
                  <button
                    type="button"
                    className={sortMode === "az" ? "active" : ""}
                    onClick={() => setSortMode("az")}
                  >
                    {t("az")}
                  </button>
                </div>
              </div>
            </div>
          )}

          <ItemList
            items={visibleItems}
            edit={edit}
            isOwner={isOwner}
            onToggle={toggleItem}
            onChange={changeItem}
            onRemove={handleRemoveItem}
          />

          {/* QUICK ADD — pod položky, nad ActionButtons */}
          {isOwner && (
            <form className="quick-add" onSubmit={handleAddItem}>
              <div className="quick-add-check" aria-hidden="true">
                <span />
              </div>

              <input
                className="quick-add-name"
                placeholder={t("itemName")}
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                disabled={!isOwner}
              />

              <input
                className="quick-add-qty"
                placeholder={t("amount")}
                value={newItemQty}
                onChange={(e) => setNewItemQty(e.target.value)}
                disabled={!isOwner}
              />

              <button
                className="quick-add-btn"
                type="submit"
                title={t("add")}
                disabled={!newItemName.trim()}
              >
                +
              </button>
            </form>
          )}
          <ActionButtons
            edit={edit}
            onEdit={handleEdit}
            onDone={handleDone}
            onCancel={handleCancel}
            onArchive={isOwner ? handleArchive : undefined}
            onDelete={isOwner ? handleDelete : undefined}
            onLeave={!isOwner && isMember ? handleLeaveList : undefined}
            isOwner={!!isOwner}
            isMember={!!isMember}
          />
        </div>
      </div>
    </div>
  );
}