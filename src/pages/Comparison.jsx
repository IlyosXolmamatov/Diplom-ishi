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
import './Comparison.css';

export default function Comparison() {
  const [snr, setSnr] = useState(-5);

  // Hardcoded methods data - wrap in useMemo to prevent dependency warnings
  const methods = useMemo(() => [
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
  ], []);

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

  return (
    <div className="comparison-page">
      <div className="comparison-wrapper">
        {/* Page Title */}
        <div className="comparison-header mb-16">
          <h1 className="comparison-title">Barcha RA Usullarining Taqqoslash Dashboardi</h1>
          <div className="badge-pill" style={{marginTop: '12px'}}>
            3GPP TS 38.211 | ML Detection | Rel-17
          </div>
          <div style={{marginTop: '16px'}}>
            <ExportButton 
              snr={snr} 
              avgCollision={avgCollision} 
              highSlots={highSlots}
              recommendedACB={recommendedACB}
            />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="summary-cards-grid mb-16">
          {summaryCards.map((card, idx) => (
            <div key={idx} className="summary-card">
              <p className="card-label">{card.label}</p>
              <p className="card-value">{card.value}</p>
              <p className="card-metric blue-text">{card.metric}</p>
            </div>
          ))}
        </div>

        {/* Main Comparison Table */}
        <div className="chart-container ">
          <h2 className="chart-title">Keng Taqqoslash Jadval</h2>
          <div className="table-container">
            <table className="comparison-table">
              <thead className="table-header-row">
                <tr>
                  <th className="table-header-cell">Usul</th>
                  <th className="table-header-cell">Throughput (%)</th>
                  <th className="table-header-cell">Kechikish (ms)</th>
                  <th className="table-header-cell">Kolliziya (%)</th>
                  <th className="table-header-cell">Energiya (rel)</th>
                  <th className="table-header-cell">Standart</th>
                </tr>
              </thead>
              <tbody>
                {methods.map((method, idx) => (
                  <tr key={idx} className="table-body-row">
                    <td className="table-body-cell" style={{ color: method.color, fontWeight: 600 }}>
                      <span className="color-indicator" style={{backgroundColor: method.color}}></span>
                      {method.name}
                    </td>
                    <td className="table-body-cell blue-text">{method.throughput}</td>
                    <td className="table-body-cell blue-text">{method.latency}</td>
                    <td className="table-body-cell blue-text">{method.collision}</td>
                    <td className="table-body-cell">{method.energy}</td>
                    <td className="table-body-cell" style={{fontSize: '12px', fontWeight: 600}}>{method.standard}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Throughput Bar Chart */}
        <div className="chart-container mb-16">
          <h2 className="chart-title">Throughput Taqqoslash</h2>
          <div className="throughput-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={throughputData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                {throughputData.map((data, idx) => (
                  <Bar key={idx} dataKey="throughput" fill={data.color} name={data.name} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PRACH Degradation Chart */}
        <div className="chart-container mb-16">
          <h2 className="chart-title">PRACH Usullari Degradatsiyasi vs UE Soni</h2>
          <div className="ue-count-chart">
            <ResponsiveContainer width="100%" height="100%">
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
        </div>

        {/* Radar Chart */}
        <div className="chart-container mb-16">
          <h2 className="chart-title">Umumiy Qiyosiy Taqqoslash (Radar)</h2>
          <div className="radar-chart">
            <ResponsiveContainer width="100%" height="100%">
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
        </div>

        {/* Improvement Coefficients */}
        <div className="improvement-grid">
          <div className="improvement-box">
            <h3 className="improvement-title">Taraqqiyot Koeffitsientlari</h3>
            <div className="coefficient-list">
              <div className="coefficient-item">
                <p className="coefficient-label">5G PRACH / Slotted ALOHA</p>
                <p className="coefficient-value">K = 90/36.8 = 2.45x</p>
              </div>
              <div className="coefficient-item">
                <p className="coefficient-label">2-step / 4-step Kechikish</p>
                <p className="coefficient-value">Kamayish = 60.6%</p>
              </div>
              <div className="coefficient-item">
                <p className="coefficient-label">SVM / Klassik PD (SNR=-10dB)</p>
                <p className="coefficient-value">+3.6%</p>
              </div>
            </div>
          </div>

          <div className="improvement-box">
            <h3 className="improvement-title">Asosiy Foydalanish Ssenariylari</h3>
            <ul className="usage-list">
              <li className="usage-item">
                <span className="usage-arrow">→</span>
                <span className="usage-text"><span className="usage-bold">Mobil tarmoq:</span> 2-step PRACH (Rel-16+)</span>
              </li>
              <li className="usage-item">
                <span className="usage-arrow">→</span>
                <span className="usage-text"><span className="usage-bold">mMTC:</span> Grant-free RA (Rel-17)</span>
              </li>
              <li className="usage-item">
                <span className="usage-arrow">→</span>
                <span className="usage-text"><span className="usage-bold">URLLC:</span> SVM+PRACH (Tadqiqot)</span>
              </li>
              <li className="usage-item">
                <span className="usage-arrow">→</span>
                <span className="usage-text"><span className="usage-bold">Irsiy:</span> Slotted ALOHA (Qisman)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ML Detection Section */}
        <div className="ml-section">
          <h2 className="ml-title">
            ML asosidagi aniqlash taqqoslashi (Manba [1],[4])
          </h2>

          {/* SNR Slider */}
          <div className="snr-control-group">
            <label className="snr-label-block">
              SNR: {snr} dB
            </label>
            <input
              type="range"
              min="-20"
              max="10"
              value={snr}
              onChange={(e) => setSnr(parseInt(e.target.value))}
              className="snr-slider-range"
            />
            <p className="snr-hint">-20 dan +10 dB gacha qo'ying</p>
          </div>

          {/* ML Detection Metrics */}
          <div className="ml-detection-grid">
            <div className="ml-card" style={{borderColor: 'var(--color-accent, #3b82f6)'}}>
              <p className="ml-card-label">PD_MF (Matched Filter)</p>
              <p className="ml-card-value">{mlCurrent.pd_mf}%</p>
            </div>
            <div className="ml-card" style={{borderColor: '#4CAF50'}}>
              <p className="ml-card-label">PD_SVM</p>
              <p className="ml-card-value green">{mlCurrent.pd_svm}%</p>
            </div>
            <div className="ml-card" style={{borderColor: '#9C27B0'}}>
              <p className="ml-card-label">PD_Ensemble</p>
              <p className="ml-card-value purple">{mlCurrent.pd_ens}%</p>
            </div>
            <div className="ml-card" style={{borderColor: '#FF9800'}}>
              <p className="ml-card-label">Δ(SVM-MF)</p>
              <p className="ml-card-value orange">+{mlCurrent.delta}%</p>
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
      </div>
    </div>
  );
}
