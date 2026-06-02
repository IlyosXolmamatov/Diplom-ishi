import { useState, useMemo, useEffect } from 'react';
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
import useCalculationHistory from '../hooks/useCalculationHistory';
import { FormulaButton } from '../components/FormulaModal';
import './AlohaCalculator.css';

export default function AlohaCalculator() {
  const [gValue, setGValue] = useState(1.0);
  const [showPure, setShowPure] = useState(true);
  const [showSlotted, setShowSlotted] = useState(true);
  const { addEntry } = useCalculationHistory();

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

  // Save calculation to history with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      addEntry('ALOHA Kalkulyator', { G: gValue }, { S_pure, S_slotted, difference });
    }, 1000);
    return () => clearTimeout(timer);
  }, [gValue, S_pure, S_slotted, difference, addEntry]);

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
    <div className="page-container">
      <div className="main-container">
        {/* Page Title */}
        <div className="section">
          <h1 className="section-title">ALOHA Kalkulyator</h1>
          <p className="section-subtitle">
            Pure ALOHA va Slotted ALOHA otkazuvchanlik taqqoslashi
          </p>
        </div>

        {/* Control Panel */}
        <div className="viz-box mb-16">
          <div className="control-grid">
            {/* Slider */}
            <div>
              <label className="control-label">
                Kanal yuklamasi G: <span className="value-highlight">{gValue.toFixed(1)}</span>
              </label>
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={gValue}
                onChange={(e) => setGValue(parseFloat(e.target.value))}
                className="slider-input"
              />
              <div className="slider-range-labels">
                <span>0.1</span>
                <span>5.0</span>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={showPure}
                  onChange={(e) => setShowPure(e.target.checked)}
                  className="checkbox-input"
                />
                <span className="checkbox-text">Pure ALOHA korsatish</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={showSlotted}
                  onChange={(e) => setShowSlotted(e.target.checked)}
                  className="checkbox-input"
                />
                <span className="checkbox-text">Slotted ALOHA korsatish</span>
              </label>
            </div>
          </div>
        </div>

        {/* Results Cards */}
        <div className="viz-grid mb-16">
          <div className="viz-stat-box">
            <h3 className="stat-label">Joriy G</h3>
            <p className="stat-value blue">{gValue.toFixed(1)}</p>
          </div>

          <div className="viz-stat-box">
            <h3 className="stat-label">Pure S(G)</h3>
            <p className="stat-value blue">{S_pure}</p>
            <p className="stat-note">Max: {(S_pure_max).toFixed(4)} @ G=0.5</p>
          </div>

          <div className="viz-stat-box">
            <h3 className="stat-label">Slotted S(G)</h3>
            <p className="stat-value red">{S_slotted}</p>
            <p className="stat-note">Max: {(S_slotted_max).toFixed(4)} @ G=1.0</p>
          </div>

          <div className="viz-stat-box">
            <h3 className="stat-label">Farq (Slotted - Pure)</h3>
            <p className="stat-value green">{difference}</p>
            <p className="stat-note">
              {(difference > 0 ? '+' : '')}{((difference / S_pure) * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="viz-box mb-16">
          <h2>
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
        <div className="formula-section mb-12">
          <div className="formula-header">
            <h3 className="formula-title">Formulalar</h3>
            <div>
              <FormulaButton formulaKey="aloha_pure" />
              <FormulaButton formulaKey="aloha_slotted" />
            </div>
          </div>
          <div className="formula-content">
            <p className="formula-text">
              <span className="formula-mono">Pure ALOHA:</span>
              {' '}<span>S = G × e<sup>-2G</sup> | S<sub>max</sub> = 1/(2e) ≈ 18.4% (G=0.5 da)</span>
            </p>
            <p className="formula-text">
              <span className="formula-mono">Slotted ALOHA:</span>
              {' '}<span>S = G × e<sup>-G</sup> | S<sub>max</sub> = 1/e ≈ 36.8% (G=1.0 da)</span>
            </p>
          </div>
          <p className="formula-source">
            <span className="font-semibold">Manba:</span> Abramson (1971), Roberts (1972)
          </p>
        </div>

        {/* Data Table */}
        <div className="viz-box">
          <h2>Otkazuvchanlik Jadvali</h2>
          <div className="table-container">
            <table className="data-table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">G</th>
                  <th className="table-header-cell">S_Pure</th>
                  <th className="table-header-cell">S_Slotted</th>
                  <th className="table-header-cell">Farq</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`table-row ${idx === closestRowIndex ? 'active' : ''}`}
                  >
                    <td className="table-cell">{row.g.toFixed(1)}</td>
                    <td className="table-cell blue">{row.pure}</td>
                    <td className="table-cell red">{row.slotted}</td>
                    <td className="table-cell green">{row.diff}</td>
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

