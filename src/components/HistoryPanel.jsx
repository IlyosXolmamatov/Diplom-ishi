import { useState } from 'react';
import { X, Trash2, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg shadow-lg z-40 flex items-center gap-2 font-semibold transition-colors"
      >
        <Clock className="w-5 h-5" />
        Tarix
        {history.length > 0 && (
          <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {history.length}
          </span>
        )}
      </button>

      {/* Slide-in Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-blue-600 dark:bg-blue-900 text-white p-4 flex justify-between items-center">
          <h2 className="text-lg font-bold">Hisoblash Tarixi</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-blue-700 p-1 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* History List */}
        <div className="p-4 space-y-2">
          {history.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              Hisob tarixiy yo'q
            </p>
          ) : (
            history.map((entry) => (
              <div
                key={entry.id}
                onClick={() => handleEntryClick(entry)}
                className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors border-l-4 border-blue-500"
              >
                <div className="font-semibold text-gray-900 dark:text-white text-sm">
                  {entry.page}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {entry.timestamp}
                </div>
                <div className="text-xs text-gray-700 dark:text-gray-300 mt-2 space-y-1">
                  {Object.entries(entry.inputs).slice(0, 2).map(([key, value]) => (
                    <div key={key}>
                      <span className="font-medium">{key}:</span> {String(value).slice(0, 20)}
                      {String(value).length > 20 ? '...' : ''}
                    </div>
                  ))}
                </div>
                {entry.results && (
                  <div className="text-xs text-green-700 dark:text-green-400 mt-2 font-semibold">
                    Natija: {Object.values(entry.results)[0]}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Clear Button */}
        {history.length > 0 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                onClear();
                setIsOpen(false);
              }}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
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
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
