import React, { createContext, useContext, useMemo, useState } from "react";

const LayoutContext = createContext(null);

export function LayoutProvider({ children }) {
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const [isContentPaddingHidden, setIsContentPaddingHidden] = useState(false);

  const value = useMemo(
    () => ({
      isSidebarHidden,
      setIsSidebarHidden,
      isHeaderHidden,
      setIsHeaderHidden,
      isContentPaddingHidden,
      setIsContentPaddingHidden,
    }),
    [isSidebarHidden, isHeaderHidden, isContentPaddingHidden]
  );

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useLayout must be used within LayoutProvider");
  }
  return context;
}

