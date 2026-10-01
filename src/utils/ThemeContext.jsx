// FILE: src/utils/ThemeContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem("ipacx_theme");
    if (saved) return saved;
    // Check hospital config default
    try {
      const hospitalConfigStr = localStorage.getItem("ipacx_hospital_config");
      if (hospitalConfigStr) {
        const conf = JSON.parse(hospitalConfigStr);
        if (conf.defaultTheme) return conf.defaultTheme;
      }
    } catch (e) {}
    return "LIGHT"; // Default to Soft Clinical Light for clean healthcare aesthetic
  });

  useEffect(() => {
    localStorage.setItem("ipacx_theme", theme);
    const root = document.documentElement;
    if (theme === "LIGHT") {
      root.classList.add("theme-light");
      root.classList.remove("theme-dark");
    } else {
      root.classList.add("theme-dark");
      root.classList.remove("theme-light");
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => (prev === "LIGHT" ? "DARK" : "LIGHT"));
  };

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    return { theme: "LIGHT", toggleTheme: () => {}, setTheme: () => {} };
  }
  return context;
};

export default ThemeContext;
