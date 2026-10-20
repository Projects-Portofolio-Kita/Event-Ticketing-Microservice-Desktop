/**
 * NavigationContext for TickId Desktop Application
 * Manages typed client-side screen routing without backend dependencies
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { ScreenType, NavigationContextType } from '../types/navigation';

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export interface NavigationProviderProps {
  children: React.ReactNode;
  initialScreen?: ScreenType;
  initialEventId?: string;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({
  children,
  initialScreen = 'discover',
  initialEventId = 'coldplay-2026'
}) => {
  const [activeScreen, setActiveScreen] = useState<ScreenType>(initialScreen);
  const [selectedEventId, setSelectedEventId] = useState<string>(initialEventId);
  const [history, setHistory] = useState<ScreenType[]>([]);

  const navigateTo = useCallback((screen: ScreenType, eventId?: string) => {
    setHistory(prev => [...prev, activeScreen]);
    setActiveScreen(screen);
    if (eventId) {
      setSelectedEventId(eventId);
    }
  }, [activeScreen]);

  const goBack = useCallback(() => {
    if (history.length === 0) {
      setActiveScreen('discover');
      return;
    }
    const prevScreen = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    setActiveScreen(prevScreen);
  }, [history]);

  const value = useMemo<NavigationContextType>(() => ({
    activeScreen,
    selectedEventId,
    navigateTo,
    goBack
  }), [activeScreen, selectedEventId, navigateTo, goBack]);

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
