export type ThemeMode = "light" | "dark";

const KEY = "shoppinglist.theme";

export function getInitialTheme(): ThemeMode {
  const saved = localStorage.getItem(KEY) as ThemeMode | null;
  if (saved === "light" || saved === "dark") return saved;
  return "light";
}

export function applyTheme(mode: ThemeMode) {
  document.documentElement.setAttribute("data-theme", mode);
  localStorage.setItem(KEY, mode);
}