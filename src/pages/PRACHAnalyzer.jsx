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

export default function PRACHAnalyzer() {
  const [numUE, setNumUE] = useState(100);
  const [numPreamble, setNumPreamble] = useState(64);
  const [pAcb, setPAcb] = useState(1.0);
  const { addEntry } = useCalculationHistory();

  // Core calculation functions
  const calcCollision = (lambda, N) => {
    return 1 - Math.exp(-lambda / N);
  };

  const calcThroughput = (M, N) => {
    const rho = M / N;
    return rho * Math.exp(-rho);
  };

  const calcAdmitted = (lambda, pAcb) => {
    return Math.round(lambda * pAcb);
  };

  // Calculate current metrics
  const collision64 = calcCollision(numUE, 64) * 100;
  const collisionSelected = calcCollision(numUE, numPreamble) * 100;
  const collisionWithACB = calcCollision(calcAdmitted(numUE, pAcb), numPreamble) * 100;
  const throughput = calcThroughput(numUE, numPreamble);
  const admitted = calcAdmitted(numUE, pAcb);
  const beta = numUE / numPreamble;

  // Generate Chart 1 data — Collision vs UE count
  const collisionChartData = useMemo(() => {
    const data = [];
    for (let M = 0; M <= 1000; M += 10) {
      data.push({
        M,
        col64: parseFloat((calcCollision(M, 64) * 100).toFixed(2)),
        col128: parseFloat((calcCollision(M, 128) * 100).toFixed(2)),
        col256: parseFloat((calcCollision(M, 256) * 100).toFixed(2)),
      });
    }
    return data;
  }, []);

  // Generate Chart 2 data — Throughput vs rho
  const throughputChartData = useMemo(() => {
    const data = [];
    for (let rho = 0; rho <= 5; rho += 0.05) {
      data.push({
        rho: parseFloat(rho.toFixed(2)),
        S: parseFloat((rho * Math.exp(-rho)).toFixed(4)),
      });
    }
    return data;
  }, []);

  // Determine beta color
  const getBetaColor = () => {
    if (beta < 0.5) return 'text-green-600';
    if (beta < 1) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBetaBgColor = () => {
    if (beta < 0.5) return 'bg-green-50 border-green-200';
    if (beta < 1) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getBetaLabel = () => {
    if (beta < 0.5) return 'Past yuk';
    if (beta < 1) return 'Ortacha yuk';
    return 'OVERLOAD';
  };

  // Save calculation to history with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      addEntry('PRACH Tahlil', 
        { numUE, numPreamble, pAcb }, 
        { collision: collisionSelected, throughput: parseFloat(throughput.toFixed(4)), beta: parseFloat(beta.toFixed(2)) }
      );
    }, 1000);
    return () => clearTimeout(timer);
  }, [numUE, numPreamble, pAcb, collisionSelected, throughput, beta, addEntry]);

  return (
    <div className="min-h-screen pt-24 pb-24 px-4 sm:px-6 lg:px-12 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto">
        {/* Page Title */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">PRACH Tahlil</h1>
          <p className="text-lg text-gray-600 mb-3">
            Kolliziya ehtimoli va otkazuvchanlik hisoblash
          </p>
          <div className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
            3GPP TS 38.211 | Manba [8]
          </div>
        </div>

        {/* Input Panel */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-8 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* UE Count Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                UE soni (M)
              </label>
              <input
                type="number"
                min="1"
                max="2000"
                value={numUE}
                onChange={(e) => setNumUE(Math.max(1, Math.min(2000, parseInt(e.target.value) || 1)))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Min: 1, Max: 2000</p>
            </div>

            {/* Preamble Count Select */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Preambula soni (N)
              </label>
              <select
                value={numPreamble}
                onChange={(e) => setNumPreamble(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={64}>64</option>
                <option value={128}>128</option>
                <option value={256}>256</option>
                <option value={512}>512</option>
              </select>
            </div>

            {/* pAcb Slider */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                ACB ehtimoli: {pAcb.toFixed(2)}
              </label>
              <input
                type="range"
                min="0.01"
                max="1.0"
                step="0.01"
                value={pAcb}
                onChange={(e) => setPAcb(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">0.01 - 1.0</p>
            </div>

            {/* Calculated Metrics */}
            <div className={`rounded-lg border-2 p-4 ${getBetaBgColor()}`}>
              <p className="text-xs font-medium text-gray-600 mb-1">Yuk koeffitsienti β</p>
              <p className={`text-3xl font-bold ${getBetaColor()}`}>
                {beta.toFixed(2)}
              </p>
              <p className="text-xs text-gray-600 mt-2">{getBetaLabel()}</p>
            </div>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-600">Qabul qilingan UE:</p>
              <p className="text-2xl font-bold text-blue-600">{admitted} / {numUE}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Bekor qilingan UE:</p>
              <p className="text-2xl font-bold text-red-600">{numUE - admitted}</p>
            </div>
          </div>
        </div>

        {/* Results Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Kolliziya (N=64)</h3>
            <p className="text-4xl font-bold text-red-600">{collision64.toFixed(1)}%</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Kolliziya (N={numPreamble})</h3>
            <p className="text-4xl font-bold text-blue-600">{collisionSelected.toFixed(1)}%</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">ACB bilan</h3>
            <p className="text-4xl font-bold text-green-600">{collisionWithACB.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 mt-2">Foyda: {(collisionSelected - collisionWithACB).toFixed(1)}%</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Otkazuvchanlik</h3>
            <p className="text-4xl font-bold text-purple-600">{throughput.toFixed(4)}</p>
            <p className="text-xs text-gray-500 mt-2">ρ = {(numUE / numPreamble).toFixed(2)}</p>
          </div>
        </div>

        {/* Chart 1: Collision Probability */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Kolliziya ehtimoli vs UE soni
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={collisionChartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="M"
                label={{ value: 'UE soni', position: 'insideBottomRight', offset: -5 }}
              />
              <YAxis
                domain={[0, 100]}
                label={{ value: 'Kolliziya ehtimoli (%)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
              <Legend />

              {/* Reference lines for thresholds */}
              <ReferenceLine
                y={5}
                stroke="#9ca3af"
                strokeDasharray="5 5"
                label={{ value: '5% chegara', position: 'right', fill: '#6b7280', fontSize: 12 }}
              />
              <ReferenceLine
                y={20}
                stroke="#9ca3af"
                strokeDasharray="5 5"
                label={{ value: '20% chegara', position: 'right', fill: '#6b7280', fontSize: 12 }}
              />

              {/* Reference line at current UE count */}
              <ReferenceLine
                x={numUE}
                stroke="#94a3b8"
                strokeDasharray="5 5"
                label={{ value: `M=${numUE}`, position: 'top', fill: '#64748b', fontSize: 11 }}
              />

              {/* Lines for different N values */}
              <Line
                type="monotone"
                dataKey="col64"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
                name="N=64"
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="col128"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name="N=128"
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="col256"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                name="N=256"
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 2: Throughput */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Normalangan otkazuvchanlik
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={throughputChartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="rho"
                label={{ value: 'Yuklanish ρ = M/N', position: 'insideBottomRight', offset: -5 }}
              />
              <YAxis
                domain={[0, 0.45]}
                label={{ value: 'Normalangan throughput S', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip formatter={(value) => value.toFixed(4)} />
              <Legend />

              {/* Reference dot at maximum throughput */}
              <ReferenceDot
                x={1}
                y={1 / Math.E}
                r={6}
                fill="#f59e0b"
                label={{
                  value: `Smax=0.368 @ ρ=1`,
                  position: 'top',
                  fill: '#f59e0b',
                  fontSize: 12,
                  fontWeight: 'bold',
                }}
              />

              {/* Reference line at current rho */}
              <ReferenceLine
                x={numUE / numPreamble}
                stroke="#94a3b8"
                strokeDasharray="5 5"
                label={{
                  value: `ρ=${(numUE / numPreamble).toFixed(2)}`,
                  position: 'top',
                  fill: '#64748b',
                  fontSize: 11,
                }}
              />

              {/* Throughput line */}
              <Line
                type="monotone"
                dataKey="S"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name="S = ρ × e^(-ρ)"
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* ACB Analysis Table */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            ACB Mexanizmi Tahlili (M=500 UE, N=64)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">p_ACB</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Qabul qilingan UE</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">β koeffitsient</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Kolliziya %</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Holat</th>
                </tr>
              </thead>
              <tbody>
                {[1.0, 0.5, 0.2, 0.1, 0.05, 0.02].map((pVal) => {
                  const admittedUE = Math.round(500 * pVal);
                  const beta = (admittedUE / 64).toFixed(2);
                  const collision = (calcCollision(admittedUE, 64) * 100).toFixed(1);
                  
                  let status = '';
                  let statusColor = '';
                  if (collision < 20) {
                    status = "A'lo";
                    statusColor = 'bg-green-100 text-green-800';
                  } else if (collision < 50) {
                    status = 'Yaxshi';
                    statusColor = 'bg-blue-100 text-blue-800';
                  } else if (collision < 80) {
                    status = 'Qabul qilinadi';
                    statusColor = 'bg-yellow-100 text-yellow-800';
                  } else {
                    status = 'Yomon';
                    statusColor = 'bg-red-100 text-red-800';
                  }

                  return (
                    <tr key={pVal} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-gray-900">{pVal.toFixed(2)}</td>
                      <td className="px-4 py-3 text-gray-900">{admittedUE}</td>
                      <td className="px-4 py-3 text-gray-900">{beta}</td>
                      <td className="px-4 py-3 text-gray-900">{collision}%</td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* QoS Preamble Separation */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            QoS asosida preambula ajratish
            <span className="text-sm font-normal text-gray-500 ml-2">(Manba [2])</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* URLLC */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-300 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-blue-900">URLLC</h3>
                <span className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                  QCI 1-4
                </span>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Preambula soni</p>
                  <p className="text-2xl font-bold text-blue-900">16</p>
                </div>
                <div className="pt-2 border-t border-blue-300">
                  <p className="text-sm text-gray-600">Kolliziya (λ=10)</p>
                  <p className="text-xl font-bold text-blue-700">
                    {(calcCollision(10, 16) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            {/* eMBB */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border-2 border-green-300 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-green-900">eMBB</h3>
                <span className="inline-block bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                  QCI 5-7
                </span>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Preambula soni</p>
                  <p className="text-2xl font-bold text-green-900">32</p>
                </div>
                <div className="pt-2 border-t border-green-300">
                  <p className="text-sm text-gray-600">Kolliziya (λ=50)</p>
                  <p className="text-xl font-bold text-green-700">
                    {(calcCollision(50, 32) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            {/* mMTC */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border-2 border-orange-300 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-orange-900">mMTC</h3>
                <span className="inline-block bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                  QCI 8-9
                </span>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Preambula soni</p>
                  <p className="text-2xl font-bold text-orange-900">16</p>
                </div>
                <div className="pt-2 border-t border-orange-300">
                  <p className="text-sm text-gray-600">Kolliziya (λ=200)</p>
                  <p className="text-xl font-bold text-orange-700">
                    {(calcCollision(200, 16) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Collision Formula Card */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border-2 border-purple-300 p-8 mb-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">
            Kolliziya formulasi
            <span className="text-sm font-normal text-gray-600 ml-2">(Manba [8])</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Formula */}
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-6 border border-purple-200">
                <p className="text-sm font-semibold text-gray-900 mb-3">Asosiy formula:</p>
                <p className="font-mono text-2xl text-gray-900 mb-4 font-bold">
                  P<sub>collision</sub> = 1 - e<sup>-λ/N</sup>
                </p>
                <p className="text-sm text-gray-700 space-y-2">
                  <div><span className="font-semibold">λ</span> = UE soni</div>
                  <div><span className="font-semibold">N</span> = preambula soni</div>
                  <div><span className="font-semibold">e</span> = Eyler soni (2.718...)</div>
                </p>
              </div>
            </div>

            {/* Worked Example */}
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-6 border border-purple-200">
                <p className="text-sm font-semibold text-gray-900 mb-3">Hisoblash namunasi (joriy qiymatlar):</p>
                <div className="space-y-3 font-mono text-sm text-gray-900">
                  <div className="flex justify-between">
                    <span>λ (UE soni):</span>
                    <span className="font-bold text-blue-600">{numUE}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>N (preambula soni):</span>
                    <span className="font-bold text-blue-600">{numPreamble}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-300">
                    <span>P = 1 - e<sup>-{numUE}/{numPreamble}</sup></span>
                    <span className="font-bold text-red-600">
                      {(calcCollision(numUE, numPreamble) * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Original Explanation */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Formulalar</h3>
            <FormulaButton formulaKey="collision" />
            <FormulaButton formulaKey="throughput" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Kolliziya ehtimoli:</p>
              <p className="font-mono text-gray-700 dark:text-gray-300">P<sub>c</sub> = 1 - e<sup>-M/N</sup></p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Normalangan otkazuvchanlik:</p>
              <p className="font-mono text-gray-700 dark:text-gray-300">S = ρ × e<sup>-ρ</sup>, ρ = M/N</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
            <span className="font-semibold">Izoh:</span> M — UE soni, N — preambula soni
          </p>
        </div>
      </div>
    </div>
  );
}

