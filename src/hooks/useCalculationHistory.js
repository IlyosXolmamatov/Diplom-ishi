import { useState } from 'react';

const useCalculationHistory = () => {
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('prach_history');
    return saved ? JSON.parse(saved) : [];
  });

  const addEntry = (page, inputs, results) => {
    const entry = {
      id: Date.now(),
      timestamp: new Date().toLocaleString('uz-UZ'),
      page,
      inputs,
      results,
    };
    const newHistory = [entry, ...history].slice(0, 20);
    setHistory(newHistory);
    localStorage.setItem('prach_history', JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('prach_history');
  };

  return { history, addEntry, clearHistory };
};

export default useCalculationHistory;
