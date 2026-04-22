// app/contexts/OpenerContext.tsx
"use client";
import React, { createContext, useContext, useState } from "react";

type OpenerContextType = {
  isSelectorOpen: boolean;
  setIsSelectorOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  // add more openers as needed
};

const OpenerContext = createContext<OpenerContextType | null>(null);

export const OpenerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <OpenerContext.Provider value={{ isSelectorOpen, setIsSelectorOpen, isSidebarOpen, setIsSidebarOpen }}>
      {children}
    </OpenerContext.Provider>
  );
};

export const useOpeners = () => {
  const ctx = useContext(OpenerContext);
  if (!ctx) throw new Error("useOpeners must be used within OpenerProvider");
  return ctx;
};
