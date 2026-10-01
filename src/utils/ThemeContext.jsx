// FILE: src/utils/ThemeContext.jsx
import React, { createContext, useContext } from "react";

const ThemeContext = createContext();

export const MODEL_MAP = {
  NAVY_ORANGE: "NAVY_ORANGE",
  PITCH_BLACK: "NAVY_ORANGE",
  DEEP_BLUE: "NAVY_ORANGE",
  CLINICAL_LIGHT: "NAVY_ORANGE",
  DEEP_SAPPHIRE: "NAVY_ORANGE",
  EMERALD_SAGE: "NAVY_ORANGE",
  VELVET_OBSIDIAN: "NAVY_ORANGE",
  WARM_BEIGE: "NAVY_ORANGE"
};

export const ThemeProvider = ({ children }) => {
  return (
    <ThemeContext.Provider value={{ model: "NAVY_ORANGE", setDesignModel: () => {}, cycleDesignModel: () => {}, isLight: false }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    return { model: "NAVY_ORANGE", theme: "NAVY_ORANGE", setDesignModel: () => {}, cycleDesignModel: () => {}, toggleTheme: () => {}, isLight: false };
  }
  return {
    ...context,
    theme: "NAVY_ORANGE",
    toggleTheme: () => {}
  };
};


export default ThemeContext;
