// ThemeProvider.jsx
import { createContext, useContext, useEffect, useState } from "react";

const ThemeCtx = createContext({ theme: "light", setTheme: () => {} });

export const useTheme = () => useContext(ThemeCtx);

export default function ThemeProvider({ children }) {
  const getInitial = () => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };
  const [theme, setTheme] = useState(getInitial);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("theme-dark");
    else root.classList.remove("theme-dark");
    localStorage.setItem("theme", theme);
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    const lightColor = "#ffffff";
    const darkColor = "#0d0d0d";

    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", theme === "dark" ? darkColor : lightColor);
    }
  }, [theme]);

  // sync with OS changes if user never explicitly chose
  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = e => {
      const saved = localStorage.getItem("theme");
      if (!saved) setTheme(e.matches ? "dark" : "light");
    };
    mql.addEventListener?.("change", handler);
    return () => mql.removeEventListener?.("change", handler);
  }, []);

  return <ThemeCtx.Provider value={{ theme, setTheme }}>{children}</ThemeCtx.Provider>;
}
