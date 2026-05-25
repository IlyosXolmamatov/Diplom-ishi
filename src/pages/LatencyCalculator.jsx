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
} from 'recharts';
import useCalculationHistory from '../hooks/useCalculationHistory';
import { FormulaButton } from '../components/FormulaModal';

export default function LatencyCalculator() {
  const [scs, setScs] = useState(15);
  const [prachPeriod, setPrachPeriod] = useState(5);
  const [rarWindow, setRarWindow] = useState(8);
  const [nMsg3, setNMsg3] = useState(3);
  const [nCR, setNCR] = useState(3);
  const [lambda, setLambda] = useState(64);
  const N = 64; // Fixed preamble count
  const { addEntry } = useCalculationHistory();

  // Calculate slot duration based on SCS
  const slotDuration = 1 / (scs / 15); // ms: 15kHz=1ms, 30kHz=0.5ms etc.

  // Timing calculations
  const T_wait = prachPeriod / 2;
  const T_RAR = rarWindow * slotDuration;
  const T_Msg3 = nMsg3 * slotDuration;
  const T_CR = nCR * slotDuration;
  const T_4step = T_wait + T_RAR + T_Msg3 + T_CR;
  const T_2step = T_wait + T_RAR * 0.55 + T_CR * 0.5;
  const T_gfra = 2.0;
  const reduction_pct = (((T_4step - T_2step) / T_4step) * 100).toFixed(1);

  // Success rate calculations
  const p1 = Math.exp(-lambda / N);
  const p10 = ((1 - Math.pow(1 - p1, 10)) * 100).toFixed(1);

  // Generate latency chart data
  const latencyChartData = useMemo(() => {
    const data = [];
    for (let M = 10; M <= 500; M += 10) {
      const lat4 =
        T_wait +
        T_RAR +
        nMsg3 * slotDuration +
        nCR * slotDuration +
        Math.pow(Math.max(0, M / N - 0.5), 1.5) * 5;

      const lat2 = lat4 * 0.5;
      const lat_gf = 2 + Math.max(0, (M - 100) / 120);

      data.push({
        M,
        lat4: parseFloat(lat4.toFixed(2)),
        lat2: parseFloat(lat2.toFixed(2)),
        lat_gf: parseFloat(lat_gf.toFixed(2)),
      });
    }
    return data;
  }, [prachPeriod, rarWindow, nMsg3, nCR, slotDuration]);

  // Generate success rate data
  const successRateData = [
    { ue: 10, lambda: 10 },
    { ue: 32, lambda: 32 },
    { ue: 64, lambda: 64 },
    { ue: 128, lambda: 128 },
    { ue: 200, lambda: 200 },
  ].map((item) => {
    const p1_val = Math.exp(-item.lambda / N);
    const p10_val = ((1 - Math.pow(1 - p1_val, 10)) * 100).toFixed(1);
    return {
      ue: item.ue,
      p1: (p1_val * 100).toFixed(2),
      p10: p10_val,
      isActive: item.lambda === lambda,
    };
  });

  // Save calculation to history with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      addEntry('Kechikish Hisob', 
        { scs, prachPeriod, rarWindow, nMsg3, nCR, lambda }, 
        { T_4step: parseFloat(T_4step.toFixed(2)), T_2step: parseFloat(T_2step.toFixed(2)), reduction_pct }
      );
    }, 1000);
    return () => clearTimeout(timer);
  }, [scs, prachPeriod, rarWindow, nMsg3, nCR, lambda, T_4step, T_2step, reduction_pct, addEntry]);

  return (
    <div className="page-container">
      <div className="main-container">
        {/* Page Title */}
        <div className="section">
          <h1 className="section-title">Kechikish va Muvaffaqiyat Tahlili</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-3">
            4-step va 2-step RACH protseduralarini solishtirish
          </p>
          <div className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
            3GPP TS 38.321 | Manba [5]
          </div>
        </div>

        {/* Parameters Card */}
        <div className="viz-box mb-16">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Parametrlar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* SCS Select */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Subcarrier Spacing (SCS)
              </label>
              <select
                value={scs}
                onChange={(e) => setScs(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={15}>15 kHz</option>
                <option value={30}>30 kHz</option>
                <option value={60}>60 kHz</option>
                <option value={120}>120 kHz</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Slot davomiyligi: {slotDuration.toFixed(3)} ms</p>
            </div>

            {/* PRACH Period Slider */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                PRACH davri: {prachPeriod} ms
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={prachPeriod}
                onChange={(e) => setPrachPeriod(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-xs text-gray-500 mt-1">1-20 ms</p>
            </div>

            {/* RAR Window Slider */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                RAR oynasi: {rarWindow} slot
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={rarWindow}
                onChange={(e) => setRarWindow(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-xs text-gray-500 mt-1">1-10 slot</p>
            </div>

            {/* nMsg3 Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Msg3 slot-lar (nMsg3)
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={nMsg3}
                onChange={(e) => setNMsg3(Math.max(1, Math.min(5, parseInt(e.target.value) || 1)))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">1-5 slot</p>
            </div>

            {/* nCR Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Contention Resolution slot-lar (nCR)
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={nCR}
                onChange={(e) => setNCR(Math.max(1, Math.min(5, parseInt(e.target.value) || 1)))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">1-5 slot</p>
            </div>

            {/* Lambda Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                UE soni (λ)
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={lambda}
                onChange={(e) => setLambda(Math.max(1, Math.min(500, parseInt(e.target.value) || 1)))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">1-500 UE</p>
            </div>
          </div>
        </div>

        {/* Results Cards */}
        <div className="viz-grid mb-16">
          <div className="viz-box">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">4-step kechikish</h3>
            <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{T_4step.toFixed(1)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">ms</p>
          </div>

          <div className="viz-box">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">2-step kechikish</h3>
            <p className="text-4xl font-bold text-red-600 dark:text-red-400">{T_2step.toFixed(1)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">ms</p>
          </div>

          <div className="viz-box">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Kamaytirish</h3>
            <p className="text-4xl font-bold text-green-600 dark:text-green-400">{reduction_pct}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">%</p>
          </div>

          <div className="viz-box">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Muvaffaqiyat (10 urinish)</h3>
            <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">{p10}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">%</p>
          </div>
        </div>

        {/* Timing Diagram */}
        <div className="viz-box mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Vaqt bloklari</h2>

          {/* 4-step diagram */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">4-step RACH</h3>
            <div className="flex items-end gap-1 h-32 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              {/* T_wait block */}
              <div
                className="bg-gray-400 rounded flex flex-col items-center justify-end pb-2 text-white text-xs font-bold"
                style={{ height: `${(T_wait / T_4step) * 100}%`, minWidth: '40px' }}
              >
                <span className="text-center">{T_wait.toFixed(2)}</span>
                <span className="text-center text-xs">Kutish</span>
              </div>

              {/* T_RAR block */}
              <div
                className="bg-blue-500 rounded flex flex-col items-center justify-end pb-2 text-white text-xs font-bold"
                style={{ height: `${(T_RAR / T_4step) * 100}%`, minWidth: '40px' }}
              >
                <span className="text-center">{T_RAR.toFixed(2)}</span>
                <span className="text-center text-xs">RAR</span>
              </div>

              {/* T_Msg3 block */}
              <div
                className="bg-green-500 rounded flex flex-col items-center justify-end pb-2 text-white text-xs font-bold"
                style={{ height: `${(T_Msg3 / T_4step) * 100}%`, minWidth: '40px' }}
              >
                <span className="text-center">{T_Msg3.toFixed(2)}</span>
                <span className="text-center text-xs">Msg3</span>
              </div>

              {/* T_CR block */}
              <div
                className="bg-orange-500 rounded flex flex-col items-center justify-end pb-2 text-white text-xs font-bold"
                style={{ height: `${(T_CR / T_4step) * 100}%`, minWidth: '40px' }}
              >
                <span className="text-center">{T_CR.toFixed(2)}</span>
                <span className="text-center text-xs">CR</span>
              </div>

              {/* Total label */}
              <div className="ml-4 flex items-center">
                <span className="text-lg font-bold text-gray-900">
                  Jami: {T_4step.toFixed(1)} ms
                </span>
              </div>
            </div>
          </div>

          {/* 2-step diagram */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">2-step RACH</h3>
            <div className="flex items-end gap-1 h-32 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              {/* T_wait block */}
              <div
                className="bg-gray-400 rounded flex flex-col items-center justify-end pb-2 text-white text-xs font-bold"
                style={{ height: `${(T_wait / T_2step) * 100}%`, minWidth: '40px' }}
              >
                <span className="text-center">{T_wait.toFixed(2)}</span>
                <span className="text-center text-xs">Kutish</span>
              </div>

              {/* T_RAR block (reduced) */}
              <div
                className="bg-blue-400 rounded flex flex-col items-center justify-end pb-2 text-white text-xs font-bold"
                style={{ height: `${((T_RAR * 0.55) / T_2step) * 100}%`, minWidth: '40px' }}
              >
                <span className="text-center">{(T_RAR * 0.55).toFixed(2)}</span>
                <span className="text-center text-xs">RAR</span>
              </div>

              {/* T_CR block (reduced) */}
              <div
                className="bg-orange-400 rounded flex flex-col items-center justify-end pb-2 text-white text-xs font-bold"
                style={{ height: `${((T_CR * 0.5) / T_2step) * 100}%`, minWidth: '40px' }}
              >
                <span className="text-center">{(T_CR * 0.5).toFixed(2)}</span>
                <span className="text-center text-xs">CR</span>
              </div>

              {/* Total label */}
              <div className="ml-4 flex items-center">
                <span className="text-lg font-bold text-gray-900">
                  Jami: {T_2step.toFixed(1)} ms
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Latency vs UE Chart */}
        <div className="viz-box mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Kechikish vs UE soni</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={latencyChartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="M"
                label={{ value: 'UE soni', position: 'insideBottomRight', offset: -5 }}
              />
              <YAxis
                domain={[0, 50]}
                label={{ value: 'Kechikish (ms)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip formatter={(value) => `${value.toFixed(2)} ms`} />
              <Legend />

              {/* URLLC threshold (<1ms) */}
              <ReferenceLine
                y={1}
                stroke="#f59e0b"
                strokeDasharray="5 5"
                label={{ value: 'URLLC <1ms', position: 'right', fill: '#f59e0b', fontSize: 11 }}
              />

              {/* 10ms threshold */}
              <ReferenceLine
                y={10}
                stroke="#9ca3af"
                strokeDasharray="5 5"
                label={{ value: '10ms chegara', position: 'right', fill: '#6b7280', fontSize: 11 }}
              />

              {/* Lines */}
              <Line
                type="monotone"
                dataKey="lat4"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name="4-step"
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="lat2"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
                name="2-step"
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="lat_gf"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                name="Grant-Free RA"
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Success Rate Table */}
        <div className="viz-box mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Muvaffaqiyat darajasi (Rel-17)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">UE soni</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">
                    P<sub>1</sub> (bir urinish)
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">
                    P<sub>10</sub> (10 urinish)
                  </th>
                </tr>
              </thead>
              <tbody>
                {successRateData.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`border-b border-gray-200 dark:border-gray-700 ${
                      row.isActive ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-900'
                    }`}
                  >
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                      {row.ue}
                      {row.isActive && <span className="text-blue-600 dark:text-blue-400 ml-2">✓ Joriy</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{row.p1}%</td>
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{row.p10}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="viz-box mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">RA usullari solishtirish</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">RA turi</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Min kechikish</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">O'rtacha kechikish</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">3GPP standart</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">4-step</td>
                  <td className="px-4 py-3 text-blue-600 dark:text-blue-400 font-mono">{(T_4step * 0.85).toFixed(1)} ms</td>
                  <td className="px-4 py-3 text-blue-600 dark:text-blue-400 font-mono">{T_4step.toFixed(1)} ms</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Release 15</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">2-step</td>
                  <td className="px-4 py-3 text-red-600 dark:text-red-400 font-mono">{(T_2step * 0.85).toFixed(1)} ms</td>
                  <td className="px-4 py-3 text-red-600 dark:text-red-400 font-mono">{T_2step.toFixed(1)} ms</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Release 16</td>
                </tr>
                <tr className="bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30">
                  <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Grant-Free RA</td>
                  <td className="px-4 py-3 text-green-600 dark:text-green-400 font-mono">1.0 ms</td>
                  <td className="px-4 py-3 text-green-600 dark:text-green-400 font-mono">2.0 ms</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Release 17</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Formula Explanation */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-300 dark:border-blue-800 p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Kechikish formulalari
                <span className="text-sm font-normal text-gray-600 dark:text-gray-400 ml-2">(Manba [5])</span>
              </h3>
            </div>
            <FormulaButton formulaKey="latency_4step" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 4-step formula */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">4-step RACH:</p>
              <p className="font-mono text-gray-900 dark:text-gray-200 mb-2">
                T<sub>4step</sub> = T<sub>wait</sub> + T<sub>RAR</sub> + T<sub>Msg3</sub> + T<sub>CR</sub>
              </p>
              <div className="text-xs text-gray-700 dark:text-gray-300 space-y-1 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div>T<sub>wait</sub> = PRACH davri / 2 = {T_wait.toFixed(2)} ms</div>
                <div>T<sub>RAR</sub> = RAR oynasi × slot = {T_RAR.toFixed(2)} ms</div>
                <div>T<sub>Msg3</sub> = nMsg3 × slot = {T_Msg3.toFixed(2)} ms</div>
                <div>T<sub>CR</sub> = nCR × slot = {T_CR.toFixed(2)} ms</div>
                <div className="font-bold text-blue-600 dark:text-blue-400 mt-2">
                  Jami: {T_4step.toFixed(2)} ms
                </div>
              </div>
            </div>

            {/* 2-step formula */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">2-step RACH:</p>
              <p className="font-mono text-gray-900 dark:text-gray-200 mb-2">
                T<sub>2step</sub> = T<sub>wait</sub> + 0.55×T<sub>RAR</sub> + 0.5×T<sub>CR</sub>
              </p>
              <div className="text-xs text-gray-700 dark:text-gray-300 space-y-1 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div>T<sub>wait</sub> = {T_wait.toFixed(2)} ms</div>
                <div>RAR × 0.55 = {(T_RAR * 0.55).toFixed(2)} ms</div>
                <div>CR × 0.5 = {(T_CR * 0.5).toFixed(2)} ms</div>
                <div className="font-bold text-red-600 dark:text-red-400 mt-2">
                  Jami: {T_2step.toFixed(2)} ms
                </div>
              </div>
            </div>

            {/* Success rate formula */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Bir urinishdagi muvaffaqiyat:</p>
              <p className="font-mono text-gray-900 dark:text-gray-200 mb-2">P<sub>1</sub> = e<sup>-λ/N</sup></p>
              <div className="text-xs text-gray-700 dark:text-gray-300 space-y-1 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div>λ = UE soni = {lambda}</div>
                <div>N = preambula soni = {N}</div>
                <div className="font-bold text-purple-600 dark:text-purple-400 mt-2">
                  P<sub>1</sub> = {(p1 * 100).toFixed(2)}%
                </div>
              </div>
            </div>

            {/* 10 attempts formula */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">10 urinishdagi muvaffaqiyat:</p>
              <p className="font-mono text-gray-900 dark:text-gray-200 mb-2">P<sub>10</sub> = (1 - (1-P<sub>1</sub>)<sup>10</sup>) × 100%</p>
              <div className="text-xs text-gray-700 dark:text-gray-300 space-y-1 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div>P<sub>1</sub> = {(p1 * 100).toFixed(2)}%</div>
                <div>Kamayish ehtimoli = {((1 - p1) * 100).toFixed(2)}%</div>
                <div className="font-bold text-green-600 dark:text-green-400 mt-2">
                  P<sub>10</sub> = {p10}%
                </div>
              </div>
            </div>
          </div>

          {/* Slot duration info */}
          <div className="mt-6 p-4 bg-blue-100 dark:bg-blue-900/20 rounded-lg border border-blue-300 dark:border-blue-800">
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Slot davomiyligi (SCS asosida):</p>
            <p className="text-xs text-gray-700 dark:text-gray-300">
              Har bir SCS uchun slot davomiyligi = 1 / (SCS / 15) ms
              <br />
              Hozirda: 1 / ({scs} / 15) = <span className="font-bold text-blue-600 dark:text-blue-400">{slotDuration.toFixed(3)} ms</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
