// FILE: src/utils/ThemeContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

const MODEL_MAP = {
  PITCH_BLACK: "WARM_BEIGE",
  DEEP_BLUE: "LIGHT_BLUE",
  CLINICAL_LIGHT: "LIGHT_GREEN",
  WARM_BEIGE: "WARM_BEIGE",
  LIGHT_GREEN: "LIGHT_GREEN",
  LIGHT_BLUE: "LIGHT_BLUE"
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
    return "WARM_BEIGE"; // Default to Warm Beige & Grey (Ultra Soothing & Eye-Friendly)
  });

  useEffect(() => {
    const activeModel = MODEL_MAP[model] || "WARM_BEIGE";
    localStorage.setItem("ipacx_design_model", activeModel);
    const root = document.documentElement;

    root.classList.remove(
      "model-warm-beige",
      "model-light-green",
      "model-light-blue",
      "model-pitch-black",
      "model-deep-blue",
      "model-clinical-light",
      "theme-dark"
    );

    root.classList.add("theme-light");

    if (activeModel === "LIGHT_GREEN") {
      root.classList.add("model-light-green");
    } else if (activeModel === "LIGHT_BLUE") {
      root.classList.add("model-light-blue");
    } else {
      root.classList.add("model-warm-beige");
    }
  }, [model]);

  const setDesignModel = (newModel) => {
    setModel(MODEL_MAP[newModel] || newModel);
  };

  const cycleDesignModel = () => {
    setModel(prev => {
      const current = MODEL_MAP[prev] || "WARM_BEIGE";
      if (current === "WARM_BEIGE") return "LIGHT_GREEN";
      if (current === "LIGHT_GREEN") return "LIGHT_BLUE";
      return "WARM_BEIGE";
    });
  };

  return (
    <ThemeContext.Provider value={{ model: MODEL_MAP[model] || "WARM_BEIGE", setDesignModel, cycleDesignModel, isLight: true }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    return { model: "WARM_BEIGE", theme: "WARM_BEIGE", setDesignModel: () => {}, cycleDesignModel: () => {}, toggleTheme: () => {}, isLight: true };
  }
  return {
    ...context,
    theme: context.model,
    toggleTheme: context.cycleDesignModel
  };
};

export default ThemeContext;


