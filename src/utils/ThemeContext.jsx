// FILE: src/utils/ThemeContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const MODEL_MAP = {
  PITCH_BLACK: "DEEP_SAPPHIRE",
  DEEP_BLUE: "DEEP_SAPPHIRE",
  CLINICAL_LIGHT: "WARM_BEIGE",
  DEEP_SAPPHIRE: "DEEP_SAPPHIRE",
  EMERALD_SAGE: "EMERALD_SAGE",
  VELVET_OBSIDIAN: "VELVET_OBSIDIAN",
  WARM_BEIGE: "WARM_BEIGE"
};

export const ThemeProvider = ({ children }) => {
  const [model, setModel] = useState(() => {
    const saved = localStorage.getItem("ipacx_design_model");
    if (saved && MODEL_MAP[saved]) return MODEL_MAP[saved];
    try {
      const confStr = localStorage.getItem("ipacx_hospital_config");
      if (confStr) {
        const conf = JSON.parse(confStr);
        if (conf.designModel && MODEL_MAP[conf.designModel]) return MODEL_MAP[conf.designModel];
      }
    } catch (e) {}
    return "DEEP_SAPPHIRE"; // Default to Deep Sapphire Midnight Glass (Sleek, Premium, Zero Glare)
  });

  useEffect(() => {
    const activeModel = MODEL_MAP[model] || "DEEP_SAPPHIRE";
    localStorage.setItem("ipacx_design_model", activeModel);
    const root = document.documentElement;

    root.classList.remove(
      "model-deep-sapphire",
      "model-emerald-sage",
      "model-velvet-obsidian",
      "model-warm-beige",
      "model-pitch-black",
      "model-deep-blue",
      "model-clinical-light",
      "theme-dark",
      "theme-light"
    );

    if (activeModel === "WARM_BEIGE") {
      root.classList.add("model-warm-beige", "theme-light");
    } else if (activeModel === "EMERALD_SAGE") {
      root.classList.add("model-emerald-sage", "theme-dark");
    } else if (activeModel === "VELVET_OBSIDIAN") {
      root.classList.add("model-velvet-obsidian", "theme-dark");
    } else {
      root.classList.add("model-deep-sapphire", "theme-dark");
    }
  }, [model]);

  const setDesignModel = (newModel) => {
    setModel(MODEL_MAP[newModel] || newModel);
  };

  const cycleDesignModel = () => {
    setModel(prev => {
      const current = MODEL_MAP[prev] || "DEEP_SAPPHIRE";
      if (current === "DEEP_SAPPHIRE") return "EMERALD_SAGE";
      if (current === "EMERALD_SAGE") return "VELVET_OBSIDIAN";
      if (current === "VELVET_OBSIDIAN") return "WARM_BEIGE";
      return "DEEP_SAPPHIRE";
    });
  };

  const isLight = (MODEL_MAP[model] || "DEEP_SAPPHIRE") === "WARM_BEIGE";

  return (
    <ThemeContext.Provider value={{ model: MODEL_MAP[model] || "DEEP_SAPPHIRE", setDesignModel, cycleDesignModel, isLight }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    return { model: "DEEP_SAPPHIRE", theme: "DEEP_SAPPHIRE", setDesignModel: () => {}, cycleDesignModel: () => {}, toggleTheme: () => {}, isLight: false };
  }
  return {
    ...context,
    theme: context.model,
    toggleTheme: context.cycleDesignModel
  };
};

export default ThemeContext;
