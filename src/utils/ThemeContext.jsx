// FILE: src/utils/ThemeContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [model, setModel] = useState(() => {
    const saved = localStorage.getItem("ipacx_design_model");
    if (saved) return saved;
    try {
      const confStr = localStorage.getItem("ipacx_hospital_config");
      if (confStr) {
        const conf = JSON.parse(confStr);
        if (conf.designModel) return conf.designModel;
      }
    } catch (e) {}
    return "DEEP_BLUE"; // Default to Deep-Blue Medical Device Shell
  });

  useEffect(() => {
    localStorage.setItem("ipacx_design_model", model);
    const root = document.documentElement;

    root.classList.remove("model-pitch-black", "model-deep-blue", "model-clinical-light", "theme-light", "theme-dark");

    if (model === "PITCH_BLACK") {
      root.classList.add("model-pitch-black", "theme-dark");
    } else if (model === "CLINICAL_LIGHT") {
      root.classList.add("model-clinical-light", "theme-light");
    } else {
      root.classList.add("model-deep-blue", "theme-dark");
    }
  }, [model]);

  const setDesignModel = (newModel) => {
    setModel(newModel);
  };

  const cycleDesignModel = () => {
    setModel(prev => {
      if (prev === "PITCH_BLACK") return "DEEP_BLUE";
      if (prev === "DEEP_BLUE") return "CLINICAL_LIGHT";
      return "PITCH_BLACK";
    });
  };

  return (
    <ThemeContext.Provider value={{ model, setDesignModel, cycleDesignModel, isLight: model === "CLINICAL_LIGHT" }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    return { model: "DEEP_BLUE", setDesignModel: () => {}, cycleDesignModel: () => {}, isLight: false };
  }
  return context;
};

export default ThemeContext;

