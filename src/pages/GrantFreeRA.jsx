import { useState, useMemo, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Zap, Radio, Smartphone, Satellite } from 'lucide-react';
import BurstTrafficSimulator from '../components/BurstTrafficSimulator';
import useCalculationHistory from '../hooks/useCalculationHistory';
import { FormulaButton } from '../components/FormulaModal';

export default function GrantFreeRA() {
  const [scenario, setScenario] = useState('smart_meter');
  const [numDevices, setNumDevices] = useState(500);
  const [numRO, setNumRO] = useState(7);
  const { addEntry } = useCalculationHistory();

  // Scenario configurations
  const scenarioConfigs = {
    smart_meter: {
      name: 'Aqlli o\'lchovlar',
      technology: 'NB-IoT',
      format: 'Format0',
      description: 'Energiya tamozhisining o\'lchov qurilmalari',
      icon: Zap,
      devices: 500,
      ro: 7,
    },
    industrial: {
      name: 'Sanoat IoT',
      technology: 'eMTC',
      format: 'A1',
      description: 'Sanoat avtomatlashtirilgan tizimlari',
      icon: Radio,
      devices: 100,
      ro: 10,
    },
    vehicle: {
      name: 'Avtomobil V2X',
      technology: '5G NR',
      format: 'C0',
      description: 'Avtomobillar orasidagi aloqa',
      icon: Smartphone,
      devices: 50,
      ro: 14,
    },
    satellite: {
      name: 'Satellite NTN',
      technology: 'NTN NR',
      format: 'Format1',
      description: 'Sun uchun hali mavjud emas',
      icon: Satellite,
      devices: 200,
      ro: 4,
    },
  };

  const config = scenarioConfigs[scenario];

  // Calculate metrics
  const lambdaPerRO = (numDevices / numRO).toFixed(1);
  const p_col_grantbased = ((1 - Math.exp(-lambdaPerRO / 64)) * 100).toFixed(1);
  const p_col_grantfree = (p_col_grantbased * 1.4).toFixed(1);
  const latency_grantbased = 16.5;
  const latency_grantfree = 2.0;
  const energy_saving_pct = 60;

  // Satellite specific calculations
  const LEO_delay = (((2 * 600000) / 300000000) * 1000).toFixed(1);
  const GEO_delay = (((2 * 35786000) / 300000000) * 1000).toFixed(1);
  const Format1_radius = ((300000000 * 684.72e-6) / 2 / 1000).toFixed(1);

  // Bar chart data
  const chartData = [
    { name: 'Kechikish (ms)', grantbased: latency_grantbased, grantfree: latency_grantfree },
    { name: 'Xabar soni', grantbased: 4, grantfree: 2 },
    { name: 'Kolliziya (%)', grantbased: p_col_grantbased, grantfree: p_col_grantfree },
    { name: 'Energiya (rel)', grantbased: 100, grantfree: 40 },
  ];

  // IoT scenarios table data
  const scenariosTableData = [
    {
      name: 'Aqlli o\'lchovlar',
      tech: 'NB-IoT',
      lambda: (config.devices / config.ro).toFixed(1),
      N: 64,
      collision: ((1 - Math.exp(-(config.devices / config.ro) / 64)) * 100).toFixed(1),
      solution: 'Grant-free + Power control',
    },
    {
      name: 'Sanoat IoT',
      tech: 'eMTC',
      lambda: 10,
      N: 64,
      collision: '3.4',
      solution: 'eMTC-specific slots',
    },
    {
      name: 'Avtomobil V2X',
      tech: '5G NR',
      lambda: 4,
      N: 64,
      collision: '0.5',
      solution: 'Sidelink resources',
    },
    {
      name: 'Satellite',
      tech: 'NTN NR',
      lambda: 50,
      N: 64,
      collision: '38.3',
      solution: 'Extended timing + Diversity',
    },
  ];

  // Save calculation to history with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      addEntry('Grant-free RA', 
        { scenario, numDevices, numRO }, 
        { collision: parseFloat(p_col_grantfree), latency: latency_grantfree, energy_savings: energy_saving_pct }
      );
    }, 1000);
    return () => clearTimeout(timer);
  }, [scenario, numDevices, numRO, p_col_grantfree, energy_saving_pct, addEntry]);

  return (
    <div className="page-container">
      <div className="main-container">
        {/* Page Title */}
        <div className="section">
          <h1 className="section-title">Grant-free RA — mMTC va IoT Ssenariylar</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-3">
            Qurilmalari ko'p bo'lgan IoT va mMTC txolatlar uchun optimizatsiya
          </p>
          <div className="inline-block bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-sm px-3 py-1 rounded-full">
            3GPP Rel-17 | mMTC / IoT Scenarios
          </div>
        </div>

        {/* Scenario Selector */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Ssenario tanlang</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(scenarioConfigs).map(([key, conf]) => {
              const Icon = conf.icon;
              return (
                <button
                  key={key}
                  onClick={() => setScenario(key)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    scenario === key
                      ? 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Icon className="w-6 h-6 mb-2 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">{conf.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{conf.technology}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scenario Info Card */}
        <div className="viz-box mb-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Ssenario ma'lumotlari</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Texnologiya</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{config.technology}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Preambula formati</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{config.format}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Qurilmalar soni</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{numDevices}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">PRACH RO soni</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{numRO}</p>
            </div>
          </div>
        </div>

        {/* Input Controls */}
        <div className="viz-box mb-16">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Parametrlar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Devices Slider */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Qurilmalar soni: {numDevices}
              </label>
              <input
                type="range"
                min="10"
                max="2000"
                value={numDevices}
                onChange={(e) => setNumDevices(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">10-2000 qurilma</p>
            </div>

            {/* RO Slider */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                PRACH RO soni: {numRO}
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={numRO}
                onChange={(e) => setNumRO(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">1-20 PRACH RO per frame</p>
            </div>
          </div>
        </div>

        {/* Comparison Visual */}
        <div className="viz-box mb-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Grant-based vs Grant-free</h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Grant-based */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Grant-based RA</h3>

              {/* Steps */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-400 rounded py-2 text-center text-xs font-bold text-white">
                    SR
                  </div>
                  <span className="text-gray-400 dark:text-gray-600">→</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-blue-500 rounded py-2 text-center text-xs font-bold text-white">
                    Grant
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-green-500 rounded py-2 text-center text-xs font-bold text-white">
                    Data
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-orange-500 rounded py-2 text-center text-xs font-bold text-white">
                    ACK
                  </div>
                </div>
              </div>

              {/* Metrics */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Jami kechikish:</span>
                  <span className="font-bold text-gray-900">{latency_grantbased} ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Xabar soni:</span>
                  <span className="font-bold text-gray-900">4</span>
                </div>
              </div>
            </div>

            {/* Center Arrow */}
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="mb-4">
                  <div className="text-3xl font-bold text-green-600">8x</div>
                  <div className="text-sm font-semibold text-gray-900">tezroq</div>
                </div>
                <div className="w-1 h-20 bg-linear-to-b from-blue-500 to-green-500 mx-auto rounded-full"></div>
              </div>
            </div>

            {/* Grant-free */}
            <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-lg border border-green-300 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Grant-free RA</h3>

              {/* Steps */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-green-600 rounded py-3 text-center text-xs font-bold text-white">
                    Data + Preambula
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-blue-500 rounded py-3 text-center text-xs font-bold text-white">
                    ACK
                  </div>
                </div>
              </div>

              {/* Metrics */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Jami kechikish:</span>
                  <span className="font-bold text-gray-900">{latency_grantfree} ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Xabar soni:</span>
                  <span className="font-bold text-gray-900">2</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">λ per RO</h3>
            <p className="text-4xl font-bold text-blue-600">{lambdaPerRO}</p>
            <p className="text-xs text-gray-500 mt-2">qurilma / PRACH RO</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Kolliziya (GF)</h3>
            <p className="text-4xl font-bold text-red-600">{p_col_grantfree}%</p>
            <p className="text-xs text-gray-500 mt-2">Grant-free rejimi</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Energiya tejash</h3>
            <p className="text-4xl font-bold text-green-600">{energy_saving_pct}%</p>
            <p className="text-xs text-gray-500 mt-2">Grant-based ga nisbatan</p>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-10 mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Taqqoslash grafigi</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="grantbased" fill="#3b82f6" name="Grant-based" />
              <Bar dataKey="grantfree" fill="#10b981" name="Grant-free" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Satellite Section */}
        {scenario === 'satellite' && (
          <div className="bg-white rounded-lg border border-orange-300 p-10 mb-16">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Satellite NTN (Sun uchun)</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="bg-linear-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-300 p-6">
                <h3 className="text-sm font-medium text-gray-600 mb-2">LEO kechikish</h3>
                <p className="text-3xl font-bold text-blue-600">{LEO_delay}</p>
                <p className="text-xs text-gray-500 mt-2">Polar orbit</p>
              </div>

              <div className="bg-linear-to-br from-orange-50 to-red-50 rounded-lg border border-orange-300 p-6">
                <h3 className="text-sm font-medium text-gray-600 mb-2">GEO kechikish</h3>
                <p className="text-3xl font-bold text-orange-600">{GEO_delay}</p>
                <p className="text-xs text-gray-500 mt-2">Geostationary</p>
              </div>

              <div className="bg-linear-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-300 p-6">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Format1 radius</h3>
                <p className="text-3xl font-bold text-purple-600">{Format1_radius}</p>
                <p className="text-xs text-gray-500 mt-2">Maximum coverage</p>
              </div>
            </div>

            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
              <p className="text-sm font-semibold text-orange-900">
                ⚠️ Ogohlik: GEO uchun standart RA timerlar qayta sozlanishi kerak (Extended timing)
              </p>
            </div>
          </div>
        )}

        {/* IoT Scenarios Table */}
        <div className="bg-white rounded-lg border border-gray-200 p-10 mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">IoT Ssenariylar</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Ssenariy</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Texnologiya</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">λ/RO</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">N</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">P_collision</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Yechim</th>
                </tr>
              </thead>
              <tbody>
                {scenariosTableData.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`border-b border-gray-200 ${
                      idx === 0 ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-4 py-3 font-semibold text-gray-900">{row.name}</td>
                    <td className="px-4 py-3 text-gray-900">{row.tech}</td>
                    <td className="px-4 py-3 text-gray-900 font-mono">{row.lambda}</td>
                    <td className="px-4 py-3 text-gray-900 font-mono">{row.N}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          row.collision < 10
                            ? 'bg-green-100 text-green-800'
                            : row.collision < 30
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {row.collision}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 text-xs">{row.solution}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Formula Explanation */}
        <div className="bg-linear-to-br from-blue-50 dark:from-blue-900/20 to-indigo-50 dark:to-indigo-900/20 rounded-lg border-2 border-blue-300 dark:border-blue-800 p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Grant-free RA Formulalari</h3>
            <FormulaButton formulaKey="collision" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Load */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Yuklanish:</p>
              <p className="font-mono text-gray-900 dark:text-gray-200 mb-2">λ = Qurilmalar soni / PRACH RO soni</p>
              <div className="text-xs text-gray-700 dark:text-gray-300 space-y-1 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div>Qurilmalar = {numDevices}</div>
                <div>PRACH RO = {numRO}</div>
                <div className="font-bold text-blue-600 dark:text-blue-400 mt-2">λ = {lambdaPerRO}</div>
              </div>
            </div>

            {/* Collision */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Kolliziya ehtimoli:</p>
              <p className="font-mono text-gray-900 dark:text-gray-200 mb-2">P<sub>col</sub> = 1 - e<sup>-λ/N</sup> × 1.4</p>
              <div className="text-xs text-gray-700 dark:text-gray-300 space-y-1 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div>Grant-based: {p_col_grantbased}%</div>
                <div>Grant-free: {p_col_grantfree}%</div>
                <div className="font-bold text-green-600 dark:text-green-400 mt-2">
                  Overhead = 40% → Grant-free {energy_saving_pct}% energiya tejash
                </div>
              </div>
            </div>

            {/* Latency */}
            <div className="bg-white rounded-lg p-6 border border-blue-200">
              <p className="text-sm font-semibold text-gray-900 mb-3">Kechikish:</p>
              <p className="font-mono text-gray-900 mb-2">T = Preambula + Data + ACK</p>
              <div className="text-xs text-gray-700 space-y-1 mt-3 pt-3 border-t border-gray-200">
                <div>Grant-based: {latency_grantbased} ms (4 ta xabar)</div>
                <div>Grant-free: {latency_grantfree} ms (2 ta xabar)</div>
                <div className="font-bold text-red-600 mt-2">
                  Grant-free {(((latency_grantbased - latency_grantfree) / latency_grantbased) * 100).toFixed(0)}% tezroq
                </div>
              </div>
            </div>

            {/* Satellite */}
            <div className="bg-white rounded-lg p-6 border border-blue-200">
              <p className="text-sm font-semibold text-gray-900 mb-3">Satellite NTN:</p>
              <p className="font-mono text-gray-900 mb-2">T = 2 × Distance / c</p>
              <div className="text-xs text-gray-700 space-y-1 mt-3 pt-3 border-t border-gray-200">
                <div>LEO (600km): {LEO_delay}</div>
                <div>GEO (35,786km): {GEO_delay}</div>
                <div className="font-bold text-purple-600 mt-2">
                  Format1 radius = {Format1_radius} km
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Burst Traffic Simulator */}
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <BurstTrafficSimulator />
        </div>
      </div>
    </div>
  );
}
