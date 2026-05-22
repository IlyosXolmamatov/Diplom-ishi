import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import AlohaCalculator from './pages/AlohaCalculator';
import PRACHAnalyzer from './pages/PRACHAnalyzer';
import LatencyCalculator from './pages/LatencyCalculator';
import GrantFreeRA from './pages/GrantFreeRA';
import Comparison from './pages/Comparison';
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow pt-16">
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
      </div>
    </BrowserRouter>
  );
}

export default App;
