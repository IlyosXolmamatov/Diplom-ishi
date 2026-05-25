import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import ExportButton from '../components/ExportButton';

export default function Comparison() {
  const [snr, setSnr] = useState(-5);

  // Hardcoded methods data
  const methods = [
    {
      name: 'Pure ALOHA',
      throughput: 18.4,
      latency: 100,
      collision: 63.2,
      energy: 20,
      complexity: 10,
      standard: 'Tarixiy',
      color: '#9E9E9E',
    },
    {
      name: 'Slotted ALOHA',
      throughput: 36.8,
      latency: 75,
      collision: 63.2,
      energy: 25,
      complexity: 20,
      standard: 'Qisman',
      color: '#FF9800',
    },
    {
      name: '4-step PRACH',
      throughput: 85,
      latency: 16.5,
      collision: 36.4,
      energy: 50,
      complexity: 75,
      standard: 'Rel-15',
      color: '#2196F3',
    },
    {
      name: '2-step PRACH',
      throughput: 90,
      latency: 6.5,
      collision: 36.4,
      energy: 45,
      complexity: 80,
      standard: 'Rel-16',
      color: '#4CAF50',
    },
    {
      name: 'Grant-free RA',
      throughput: 75,
      latency: 2,
      collision: 45,
      energy: 15,
      complexity: 60,
      standard: 'Rel-17',
      color: '#9C27B0',
    },
    {
      name: 'SVM+PRACH',
      throughput: 90,
      latency: 6.5,
      collision: 36.4,
      energy: 55,
      complexity: 90,
      standard: 'Tadqiqot',
      color: '#F44336',
    },
  ];

  // Summary cards data
  const summaryCards = [
    {
      label: 'Eng yuqori throughput',
      value: '2-step PRACH',
      metric: '90%',
      color: 'from-green-50 to-green-100 border-green-300',
    },
    {
      label: 'Eng past kechikish',
      value: 'Grant-free RA',
      metric: '2 ms',
      color: 'from-blue-50 to-blue-100 border-blue-300',
    },
    {
      label: 'Eng past kolliziya',
      value: '4/2-step PRACH',
      metric: '36.4%',
      color: 'from-purple-50 to-purple-100 border-purple-300',
    },
    {
      label: 'Eng kam energiya',
      value: 'Grant-free RA',
      metric: '15 rel',
      color: 'from-orange-50 to-orange-100 border-orange-300',
    },
    {
      label: 'Eng yuqori standart',
      value: '2-step PRACH',
      metric: 'Rel-16',
      color: 'from-pink-50 to-pink-100 border-pink-300',
    },
  ];

  // Throughput bar chart data
  const throughputData = methods.map(m => ({
    name: m.name.split(' ')[0],
    throughput: m.throughput,
    color: m.color,
  }));

  // PRACH degradation with UE count
  const ueCountData = useMemo(() => {
    const data = [];
    for (let ue = 0; ue <= 500; ue += 25) {
      const load = ue / 64;
      const loadFactor = Math.exp(-load);
      
      data.push({
        ue,
        'PRACH-4step': Math.max(10, 85 * loadFactor),
        'PRACH-2step': Math.max(10, 90 * loadFactor),
        'GF-RA': Math.max(10, 75 * (0.95 - ue / 1000)),
        'Slotted': Math.max(10, 36.8 * loadFactor),
      });
    }
    return data;
  }, []);

  // Radar chart data (4 main methods)
  const radarData = [
    { axis: 'Throughput', 'PRACH-4step': 85, 'PRACH-2step': 90, 'GF-RA': 75, 'Slotted': 36.8 },
    { axis: 'Tezlik', 'PRACH-4step': 83.5, 'PRACH-2step': 93.5, 'GF-RA': 98, 'Slotted': 75 },
    { axis: 'Ishonchlilik', 'PRACH-4step': 95, 'PRACH-2step': 95, 'GF-RA': 85, 'Slotted': 65 },
    { axis: 'Energiya', 'PRACH-4step': 50, 'PRACH-2step': 55, 'GF-RA': 85, 'Slotted': 75 },
    { axis: 'Murakkablik', 'PRACH-4step': 25, 'PRACH-2step': 20, 'GF-RA': 40, 'Slotted': 80 },
  ];

  // ML Detection curves (SNR-dependent)
  const mlData = useMemo(() => {
    const data = [];
    for (let snrVal = -20; snrVal <= 10; snrVal += 1) {
      const pd_mf = 1 / (1 + Math.exp(-(snrVal + 10) / 2));
      const pd_svm = 1 / (1 + Math.exp(-(snrVal + 12) / 2));
      const pd_ens = 1 / (1 + Math.exp(-(snrVal + 14) / 2));
      
      data.push({
        snr: snrVal,
        'MF': (pd_mf * 100).toFixed(1),
        'SVM': (pd_svm * 100).toFixed(1),
        'Ensemble': (pd_ens * 100).toFixed(1),
      });
    }
    return data;
  }, []);

  // Current ML detection values
  const mlCurrent = useMemo(() => {
    const pd_mf = 1 / (1 + Math.exp(-(snr + 10) / 2));
    const pd_svm = 1 / (1 + Math.exp(-(snr + 12) / 2));
    const pd_ens = 1 / (1 + Math.exp(-(snr + 14) / 2));
    
    return {
      pd_mf: (pd_mf * 100).toFixed(1),
      pd_svm: (pd_svm * 100).toFixed(1),
      pd_ens: (pd_ens * 100).toFixed(1),
      delta: ((pd_svm - pd_mf) * 100).toFixed(1),
    };
  }, [snr]);

  // Calculate statistics for summary
  const avgCollision = useMemo(() => {
    const collisions = methods.map(m => m.collision);
    return (collisions.reduce((a, b) => a + b, 0) / collisions.length).toFixed(1);
  }, [methods]);

  const highSlots = useMemo(() => {
    return methods.filter(m => m.collision > 50).length;
  }, [methods]);

  const recommendedACB = useMemo(() => {
    for (let p = 0.01; p <= 1; p += 0.01) {
      const maxCollision = Math.max(...methods.map(m => m.collision));
      const collisionAtP = (1 - Math.exp((-maxCollision * p) / 64)) * 100;
      if (collisionAtP < 20) {
        return p.toFixed(2);
      }
    }
    return '1.00';
  }, [methods]);

  // Helper function to get color for cell
  const getCellColor = (label, value) => {
    if (label === 'Throughput' && value > 80) return 'bg-green-100 dark:bg-green-900';
    if (label === 'Kechikish' && value < 10) return 'bg-green-100 dark:bg-green-900';
    if (label === 'Kolliziya' && value < 40) return 'bg-green-100 dark:bg-green-900';
    return 'bg-white dark:bg-gray-900';
  };

  return (
    <div className="page-container">
      <div className="main-container">
        {/* Page Title */}
        <div className="section mb-16 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="section-title" style={{ color: 'var(--color-text-primary, #1f2937)' }}>Barcha RA Usullarining Taqqoslash Dashboardi</h1>
            <div className="inline-block text-sm px-3 py-1 rounded-full" style={{ backgroundColor: 'var(--color-icon-bg, rgba(59, 130, 246, 0.1))', color: 'var(--color-accent, #3b82f6)' }}>
              3GPP TS 38.211 | ML Detection | Rel-17
            </div>
          </div>
          <div className="flex gap-2">
            <ExportButton 
              snr={snr} 
              avgCollision={avgCollision} 
              highSlots={highSlots}
              recommendedACB={recommendedACB}
            />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
          {summaryCards.map((card, idx) => (
            <div
              key={idx}
              className="rounded-lg border-2 p-4 viz-box"
              style={{ backgroundColor: 'var(--color-card-bg, #ffffff)', borderColor: 'var(--color-card-border, #e5e7eb)' }}
            >
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary, #6b7280)' }}>{card.label}</p>
              <p className="text-lg font-bold mb-1" style={{ color: 'var(--color-text-primary, #1f2937)' }}>{card.value}</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-accent, #3b82f6)' }}>{card.metric}</p>
            </div>
          ))}
        </div>

        {/* Main Comparison Table */}
        <div className="viz-box mb-16 overflow-x-auto" style={{ backgroundColor: 'var(--color-card-bg, #ffffff)' }}>
          <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--color-text-primary, #1f2937)' }}>Keng Taqqoslash Jadval</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ backgroundColor: 'var(--color-bg-secondary, #f3f4f6)', borderBottomColor: 'var(--color-card-border, #e5e7eb)' }} className="border-b-2">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--color-text-primary, #1f2937)' }}>Usul</th>
                  <th className="px-4 py-3 text-center font-semibold" style={{ color: 'var(--color-text-primary, #1f2937)' }}>Throughput (%)</th>
                  <th className="px-4 py-3 text-center font-semibold" style={{ color: 'var(--color-text-primary, #1f2937)' }}>Kechikish (ms)</th>
                  <th className="px-4 py-3 text-center font-semibold" style={{ color: 'var(--color-text-primary, #1f2937)' }}>Kolliziya (%)</th>
                  <th className="px-4 py-3 text-center font-semibold" style={{ color: 'var(--color-text-primary, #1f2937)' }}>Energiya (rel)</th>
                  <th className="px-4 py-3 text-center font-semibold" style={{ color: 'var(--color-text-primary, #1f2937)' }}>Standart</th>
                </tr>
              </thead>
              <tbody>
                {methods.map((method, idx) => (
                  <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? 'var(--color-card-bg, #ffffff)' : 'var(--color-bg-secondary, #f9fafb)', borderBottomColor: 'var(--color-card-border, #e5e7eb)' }} className="border-b">
                    <td className="px-4 py-3 font-semibold" style={{ color: method.color }}>
                      {method.name}
                    </td>
                    <td className={`px-4 py-3 text-center font-semibold ${getCellColor('Throughput', method.throughput)}`}>
                      {method.throughput}
                    </td>
                    <td className={`px-4 py-3 text-center ${getCellColor('Kechikish', method.latency)}`}>
                      {method.latency}
                    </td>
                    <td className={`px-4 py-3 text-center ${getCellColor('Kolliziya', method.collision)}`}>
                      {method.collision}
                    </td>
                    <td className="px-4 py-3 text-center" style={{ color: 'var(--color-text-primary, #1f2937)' }}>{method.energy}</td>
                    <td className="px-4 py-3 text-center text-xs font-semibold" style={{ color: 'var(--color-text-secondary, #6b7280)' }}>{method.standard}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Throughput Bar Chart */}
        <div className="viz-box mb-16">
          <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--color-text-primary, #1f2937)' }}>Throughput Taqqoslash</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={throughputData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `${value}%`} />
              <ReferenceLine y={36.8} stroke="#FF9800" strokeDasharray="5 5" label="Slotted ALOHA max" />
              {throughputData.map((item, idx) => (
                <Bar key={idx} dataKey="throughput" fill={item.color} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* PRACH Degradation Chart */}
        <div className="viz-box mb-16">
          <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--color-text-primary, #1f2937)' }}>
            PRACH Usullari Degradatsiyasi vs UE Soni
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ueCountData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="ue" label={{ value: 'UE Soni', position: 'insureRight', offset: 10 }} />
              <YAxis label={{ value: 'Throughput (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
              <Legend />
              <Line type="monotone" dataKey="PRACH-4step" stroke="#2196F3" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="PRACH-2step" stroke="#4CAF50" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="GF-RA" stroke="#9C27B0" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Slotted" stroke="#FF9800" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Radar Chart */}
        <div className="viz-box mb-16">
          <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--color-text-primary, #1f2937)' }}>Umumiy Qiyosiy Taqqoslash (Radar)</h2>
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={radarData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="axis" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="PRACH-4step" dataKey="PRACH-4step" stroke="#2196F3" fill="#2196F3" fillOpacity={0.3} />
              <Radar name="PRACH-2step" dataKey="PRACH-2step" stroke="#4CAF50" fill="#4CAF50" fillOpacity={0.3} />
              <Radar name="GF-RA" dataKey="GF-RA" stroke="#9C27B0" fill="#9C27B0" fillOpacity={0.3} />
              <Radar name="Slotted" dataKey="Slotted" stroke="#FF9800" fill="#FF9800" fillOpacity={0.3} />
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Improvement Coefficients */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
          <div className="rounded-lg border-2 p-6 viz-box" style={{ backgroundColor: 'var(--color-card-bg, #ffffff)', borderColor: 'var(--color-accent-light, #93c5fd)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary, #1f2937)' }}>Taraqqiyot Koeffitsientlari</h3>
            <div className="space-y-3 text-sm">
              <div className="rounded p-3" style={{ backgroundColor: 'var(--color-bg-secondary, #f9fafb)' }}>
                <p className="font-semibold" style={{ color: 'var(--color-text-primary, #1f2937)' }}>5G PRACH / Slotted ALOHA</p>
                <p className="font-bold text-lg" style={{ color: 'var(--color-accent, #3b82f6)' }}>K = 90/36.8 = 2.45x</p>
              </div>
              <div className="rounded p-3" style={{ backgroundColor: 'var(--color-bg-secondary, #f9fafb)' }}>
                <p className="font-semibold" style={{ color: 'var(--color-text-primary, #1f2937)' }}>2-step / 4-step Kechikish</p>
                <p className="font-bold text-lg" style={{ color: 'var(--color-accent, #3b82f6)' }}>Kamayish = 60.6%</p>
              </div>
              <div className="rounded p-3" style={{ backgroundColor: 'var(--color-bg-secondary, #f9fafb)' }}>
                <p className="font-semibold" style={{ color: 'var(--color-text-primary, #1f2937)' }}>SVM / Klassik PD (SNR=-10dB)</p>
                <p className="font-bold text-lg" style={{ color: 'var(--color-accent, #3b82f6)' }}>+3.6%</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border-2 p-6 viz-box" style={{ backgroundColor: 'var(--color-card-bg, #ffffff)', borderColor: 'var(--color-accent-light, #93c5fd)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary, #1f2937)' }}>Asosiy Foydalanish Ssenariylari</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <span className="font-bold mr-2" style={{ color: 'var(--color-accent, #3b82f6)' }}>→</span>
                <span style={{ color: 'var(--color-text-primary, #1f2937)' }}><span className="font-semibold">Mobil tarmoq:</span> 2-step PRACH (Rel-16+)</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2" style={{ color: 'var(--color-accent, #3b82f6)' }}>→</span>
                <span style={{ color: 'var(--color-text-primary, #1f2937)' }}><span className="font-semibold">mMTC:</span> Grant-free RA (Rel-17)</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2" style={{ color: 'var(--color-accent, #3b82f6)' }}>→</span>
                <span style={{ color: 'var(--color-text-primary, #1f2937)' }}><span className="font-semibold">URLLC:</span> SVM+PRACH (Tadqiqot)</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2" style={{ color: 'var(--color-accent, #3b82f6)' }}>→</span>
                <span style={{ color: 'var(--color-text-primary, #1f2937)' }}><span className="font-semibold">Irsiy:</span> Slotted ALOHA (Qisman)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ML Detection Section */}
        <div className="rounded-lg border-2 p-10 mb-16 viz-box" style={{ backgroundColor: 'var(--color-card-bg, #ffffff)', borderColor: 'var(--color-card-border, #e5e7eb)' }}>
          <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--color-text-primary, #1f2937)' }}>
            ML asosidagi aniqlash taqqoslashi (Manba [1],[4])
          </h2>

          {/* SNR Slider */}
          <div className="mb-8">
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary, #1f2937)' }}>
              SNR: {snr} dB
            </label>
            <input
              type="range"
              min="-20"
              max="10"
              value={snr}
              onChange={(e) => setSnr(parseInt(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{ accentColor: 'var(--color-accent, #3b82f6)' }}
            />
            <p className="text-xs mt-2" style={{ color: 'var(--color-text-secondary, #6b7280)' }}>-20 dan +10 dB gacha qo'ying</p>
          </div>

          {/* ML Detection Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="rounded-lg p-4 border viz-box" style={{ backgroundColor: 'var(--color-card-bg, #ffffff)', borderColor: 'var(--color-accent, #3b82f6)' }}>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary, #6b7280)' }}>PD_MF (Matched Filter)</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--color-accent, #3b82f6)' }}>{mlCurrent.pd_mf}%</p>
            </div>
            <div className="rounded-lg p-4 border viz-box" style={{ backgroundColor: 'var(--color-card-bg, #ffffff)', borderColor: '#4CAF50' }}>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary, #6b7280)' }}>PD_SVM</p>
              <p className="text-3xl font-bold" style={{ color: '#4CAF50' }}>{mlCurrent.pd_svm}%</p>
            </div>
            <div className="rounded-lg p-4 border viz-box" style={{ backgroundColor: 'var(--color-card-bg, #ffffff)', borderColor: '#9C27B0' }}>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary, #6b7280)' }}>PD_Ensemble</p>
              <p className="text-3xl font-bold" style={{ color: '#9C27B0' }}>{mlCurrent.pd_ens}%</p>
            </div>
            <div className="rounded-lg p-4 border viz-box" style={{ backgroundColor: 'var(--color-card-bg, #ffffff)', borderColor: '#FF9800' }}>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary, #6b7280)' }}>Δ(SVM-MF)</p>
              <p className="text-3xl font-bold" style={{ color: '#FF9800' }}>+{mlCurrent.delta}%</p>
            </div>
          </div>

          {/* ML Detection Chart */}
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mlData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="snr" label={{ value: 'SNR (dB)', position: 'insureRight', offset: 10 }} />
              <YAxis label={{ value: 'Aniqlash Ehtimoli (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
              <ReferenceLine x={snr} stroke="#666" strokeDasharray="5 5" label={`Hozirgi SNR: ${snr}dB`} />
              <Line type="monotone" dataKey="MF" stroke="#2196F3" strokeWidth={2} dot={false} name="MF" />
              <Line type="monotone" dataKey="SVM" stroke="#4CAF50" strokeWidth={2} dot={false} name="SVM" />
              <Line type="monotone" dataKey="Ensemble" stroke="#9C27B0" strokeWidth={2} dot={false} name="Ensemble" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Source References */}
        <div className="viz-box rounded-lg border" style={{ backgroundColor: 'var(--color-card-bg, #ffffff)', borderColor: 'var(--color-card-border, #e5e7eb)' }}>
          <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--color-text-primary, #1f2937)' }}>Manbalari va Adabiyotlar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="rounded p-4 border-l-4" style={{ backgroundColor: 'var(--color-bg-secondary, #f9fafb)', borderLeftColor: 'var(--color-accent, #3b82f6)' }}>
              <p className="font-semibold" style={{ color: 'var(--color-text-primary, #1f2937)' }}>[1] Nature 2023</p>
              <p style={{ color: 'var(--color-text-secondary, #6b7280)' }}>ML Detection in PRACH Systems</p>
            </div>
            <div className="rounded p-4 border-l-4" style={{ backgroundColor: 'var(--color-bg-secondary, #f9fafb)', borderLeftColor: '#4CAF50' }}>
              <p className="font-semibold" style={{ color: 'var(--color-text-primary, #1f2937)' }}>[2] IEEE 5G 2023</p>
              <p style={{ color: 'var(--color-text-secondary, #6b7280)' }}>Grant-free Random Access Analysis</p>
            </div>
            <div className="rounded p-4 border-l-4" style={{ backgroundColor: 'var(--color-bg-secondary, #f9fafb)', borderLeftColor: '#9C27B0' }}>
              <p className="font-semibold" style={{ color: 'var(--color-text-primary, #1f2937)' }}>[3] 3GPP TR 38.901</p>
              <p style={{ color: 'var(--color-text-secondary, #6b7280)' }}>5G Radio Propagation Models</p>
            </div>
            <div className="rounded p-4 border-l-4" style={{ backgroundColor: 'var(--color-bg-secondary, #f9fafb)', borderLeftColor: '#FF9800' }}>
              <p className="font-semibold" style={{ color: 'var(--color-text-primary, #1f2937)' }}>[4] arXiv 2023</p>
              <p style={{ color: 'var(--color-text-secondary, #6b7280)' }}>SVM-based Preamble Detection</p>
            </div>
            <div className="rounded p-4 border-l-4" style={{ backgroundColor: 'var(--color-bg-secondary, #f9fafb)', borderLeftColor: '#F44336' }}>
              <p className="font-semibold" style={{ color: 'var(--color-text-primary, #1f2937)' }}>[5] MDPI Electronics 2023</p>
              <p style={{ color: 'var(--color-text-secondary, #6b7280)' }}>Throughput Optimization Methods</p>
            </div>
            <div className="rounded p-4 border-l-4" style={{ backgroundColor: 'var(--color-bg-secondary, #f9fafb)', borderLeftColor: '#EC407A' }}>
              <p className="font-semibold" style={{ color: 'var(--color-text-primary, #1f2937)' }}>[6] IEEE ComMag 2023</p>
              <p style={{ color: 'var(--color-text-secondary, #6b7280)' }}>2-step RACH Performance</p>
            </div>
            <div className="rounded p-4 border-l-4" style={{ backgroundColor: 'var(--color-bg-secondary, #f9fafb)', borderLeftColor: '#00BCD4' }}>
              <p className="font-semibold" style={{ color: 'var(--color-text-primary, #1f2937)' }}>[7] Telecom Review 2023</p>
              <p style={{ color: 'var(--color-text-secondary, #6b7280)' }}>3GPP Rel-17 Features</p>
            </div>
            <div className="rounded p-4 border-l-4" style={{ backgroundColor: 'var(--color-bg-secondary, #f9fafb)', borderLeftColor: '#3F51B5' }}>
              <p className="font-semibold" style={{ color: 'var(--color-text-primary, #1f2937)' }}>[8] ACM SIGCOM 2024</p>
              <p style={{ color: 'var(--color-text-secondary, #6b7280)' }}>Comparative RA Analysis</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
