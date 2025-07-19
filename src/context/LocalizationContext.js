import React, { createContext, useContext } from 'react';
import * as Localization from 'expo-localization';

const LocalizationContext = createContext();

// Create a simple locale hook for React Navigation compatibility
const createLocaleHook = () => {
  return () => {
    const locale = Localization.locale || 'en-US';
    const isRTL = Localization.isRTL || false;
    
    return {
      locale,
      isRTL,
      currency: Localization.currency,
      region: Localization.region,
    };
  };
};

// Make useLocale available globally for React Navigation
if (typeof global !== 'undefined') {
  global.useLocale = createLocaleHook();
}

export const LocalizationProvider = ({ children }) => {
  const locale = Localization.locale || 'en-US';
  
  const value = {
    locale,
    isRTL: Localization.isRTL || false,
    currency: Localization.currency || null,
    region: Localization.region || null,
  };

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocale = () => {
  const context = useContext(LocalizationContext);
  if (!context) {
    // Fallback to expo-localization if context is not available
    const locale = Localization.locale || 'en-US';
    return {
      locale,
      isRTL: Localization.isRTL || false,
      currency: Localization.currency || null,
      region: Localization.region || null,
    };
  }
  return context;
};