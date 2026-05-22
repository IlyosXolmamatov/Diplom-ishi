import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
} from 'recharts';

export default function AlohaCalculator() {
  const [gValue, setGValue] = useState(1.0);
  const [showPure, setShowPure] = useState(true);
  const [showSlotted, setShowSlotted] = useState(true);

  // Generate chart data with 100 points from g=0.01 to g=5.0
  const chartData = useMemo(() => {
    return Array.from({ length: 100 }, (_, i) => {
      const g = 0.01 + i * 0.0499;
      return {
        g: parseFloat(g.toFixed(2)),
        pure: parseFloat((g * Math.exp(-2 * g)).toFixed(4)),
        slotted: parseFloat((g * Math.exp(-g)).toFixed(4)),
      };
    });
  }, []);

  // Calculate current throughput values
  const S_pure = parseFloat((gValue * Math.exp(-2 * gValue)).toFixed(4));
  const S_slotted = parseFloat((gValue * Math.exp(-gValue)).toFixed(4));
  const difference = parseFloat((S_slotted - S_pure).toFixed(4));

  // Maximum values
  const S_pure_max = 1 / (2 * Math.E);
  const S_slotted_max = 1 / Math.E;
  const G_pure_max = 0.5;
  const G_slotted_max = 1.0;

  // Table data for specific G values
  const tableGValues = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0];
  const tableData = tableGValues.map((g) => ({
    g,
    pure: parseFloat((g * Math.exp(-2 * g)).toFixed(4)),
    slotted: parseFloat((g * Math.exp(-g)).toFixed(4)),
    diff: parseFloat(((g * Math.exp(-g)) - (g * Math.exp(-2 * g))).toFixed(4)),
  }));

  // Find closest row to current gValue for highlighting
  const closestRowIndex = tableData.findIndex(
    (row, idx) =>
      idx === tableData.length - 1 ||
      Math.abs(row.g - gValue) <= Math.abs(tableData[idx + 1].g - gValue)
  );

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            ALOHA Kalkulyator
          </h1>
          <p className="text-lg text-gray-600">
            Pure ALOHA va Slotted ALOHA otkazuvchanlik taqqoslashi
          </p>
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Slider */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                Kanal yuklamasi G: <span className="text-blue-600">{gValue.toFixed(1)}</span>
              </label>
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={gValue}
                onChange={(e) => setGValue(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>0.1</span>
                <span>5.0</span>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPure}
                  onChange={(e) => setShowPure(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                />
                <span className="ml-3 text-gray-700 font-medium">Pure ALOHA korsatish</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showSlotted}
                  onChange={(e) => setShowSlotted(e.target.checked)}
                  className="w-5 h-5 text-red-600 rounded cursor-pointer"
                />
                <span className="ml-3 text-gray-700 font-medium">Slotted ALOHA korsatish</span>
              </label>
            </div>
          </div>
        </div>

        {/* Results Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Joriy G</h3>
            <p className="text-4xl font-bold text-blue-600">{gValue.toFixed(1)}</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Pure S(G)</h3>
            <p className="text-4xl font-bold text-blue-500">{S_pure}</p>
            <p className="text-xs text-gray-500 mt-2">Max: {(S_pure_max).toFixed(4)} @ G=0.5</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Slotted S(G)</h3>
            <p className="text-4xl font-bold text-red-500">{S_slotted}</p>
            <p className="text-xs text-gray-500 mt-2">Max: {(S_slotted_max).toFixed(4)} @ G=1.0</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Farq (Slotted - Pure)</h3>
            <p className="text-4xl font-bold text-green-600">{difference}</p>
            <p className="text-xs text-gray-500 mt-2">
              {(difference > 0 ? '+' : '')}{((difference / S_pure) * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Otkazuvchanlik Taqqoslashi
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="g"
                label={{ value: 'Kanal yuklamasi G', position: 'insideBottomRight', offset: -5 }}
              />
              <YAxis
                domain={[0, 0.45]}
                label={{ value: 'Otkazuvchanlik S', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}
                formatter={(value) => value.toFixed(4)}
              />
              <Legend />

              {/* Reference line at current G value */}
              <ReferenceLine
                x={gValue}
                stroke="#9ca3af"
                strokeDasharray="5 5"
                label={{ value: `G=${gValue.toFixed(1)}`, position: 'top', fill: '#6b7280' }}
              />

              {/* Reference dots at peak points */}
              <ReferenceDot
                x={G_pure_max}
                y={S_pure_max}
                r={6}
                fill="#f59e0b"
                label={{ value: '18.4%', position: 'top', fill: '#f59e0b', fontSize: 12, fontWeight: 'bold' }}
              />
              <ReferenceDot
                x={G_slotted_max}
                y={S_slotted_max}
                r={6}
                fill="#10b981"
                label={{ value: '36.8%', position: 'top', fill: '#10b981', fontSize: 12, fontWeight: 'bold' }}
              />

              {/* Lines */}
              {showPure && (
                <Line
                  type="monotone"
                  dataKey="pure"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  name="Pure ALOHA"
                  isAnimationActive={false}
                />
              )}
              {showSlotted && (
                <Line
                  type="monotone"
                  dataKey="slotted"
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Slotted ALOHA"
                  isAnimationActive={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Formula Explanation */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-8 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Formulalar</h3>
          <div className="space-y-4">
            <p className="text-gray-800">
              <span className="font-mono font-semibold">Pure ALOHA:</span>
              {' '}<span className="text-gray-700">S = G × e<sup>-2G</sup> | S<sub>max</sub> = 1/(2e) ≈ 18.4% (G=0.5 da)</span>
            </p>
            <p className="text-gray-800">
              <span className="font-mono font-semibold">Slotted ALOHA:</span>
              {' '}<span className="text-gray-700">S = G × e<sup>-G</sup> | S<sub>max</sub> = 1/e ≈ 36.8% (G=1.0 da)</span>
            </p>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            <span className="font-semibold">Manba:</span> Abramson (1971), Roberts (1972)
          </p>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">Otkazuvchanlik Jadvali</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-8 py-4 text-left text-sm font-semibold text-gray-900">G</th>
                  <th className="px-8 py-4 text-left text-sm font-semibold text-gray-900">S_Pure</th>
                  <th className="px-8 py-4 text-left text-sm font-semibold text-gray-900">S_Slotted</th>
                  <th className="px-8 py-4 text-left text-sm font-semibold text-gray-900">Farq</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`border-b border-gray-200 transition-colors ${
                      idx === closestRowIndex ? 'bg-blue-50' : idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="px-8 py-4 text-sm font-medium text-gray-900">{row.g.toFixed(1)}</td>
                    <td className="px-8 py-4 text-sm text-blue-600 font-mono">{row.pure}</td>
                    <td className="px-8 py-4 text-sm text-red-600 font-mono">{row.slotted}</td>
                    <td className="px-8 py-4 text-sm text-green-600 font-mono">{row.diff}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

