import React, { createContext, useContext, useState } from 'react';

const AIContext = createContext();

export const AIProvider = ({ children }) => {
  const [aiState, setAiState] = useState({
    isConnected: false,
    isLoading: false,
    currentPersonality: null,
    compatibility: null,
  });

  const value = {
    aiState,
    setAiState,
  };

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};