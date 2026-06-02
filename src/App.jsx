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
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--app-bg, #ffffff)' }}>
        <Navbar />
        <main style={{ flex: 1, paddingTop: '100px', paddingBottom: '80px', backgroundColor: 'var(--app-bg, #ffffff)' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/aloha" element={<AlohaCalculator />} />
            <Route path="/prach" element={<PRACHAnalyzer />} />
            <Route path="/latency" element={<LatencyCalculator />} />
            <Route path="/grant-free" element={<GrantFreeRA />} />
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
