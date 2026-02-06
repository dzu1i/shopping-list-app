/* eslint-disable @typescript-eslint/no-unused-vars */
// ListsPage.tsx – mock mode + pending/error/ready + error handling + list count visualization + theme/lang toggles

import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ListsPage.css";
import { getLists, deleteList, addList, archiveList } from "../api";
import { ListPreview, ShoppingItem, Member } from "../api/types";

import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import { applyTheme, getInitialTheme, type ThemeMode } from "../theme";

type LoadStatus = "pending" | "ready" | "error";

const CURRENT_USER_ID = "u1";

const ListsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [lists, setLists] = useState<ListPreview[]>([]);
  const [filter, setFilter] = useState("active");
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemQty, setItemQty] = useState("");
  const [tempItems, setTempItems] = useState<{ name: string; qty: string }[]>(
    []
  );
  const [memberName, setMemberName] = useState("");
  const [tempMembers, setTempMembers] = useState<{ name: string }[]>([]);

  const [status, setStatus] = useState<LoadStatus>("pending");
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [theme, setTheme] = useState<ThemeMode>(() => getInitialTheme());
  const [lang, setLang] = useState<"en" | "cs">(() =>
    i18n.language === "cs" ? "cs" : "en"
  );

  // --- Theme + language ---
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    i18n.changeLanguage(lang);
  }, [lang]);

  // --- Modal helpers (stable for hooks deps) ---
  const resetModalState = useCallback(() => {
    setNewTitle("");
    setItemName("");
    setItemQty("");
    setTempItems([]);
    setMemberName("");
    setTempMembers([]);
  }, []);

  const closeModal = useCallback(() => {
    resetModalState();
    setIsAddOpen(false);
  }, [resetModalState]);

  // --- Data load (stable) ---
  const loadLists = useCallback(async () => {
    try {
      setStatus("pending");
      setError(null);
      const data = await getLists();
      setLists(data);
      setStatus("ready");
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Failed to load lists");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    loadLists();
  }, [loadLists]);

  // --- Safe wrapper for actions ---
  const safeAction = useCallback(async (fn: () => Promise<void>) => {
    try {
      setActionError(null);
      await fn();
    } catch (e) {
      console.error(e);
      setActionError(e instanceof Error ? e.message : "Action failed");
    }
  }, []);

  // --- ESC closes modal (fixed deps) ---
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isAddOpen) closeModal();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isAddOpen, closeModal]);

  // --- Derived lists ---
  const visibleLists =
    filter === "active" ? lists.filter((l) => !l.isArchived) : lists;

  const myLists = visibleLists.filter((l) => l.isOwner);
  const sharedLists = visibleLists.filter((l) => !l.isOwner);

  // --- Handlers ---
  const handleOpenList = (id: string) => {
    navigate(`/lists/${id}`);
  };

  const handleDelete = (id: string) =>
    safeAction(async () => {
      const list = lists.find((l) => l.id === id);
      if (!list || !list.isOwner) return;
      if (!window.confirm("Delete this list?")) return;
      await deleteList(id);
      setLists((prev) => prev.filter((l) => l.id !== id));
    });

  const handleAddItemToTemp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!itemName.trim()) return;
    setTempItems((prev) => [
      ...prev,
      { name: itemName.trim(), qty: itemQty.trim() || "1" },
    ]);
    setItemName("");
    setItemQty("");
  };

  const handleRemoveTempItem = (index: number) => {
    setTempItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddMemberToTemp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!memberName.trim()) return;
    setTempMembers((prev) => [...prev, { name: memberName.trim() }]);
    setMemberName("");
  };

  const handleRemoveTempMember = (index: number) => {
    setTempMembers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddSubmit = (e: React.FormEvent) =>
    safeAction(async () => {
      e.preventDefault();
      const title = newTitle.trim();
      if (!title) return;

      const preparedItems: ShoppingItem[] = tempItems.map((it) => ({
        ...it,
        id: "temp-" + Math.random().toString(36).slice(2),
        done: false,
      }));

      const preparedMembers: Member[] = tempMembers.map((m) => ({
        ...m,
        id: "temp-" + Math.random().toString(36).slice(2),
      }));

      const newList: ListPreview = await addList(
        title,
        preparedItems,
        preparedMembers
      );
      setLists((prev) => [newList, ...prev]);
      closeModal();
    });

  // --- UI states ---
  if (status === "pending") {
    return (
      <div className="lists-page">
        <div className="lists-shell">
          <div className="lists-card">
            <h1 className="lists-title">{t("myLists")}</h1>
            <p className="lists-empty">{t("loadingLists")}</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="lists-page">
        <div className="lists-shell">
          <div className="lists-card">
            <h1 className="lists-title">{t("myLists")}</h1>
            <p className="lists-empty">{t("couldntLoadLists")}</p>
            {error && (
              <p className="lists-empty" style={{ opacity: 0.8 }}>
                {error}
              </p>
            )}
            <button type="button" className="lists-create-btn" onClick={loadLists}>
              {t("retry")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Main render ---
  return (
    <div className="lists-page">
      <div className="lists-shell">
        <div className="lists-card">
          <div className="lists-header-row">
            <h1 className="lists-title">{t("myLists")}</h1>

            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
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
                onClick={() => setTheme((p) => (p === "light" ? "dark" : "light"))}
                title={theme === "light" ? t("darkMode") : t("lightMode")}
              >
                <span>{theme === "light" ? "🌙" : "☀️"}</span>
              </button>

              <button
                className="logout-chip"
                type="button"
                onClick={() => navigate("/")}
              >
                {t("logout")}
              </button>
            </div>
          </div>

          {actionError && (
            <p className="lists-empty" style={{ color: "var(--danger)" }}>
              {actionError}
            </p>
          )}

          <div className="lists-filter-row">
            <span className="lists-filter-label">{t("show")}</span>
            <div className="lists-filter-buttons">
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
                {t("activeAndArchived")}
              </button>
            </div>
          </div>

          <section className="lists-section">
            {myLists.map((list) => {
              const progress =
                list.itemCount === 0
                  ? 0
                  : Math.round((list.doneCount / list.itemCount) * 100);

              return (
                <div key={list.id} className="lists-tile">
                  <button
                    className="lists-tile-button"
                    type="button"
                    onClick={() => handleOpenList(list.id)}
                  >
                    <div className="lists-tile-title-row">
                      <span>{list.title}</span>
                    </div>

                    <div className="lists-tile-meta">
                      <div className="lists-left-badges">
                        <span className="lists-badge-count">
                          {list.itemCount} {t("item", { count: list.itemCount })}
                        </span>

                        {list.isArchived && (
                          <span className="lists-badge-archived">{t("archived")}</span>
                        )}
                      </div>

                      <span className="lists-progress-text">
                        {t("donePercent", { pct: progress })}
                      </span>
                    </div>
                  </button>

                  {list.isOwner && (
                    <button
                      type="button"
                      className="lists-tile-delete"
                      onClick={() => handleDelete(list.id)}
                      title="Delete list"
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}

            {myLists.length === 0 && (
              <p className="lists-empty">
                {lang === "cs"
                  ? "Zatím nemáš žádné seznamy."
                  : "You don't have any lists yet."}
              </p>
            )}
          </section>

          {sharedLists.length > 0 && (
            <>
              <p className="lists-shared-label">{t("sharedLists")}</p>
              <section className="lists-section">
                {sharedLists.map((list) => {
                  const progress =
                    list.itemCount === 0
                      ? 0
                      : Math.round((list.doneCount / list.itemCount) * 100);

                  return (
                    <div key={list.id} className="lists-tile">
                      <button
                        className="lists-tile-button"
                        type="button"
                        onClick={() => handleOpenList(list.id)}
                      >
                        <div className="lists-tile-title-row">
                          <span>{list.title}</span>
                        </div>

                        <div className="lists-tile-meta">
                          <div className="lists-left-badges">
                            <span className="lists-badge-count">
                              {list.itemCount} {t("item", { count: list.itemCount })}
                            </span>

                            {list.isArchived && (
                              <span className="lists-badge-archived">{t("archived")}</span>
                            )}
                          </div>

                          <span className="lists-progress-text">
                            {t("donePercent", { pct: progress })}
                          </span>
                        </div>
                      </button>
                    </div>
                  );
                })}
              </section>
            </>
          )}

          <button
            className="lists-create-btn"
            type="button"
            onClick={() => setIsAddOpen(true)}
          >
            {t("createNewList")}
          </button>
        </div>
      </div>

      {isAddOpen && (
        <div className="lists-modal-backdrop" onClick={closeModal}>
          <div className="lists-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{t("createNewListTitle")}</h2>
            <form onSubmit={handleAddSubmit} className="lists-modal-form">
              <label>
                {t("nameRequired")}
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Weekend groceries"
                  required
                />
              </label>

              <div className="lists-modal-group">
                <div className="lists-modal-group-header">
                  <span>{t("itemsOptional")}</span>
                </div>
                <div className="lists-modal-inline">
                  <input
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder={t("itemName")}
                  />
                  <input
                    value={itemQty}
                    onChange={(e) => setItemQty(e.target.value)}
                    placeholder={t("amount")}
                    className="lists-modal-qty"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddItemToTemp()}
                    className="lists-modal-addbtn"
                  >
                    +
                  </button>
                </div>

                {tempItems.length > 0 && (
                  <ul className="lists-modal-tags">
                    {tempItems.map((it, index) => (
                      <li key={index}>
                        <span className="lists-tag-name">{it.name}</span>
                        <span className="lists-tag-qty">{it.qty}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTempItem(index)}
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="lists-modal-group">
                <div className="lists-modal-group-header">
                  <span>{t("membersOptional")}</span>
                </div>
                <div className="lists-modal-inline">
                  <input
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    placeholder={t("memberName")}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddMemberToTemp()}
                    className="lists-modal-addbtn"
                  >
                    +
                  </button>
                </div>

                {tempMembers.length > 0 && (
                  <ul className="lists-modal-tags">
                    {tempMembers.map((m, index) => (
                      <li key={index}>
                        {m.name}
                        <button
                          type="button"
                          onClick={() => handleRemoveTempMember(index)}
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="lists-modal-actions">
                <button
                  type="button"
                  onClick={closeModal}
                  className="lists-modal-cancel"
                >
                  {t("cancel")}
                </button>
                <button type="submit" className="lists-modal-confirm">
                  {t("create")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListsPage;