import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, Moon, Sun } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true' ||
      document.documentElement.getAttribute('data-theme') === 'dark';
    setIsDark(darkMode);

    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, []);

  const toggleDarkMode = () => {
    const html = document.documentElement;
    const newDarkState = !isDark;

    if (newDarkState) {
      html.setAttribute('data-theme', 'dark');
    } else {
      html.removeAttribute('data-theme');
    }

    setIsDark(newDarkState);
    localStorage.setItem('darkMode', String(newDarkState));
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar" data-theme={isDark ? 'dark' : ''}>
      <div className="navbar-container">
        <div className="navbar-logo">5G PRACH</div>

        <div className="navbar-menu-desktop">
          <NavLink to="/" className={({ isActive }) => `navbar-nav-link ${isActive ? 'active' : ''}`}>Home</NavLink>
          <NavLink to="/aloha" className={({ isActive }) => `navbar-nav-link ${isActive ? 'active' : ''}`}>ALOHA</NavLink>
          <NavLink to="/prach" className={({ isActive }) => `navbar-nav-link ${isActive ? 'active' : ''}`}>PRACH</NavLink>
          <NavLink to="/latency" className={({ isActive }) => `navbar-nav-link ${isActive ? 'active' : ''}`}>Kechikish</NavLink>
          <NavLink to="/grant-free" className={({ isActive }) => `navbar-nav-link ${isActive ? 'active' : ''}`}>Grant-free</NavLink>
          <NavLink to="/comparison" className={({ isActive }) => `navbar-nav-link ${isActive ? 'active' : ''}`}>Taqqoslash</NavLink>
        </div>

        <div className="navbar-controls">
          <button onClick={toggleDarkMode} className="navbar-theme-btn" title="Toggle dark mode">
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={toggleMenu} className="navbar-menu-toggle">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <div className={`navbar-menu-mobile ${isOpen ? 'open' : ''}`}>
        <NavLink to="/" className={({ isActive }) => `navbar-menu-item ${isActive ? 'active' : ''}`} onClick={() => setIsOpen(false)}>Home</NavLink>
        <NavLink to="/aloha" className={({ isActive }) => `navbar-menu-item ${isActive ? 'active' : ''}`} onClick={() => setIsOpen(false)}>ALOHA</NavLink>
        <NavLink to="/prach" className={({ isActive }) => `navbar-menu-item ${isActive ? 'active' : ''}`} onClick={() => setIsOpen(false)}>PRACH</NavLink>
        <NavLink to="/latency" className={({ isActive }) => `navbar-menu-item ${isActive ? 'active' : ''}`} onClick={() => setIsOpen(false)}>Kechikish</NavLink>
        <NavLink to="/grant-free" className={({ isActive }) => `navbar-menu-item ${isActive ? 'active' : ''}`} onClick={() => setIsOpen(false)}>Grant-free</NavLink>
        <NavLink to="/comparison" className={({ isActive }) => `navbar-menu-item ${isActive ? 'active' : ''}`} onClick={() => setIsOpen(false)}>Taqqoslash</NavLink>
      </div>
    </nav>
  );
}
