"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface WaitlistContextType {
  refreshTrigger: number;
  celebrating: boolean;
  handleSuccess: (count: number) => void;
  clearCelebration: () => void;
}

const WaitlistContext = createContext<WaitlistContextType>({
  refreshTrigger: 0,
  celebrating: false,
  handleSuccess: () => {},
  clearCelebration: () => {},
});

export function useWaitlist() {
  return useContext(WaitlistContext);
}

export function WaitlistProvider({ children }: { children: ReactNode }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [celebrating, setCelebrating] = useState(false);

  const handleSuccess = useCallback((count: number) => {
    void count;
    setCelebrating(true);
    setRefreshTrigger((r) => r + 1);
  }, []);

  const clearCelebration = useCallback(() => {
    setCelebrating(false);
  }, []);

  return (
    <WaitlistContext.Provider
      value={{ refreshTrigger, celebrating, handleSuccess, clearCelebration }}
    >
      {children}
    </WaitlistContext.Provider>
  );
}
