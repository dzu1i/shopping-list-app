import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/LoginPage.css";

import { Trans, useTranslation } from "react-i18next";
import i18n from "../i18n";
import { applyTheme, getInitialTheme, type ThemeMode } from "../theme";

const MOCK_USER_NAME = "Julie";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [theme, setTheme] = useState<ThemeMode>(() => getInitialTheme());
  const [lang, setLang] = useState<"en" | "cs">(() =>
    i18n.language === "cs" ? "cs" : "en"
  );

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    i18n.changeLanguage(lang);
  }, [lang]);

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-topbar">
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
        </div>

        <h1 className="login-title">{t("Shopping list APP")}</h1>

        <p className="login-subtitle">
          <Trans i18nKey="loginSubtitle" values={{ name: MOCK_USER_NAME }} components={{ strong: <strong /> }} />
        </p>

        <button className="login-btn" onClick={() => navigate("/lists")}>
          {t("letsShop")}
        </button>
      </div>
    </div>
  );
};

export default LoginPage;