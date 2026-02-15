"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface AssetsContextType {
  assets: Record<string, File | null>;
  setAssets: React.Dispatch<React.SetStateAction<Record<string, File | null>>>;
}

const AssetsContext = createContext<AssetsContextType | undefined>(undefined);

export function AssetsProvider({ children }: { children: ReactNode }) {
  const [assets, setAssets] = useState<Record<string, File | null>>({
    "front-top-left": null,
    "front-center": null,
    "back-top": null,
    "back-bottom": null,
  });

  return (
    <AssetsContext.Provider value={{ assets, setAssets }}>
      {children}
    </AssetsContext.Provider>
  );
}

export function useAssets() {
  const context = useContext(AssetsContext);
  if (context === undefined) {
    throw new Error("useAssets must be used within an AssetsProvider");
  }
  return context;
}
