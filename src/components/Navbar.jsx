import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, Moon, Sun } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Sync dark mode state with HTML element and localStorage
  useEffect(() => {
    // Initialize from localStorage or check HTML element
    const darkMode = localStorage.getItem('darkMode') === 'true' || 
                     document.documentElement.classList.contains('dark');
    setIsDark(darkMode);
    
    // If dark mode should be on, ensure the class is set
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const html = document.documentElement;
    const newDarkState = !isDark;
    
    // Toggle the class
    if (newDarkState) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    
    // Update state and localStorage
    setIsDark(newDarkState);
    localStorage.setItem('darkMode', String(newDarkState));
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="shrink-0">
            <div className="text-2xl font-bold text-blue-600">
              5G PRACH Analyzer
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="desktop-nav" style={{ gap: '3rem' }}>
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/aloha"
              className={({ isActive }) =>
                `px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`
              }
            >
              ALOHA
            </NavLink>
            <NavLink
              to="/prach"
              className={({ isActive }) =>
                `px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`
              }
            >
              PRACH
            </NavLink>
            <NavLink
              to="/latency"
              className={({ isActive }) =>
                `px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`
              }
            >
              Kechikish
            </NavLink>
            <NavLink
              to="/grantfree"
              className={({ isActive }) =>
                `px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`
              }
            >
              Grant-free
            </NavLink>
            <NavLink
              to="/comparison"
              className={({ isActive }) =>
                `px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`
              }
            >
              Taqqoslash
            </NavLink>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="ml-6 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Tungi rejim"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Mobile menu button */}
          <div className="mobile-menu" style={{ gap: '1rem', alignItems: 'center', marginLeft: '1.5rem' }}>
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <NavLink
              to="/"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-base font-medium ${
                  isActive
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/aloha"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-base font-medium ${
                  isActive
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`
              }
            >
              ALOHA
            </NavLink>
            <NavLink
              to="/prach"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-base font-medium ${
                  isActive
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`
              }
            >
              PRACH
            </NavLink>
            <NavLink
              to="/latency"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-base font-medium ${
                  isActive
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`
              }
            >
              Kechikish
            </NavLink>
            <NavLink
              to="/grantfree"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-base font-medium ${
                  isActive
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`
              }
            >
              Grant-free
            </NavLink>
            <NavLink
              to="/comparison"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-base font-medium ${
                  isActive
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`
              }
            >
              Taqqoslash
            </NavLink>
          </div>
        </div>
      )}
    </nav>
  );
}
