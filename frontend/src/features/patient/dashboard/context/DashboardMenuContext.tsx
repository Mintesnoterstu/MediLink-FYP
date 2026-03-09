import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface DashboardMenuContextType {
  menuOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
}

const DashboardMenuContext = createContext<DashboardMenuContextType | undefined>(undefined);

export function DashboardMenuProvider({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const openMenu = useCallback(() => setMenuOpen(true), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <DashboardMenuContext.Provider value={{ menuOpen, openMenu, closeMenu }}>
      {children}
    </DashboardMenuContext.Provider>
  );
}

export function useDashboardMenu() {
  const ctx = useContext(DashboardMenuContext);
  if (ctx === undefined) {
    throw new Error('useDashboardMenu must be used within DashboardMenuProvider');
  }
  return ctx;
}
