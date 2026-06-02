import { useState, useEffect } from 'react';
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
import './GrantFreeRA.css';

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
          <p className="section-subtitle">
            Qurilmalari ko'p bo'lgan IoT va mMTC txolatlar uchun optimizatsiya
          </p>
          <div className="badge-pill">
            3GPP Rel-17 | mMTC / IoT Scenarios
          </div>
        </div>

        {/* Scenario Selector */}
        <div className="mb-12">
          <h2 className="scenario-selector-title">Ssenario tanlang</h2>
          <div className="scenario-grid">
            {Object.entries(scenarioConfigs).map(([key, conf]) => {
              const Icon = conf.icon;
              return (
                <button
                  key={key}
                  onClick={() => setScenario(key)}
                  className={`scenario-button ${scenario === key ? 'active' : ''}`}
                >
                  <Icon className="scenario-icon w-6 h-6 mb-2" />
                  <h3 className="scenario-name">{conf.name}</h3>
                  <p className="scenario-tech">{conf.technology}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scenario Info Card */}
        <div className="viz-box mb-12">
          <h2 className="control-section-title">Ssenario ma'lumotlari</h2>
          <div className="info-grid-4">
            <div className="info-item">
              <p className="info-item-label">Texnologiya</p>
              <p className="info-item-value">{config.technology}</p>
            </div>
            <div className="info-item">
              <p className="info-item-label">Preambula formati</p>
              <p className="info-item-value">{config.format}</p>
            </div>
            <div className="info-item">
              <p className="info-item-label">Qurilmalar soni</p>
              <p className="info-item-value">{numDevices}</p>
            </div>
            <div className="info-item">
              <p className="info-item-label">PRACH RO soni</p>
              <p className="info-item-value">{numRO}</p>
            </div>
          </div>
        </div>

        {/* Input Controls */}
        <div className="viz-box mb-16">
          <h2 className="control-section-title">Parametrlar</h2>
          <div className="parameter-group">
            {/* Devices Slider */}
            <div className="slider-container">
              <label className="slider-label">
                Qurilmalar soni: <span className="slider-value">{numDevices}</span>
              </label>
              <input
                type="range"
                min="10"
                max="2000"
                value={numDevices}
                onChange={(e) => setNumDevices(parseInt(e.target.value))}
                className="device-slider"
              />
              <p className="parameter-note">10-2000 qurilma</p>
            </div>

            {/* RO Slider */}
            <div className="slider-container">
              <label className="slider-label">
                PRACH RO soni: <span className="slider-value">{numRO}</span>
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={numRO}
                onChange={(e) => setNumRO(parseInt(e.target.value))}
                className="device-slider"
              />
              <p className="parameter-note">1-20 PRACH RO per frame</p>
            </div>
          </div>
        </div>

        {/* Results Metrics */}
        <div className="metrics-grid mb-16">
          <div className="metric-card">
            <h3 className="metric-label">λ per RO</h3>
            <p className="metric-value">{lambdaPerRO}</p>
            <p className="metric-unit">qurilma / PRACH RO</p>
          </div>

          <div className="metric-card">
            <h3 className="metric-label">Kolliziya (GF)</h3>
            <p className="metric-value">{p_col_grantfree}%</p>
            <p className="metric-unit">Grant-free rejimi</p>
          </div>

          <div className="metric-card">
            <h3 className="metric-label">Energiya tejash</h3>
            <p className="metric-value">{energy_saving_pct}%</p>
            <p className="metric-unit">Grant-based ga nisbatan</p>
          </div>

          <div className="metric-card">
            <h3 className="metric-label">Kechikish tejash</h3>
            <p className="metric-value">8x</p>
            <p className="metric-unit">Grant-free tezroq</p>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="viz-box mb-12">
          <h2 className="chart-title">Taqqoslash grafigi</h2>
          <div className="chart-container-inner">
            <ResponsiveContainer width="100%" height="350" minHeight={350}>
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
        </div>

        {/* Satellite Section */}
        {scenario === 'satellite' && (
          <div className="satellite-section">
            <h2 className="satellite-title">Satellite NTN (Sun uchun)</h2>

            <div className="satellite-cards-grid">
              <div className="satellite-card">
                <h3 className="satellite-card-label">LEO kechikish</h3>
                <p className="satellite-card-value">{LEO_delay}</p>
                <p className="satellite-card-hint">Polar orbit</p>
              </div>

              <div className="satellite-card orange">
                <h3 className="satellite-card-label">GEO kechikish</h3>
                <p className="satellite-card-value orange">{GEO_delay}</p>
                <p className="satellite-card-hint">Geostationary</p>
              </div>

              <div className="satellite-card purple">
                <h3 className="satellite-card-label">Format1 radius</h3>
                <p className="satellite-card-value purple">{Format1_radius}</p>
                <p className="satellite-card-hint">Maximum coverage</p>
              </div>
            </div>

            <div className="alert-box">
              <p className="alert-text">
                ⚠️ Ogohlik: GEO uchun standart RA timerlar qayta sozlanishi kerak (Extended timing)
              </p>
            </div>
          </div>
        )}

        {/* IoT Scenarios Table */}
        <div className="iot-section">
          <h2 className="iot-title">IoT Ssenariylar</h2>
          <div className="table-wrapper">
            <table className="iot-table">
              <thead>
                <tr>
                  <th>Ssenariy</th>
                  <th>Texnologiya</th>
                  <th>λ/RO</th>
                  <th>N</th>
                  <th>P_collision</th>
                  <th>Yechim</th>
                </tr>
              </thead>
              <tbody>
                {scenariosTableData.map((row, idx) => (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: '1px solid #d1d5db',
                      backgroundColor: idx === 0 ? '#dbeafe' : 'transparent'
                    }}
                  >
                    <td style={{padding: '12px 16px', fontWeight: '600', color: '#111827'}}>{row.name}</td>
                    <td style={{padding: '12px 16px', color: '#111827'}}>{row.tech}</td>
                    <td style={{padding: '12px 16px', color: '#111827', fontFamily: 'monospace'}}>{row.lambda}</td>
                    <td style={{padding: '12px 16px', color: '#111827', fontFamily: 'monospace'}}>{row.N}</td>
                    <td style={{padding: '12px 16px'}}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: row.collision < 10 ? '#dcfce7' : row.collision < 30 ? '#fef3c7' : '#fee2e2',
                          color: row.collision < 10 ? '#166534' : row.collision < 30 ? '#92400e' : '#991b1b'
                        }}
                      >
                        {row.collision}%
                      </span>
                    </td>
                    <td style={{padding: '12px 16px', color: '#6b7280', fontSize: '12px'}}>{row.solution}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Formula Explanation */}
        <div className="formula-section-grant-free">
          <div className="formula-header-grant-free">
            <h3 className="formula-title-grant-free">Grant-free RA Formulalari</h3>
            <FormulaButton formulaKey="collision" />
          </div>

          <div className="formula-grid-grant-free">
            {/* Load */}
            <div className="formula-card-grant-free">
              <p className="formula-label-grant-free">Yuklanish:</p>
              <p className="formula-text-grant-free">λ = Qurilmalar soni / PRACH RO soni</p>
              <div className="formula-details-grant-free">
                <div>Qurilmalar = {numDevices}</div>
                <div>PRACH RO = {numRO}</div>
                <div className="formula-value-grant-free">λ = {lambdaPerRO}</div>
              </div>
            </div>

            {/* Collision */}
            <div className="formula-card-grant-free">
              <p className="formula-label-grant-free">Kolliziya ehtimoli:</p>
              <p className="formula-text-grant-free">P<sub>col</sub> = 1 - e<sup>-λ/N</sup> × 1.4</p>
              <div className="formula-details-grant-free">
                <div>Grant-based: {p_col_grantbased}%</div>
                <div>Grant-free: {p_col_grantfree}%</div>
                <div className="formula-value-grant-free">
                  Overhead = 40% → Grant-free {energy_saving_pct}% energiya tejash
                </div>
              </div>
            </div>

            {/* Latency */}
            <div className="formula-card-grant-free">
              <p className="formula-label-grant-free">Kechikish:</p>
              <p className="formula-text-grant-free">T = Preambula + Data + ACK</p>
              <div className="formula-details-grant-free">
                <div>Grant-based: {latency_grantbased} ms (4 ta xabar)</div>
                <div>Grant-free: {latency_grantfree} ms (2 ta xabar)</div>
                <div className="formula-value-grant-free">
                  Grant-free {(((latency_grantbased - latency_grantfree) / latency_grantbased) * 100).toFixed(0)}% tezroq
                </div>
              </div>
            </div>

            {/* Satellite */}
            <div className="formula-card-grant-free">
              <p className="formula-label-grant-free">Satellite NTN:</p>
              <p className="formula-text-grant-free">T = 2 × Distance / c</p>
              <div className="formula-details-grant-free">
                <div>LEO (600km): {LEO_delay}</div>
                <div>GEO (35,786km): {GEO_delay}</div>
                <div className="formula-value-grant-free">
                  Format1 radius = {Format1_radius} km
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Burst Traffic Simulator */}
      <div className="burst-section">
        <div className="burst-container">
          <BurstTrafficSimulator />
        </div>
      </div>
    </div>
  );
}
