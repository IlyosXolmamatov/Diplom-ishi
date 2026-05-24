import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HistoryPanel from './components/HistoryPanel';
import Home from './pages/Home';
import AlohaCalculator from './pages/AlohaCalculator';
import PRACHAnalyzer from './pages/PRACHAnalyzer';
import LatencyCalculator from './pages/LatencyCalculator';
import GrantFreeRA from './pages/GrantFreeRA';
import Comparison from './pages/Comparison';
import useCalculationHistory from './hooks/useCalculationHistory';
import './App.css'

function App() {
  const { history, clearHistory } = useCalculationHistory();

  useEffect(() => {
    // Initialize dark mode from localStorage
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'true') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950">
        <Navbar />
        <main className="grow pt-32 pb-20 bg-white dark:bg-gray-950">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/aloha" element={<AlohaCalculator />} />
            <Route path="/prach" element={<PRACHAnalyzer />} />
            <Route path="/latency" element={<LatencyCalculator />} />
            <Route path="/grantfree" element={<GrantFreeRA />} />
            <Route path="/comparison" element={<Comparison />} />
          </Routes>
        </main>
        <Footer />
        <HistoryPanel history={history} onClear={clearHistory} />
      </div>
    </BrowserRouter>
  );
}

export default App;
