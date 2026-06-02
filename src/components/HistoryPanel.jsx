import { useState } from 'react';
import { X, Trash2, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './HistoryPanel.css';

export default function HistoryPanel({ history, onClear }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const pageRoutes = {
    'ALOHA Kalkulyator': '/aloha',
    'PRACH Tahlil': '/prach',
    'Kechikish Hisob': '/latency',
    'Grant-free RA': '/grantfree',
    'Taqqoslash': '/comparison',
  };

  const handleEntryClick = (entry) => {
    const route = pageRoutes[entry.page];
    if (route) {
      navigate(route, { state: { params: entry.inputs } });
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="history-toggle-btn"
      >
        <Clock className="w-5 h-5" />
        Tarix
        {history.length > 0 && (
          <span className="history-badge">
            {history.length}
          </span>
        )}
      </button>

      {/* Slide-in Panel */}
      <div
        className={`history-panel ${isOpen ? 'open' : ''}`}
      >
        {/* Header */}
        <div className="history-panel-header">
          <h2 className="history-panel-title">Hisoblash Tarixi</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="history-close-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* History List */}
        <div className="history-list">
          {history.length === 0 ? (
            <p className="history-empty">
              Hisob tarixiy yo'q
            </p>
          ) : (
            history.map((entry) => (
              <div
                key={entry.id}
                onClick={() => handleEntryClick(entry)}
                className="history-entry"
              >
                <div className="history-entry-title">
                  {entry.page}
                </div>
                <div className="history-entry-time">
                  {entry.timestamp}
                </div>
                <div className="history-entry-inputs">
                  {Object.entries(entry.inputs).slice(0, 2).map(([key, value]) => (
                    <div key={key}>
                      <span style={{fontWeight: 600}}>{key}:</span> {String(value).slice(0, 20)}
                      {String(value).length > 20 ? '...' : ''}
                    </div>
                  ))}
                </div>
                {entry.results && (
                  <div className="history-entry-result">
                    Natija: {Object.values(entry.results)[0]}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Clear Button */}
        {history.length > 0 && (
          <div className="history-clear-section">
            <button
              onClick={() => {
                onClear();
                setIsOpen(false);
              }}
              className="history-clear-btn"
            >
              <Trash2 className="w-4 h-4" />
              Tozalash
            </button>
          </div>
        )}
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="history-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
