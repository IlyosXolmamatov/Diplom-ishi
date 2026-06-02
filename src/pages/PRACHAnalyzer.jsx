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
import './PRACHAnalyzer.css';

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
    <div className="prach-container">
      <div className="prach-content">
        {/* Page Title */}
        <div className="page-header mb-32">
          <h1 className="page-title">PRACH Tahlil</h1>
          <p className="page-subtitle">
            Kolliziya ehtimoli va otkazuvchanlik hisoblash
          </p>
         
        </div>

        {/* Input Panel */}
        <div className="viz-box mb-32">
          <div className="input-controls">
            {/* UE Count Input */}
            <div className="control-group">
              <label className="control-label">
                UE soni (M)
              </label>
              <input
                type="number"
                min="1"
                max="2000"
                value={numUE}
                onChange={(e) => setNumUE(Math.max(1, Math.min(2000, parseInt(e.target.value) || 1)))}
                className="control-input"
              />
              <p className="parameter-note">Min: 1, Max: 2000</p>
            </div>

            {/* Preamble Count Select */}
            <div className="control-group">
              <label className="control-label">
                Preambula soni (N)
              </label>
              <select
                value={numPreamble}
                onChange={(e) => setNumPreamble(parseInt(e.target.value))}
                className="select-field"
              >
                <option value={64}>64</option>
                <option value={128}>128</option>
                <option value={256}>256</option>
                <option value={512}>512</option>
              </select>
            </div>

            {/* pAcb Slider */}
            <div className="control-group">
              <label className="control-label">
                ACB ehtimoli: <span className="control-value">{pAcb.toFixed(2)}</span>
              </label>
              <input
                type="range"
                min="0.01"
                max="1.0"
                step="0.01"
                value={pAcb}
                onChange={(e) => setPAcb(parseFloat(e.target.value))}
                className="device-slider"
              />
              <p className="parameter-note">0.01 - 1.0</p>
            </div>

            {/* Calculated Metrics */}
            <div className={`beta-status beta-${beta < 0.5 ? 'low' : beta < 1 ? 'medium' : 'high'}`} style={{padding: '16px', borderRadius: '8px'}}>
              <p className="stat-label">Yuk koeffitsienti β</p>
              <p style={{fontSize: '28px', fontWeight: 700, color: 'inherit', margin: '4px 0'}}>
                {beta.toFixed(2)}
              </p>
              <p className="stat-note" style={{marginTop: '8px'}}>{getBetaLabel()}</p>
            </div>
          </div>

          {/* Metrics Row */}
          <div className="results-grid mt-8 pt-8">
            <div className="result-card">
              <h3 className="result-label">Qabul qilingan UE</h3>
              <p className="result-value">{admitted} / {numUE}</p>
            </div>
            <div className="result-card">
              <h3 className="result-label">Bekor qilingan UE</h3>
              <p className="result-value" style={{color: '#dc2626'}}>{numUE - admitted}</p>
            </div>
          </div>
        </div>

        {/* Results Cards */}
        <div className="results-grid mb-32">
          <div className="result-card">
            <h3 className="result-label">Kolliziya (N=64)</h3>
            <p className="result-value" style={{color: '#dc2626'}}>{collision64.toFixed(1)}%</p>
          </div>

          <div className="result-card">
            <h3 className="result-label">Kolliziya (N={numPreamble})</h3>
            <p className="result-value">{collisionSelected.toFixed(1)}%</p>
          </div>

          <div className="result-card">
            <h3 className="result-label">ACB bilan</h3>
            <p className="result-value" style={{color: '#16a34a'}}>{collisionWithACB.toFixed(1)}%</p>
            <p className="result-detail">Foyda: {(collisionSelected - collisionWithACB).toFixed(1)}%</p>
          </div>

          <div className="result-card">
            <h3 className="result-label">Otkazuvchanlik</h3>
            <p className="result-value" style={{color: '#7c3aed'}}>{throughput.toFixed(4)}</p>
            <p className="result-detail">ρ = {(numUE / numPreamble).toFixed(2)}</p>
          </div>
        </div>

        {/* Chart 1: Collision Probability */}
        <div className="viz-box">
          <h2 className="chart-title">
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

          {/* Collision Formula Card */}
        <div className="formula-card">
          <h3 style={{fontSize: '24px', fontWeight: 600, color: '#1f2937', marginBottom: '24px'}}>
            Kolliziya formulasi
            <span style={{fontSize: '12px', fontWeight: 400, color: '#6b7280', marginLeft: '8px'}}>(Manba [8])</span>
          </h3>
          
          <div className="formula-grid">
            {/* Formula */}
            <div className="formula-section">
              <div className="formula-box">
                <p className="formula-label">Asosiy formula:</p>
                <p className="formula-content">
                  P<sub>kolliziya</sub> = 1 - e<sup>-λ/N</sup>
                </p>
                <p className="formula-description">
                  <div><span style={{fontWeight: 600}}>λ</span> = UE soni</div>
                  <div><span style={{fontWeight: 600}}>N</span> = preambula soni</div>
                  <div><span style={{fontWeight: 600}}>e</span> = Eyler soni (2.718...)</div>
                </p>
              </div>
            </div>

            {/* Worked Example */}
            <div className="formula-section">
              <div className="formula-box">
                <p className="formula-label">Hisoblash namunasi (joriy qiymatlar):</p>
                <div style={{display: 'flex', flexDirection: 'column', gap: '12px', fontFamily: 'monospace', fontSize: '25px', color: '#1f2937'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <span>λ (UE soni):</span>
                    <span style={{fontWeight: 700, color: '#2563eb'}}>{numUE}</span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <span>N (preambula soni):</span>
                    <span style={{fontWeight: 700, color: '#2563eb'}}>{numPreamble}</span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #d1d5db'}}>
                    <span>P = 1 - e<sup>-{numUE}/{numPreamble}</sup></span>
                    <span style={{fontWeight: 700, color: '#dc2626'}}>
                      {(calcCollision(numUE, numPreamble) * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart 2: Throughput */}
        <div className="viz-box ">
          <h2 className="chart-title">
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
{/* Original Explanation */}
        <div style={{backgroundColor: '#f0f9ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '32px', marginBottom: '32px'}}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px'}}>
            <h3 style={{fontSize: '18px', fontWeight: 600, color: '#1f2937'}}>Formulalar</h3>
            <div style={{display: 'flex', gap: '12px'}}>
              <FormulaButton formulaKey="collision" />
              <FormulaButton formulaKey="throughput" />
            </div>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '32px', marginBottom: '16px'}}>
            <div>
              <p style={{fontSize: '12px', fontWeight: 600, color: '#1f2937', marginBottom: '8px'}}>Kolliziya ehtimoli:</p>
              <p style={{fontFamily: 'monospace', color: '#4b5563'}}>P<sub>c</sub> = 1 - e<sup>-M/N</sup></p>
            </div>
            <div>
              <p style={{fontSize: '12px', fontWeight: 600, color: '#1f2937', marginBottom: '8px'}}>Normalangan otkazuvchanlik:</p>
              <p style={{fontFamily: 'monospace', color: '#4b5563'}}>S = ρ × e<sup>-ρ</sup>, ρ = M/N</p>
            </div>
          </div>
          <p style={{fontSize: '12px', color: '#6b7280', marginTop: '16px'}}>
            <span style={{fontWeight: 600}}>Izoh:</span> M — UE soni, N — preambula soni
          </p>
        </div>
        
        {/* ACB Analysis Table */}
        <div className="viz-box mb-32">
          <h2 className="chart-title">
            ACB Mexanizmi Tahlili (M=500 UE, N=64)
          </h2>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>p_ACB</th>
                  <th>Qabul qilingan UE</th>
                  <th>β koeffitsient</th>
                  <th>Kolliziya %</th>
                  <th>Holat</th>
                </tr>
              </thead>
              <tbody>
                {[1.0, 0.5, 0.2, 0.1, 0.05, 0.02].map((pVal) => {
                  const admittedUE = Math.round(500 * pVal);
                  const beta = (admittedUE / 64).toFixed(2);
                  const collision = (calcCollision(admittedUE, 64) * 100).toFixed(1);

                  return (
                    <tr key={pVal} className="table-body-row">
                      <td className="table-body-cell" style={{fontFamily: 'monospace'}}>{pVal.toFixed(2)}</td>
                      <td className="table-body-cell">{admittedUE}</td>
                      <td className="table-body-cell">{beta}</td>
                      <td className="table-body-cell">{collision}%</td>
                      <td className="table-body-cell">
                        <span style={{padding: '3px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600, display: 'inline-block'}}>
                          {collision < 20 ? "A'lo" : collision < 50 ? 'Yaxshi' : collision < 80 ? 'Qabul qilinadi' : 'Yomon'}
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
        <div className="viz-box mb-32">
          <h2 className="chart-title">
            QoS asosida preambula ajratish
            <span style={{fontSize: '12px', fontWeight: 400, color: '#6b7280', marginLeft: '8px'}}>(Manba [2])</span>
          </h2>
          <div className="qos-grid">
            {/* URLLC */}
            <div className="qos-card qos-card-urllc">
              <div className="qos-card-header">
                <h3 style={{fontSize: '18px', fontWeight: 600, color: '#1e3a8a'}}>URLLC</h3>
                <span className="qos-badge qos-badge-urllc">
                  QCI 1-4
                </span>
              </div>
              <div className="qos-card-content">
                <div className="qos-card-item">
                  <p className="qos-card-label">Preambula soni</p>
                  <p style={{fontSize: '24px', fontWeight: 700, color: '#1e3a8a'}}>16</p>
                </div>
                <div className="qos-card-item qos-card-divider">
                  <p className="qos-card-label">Kolliziya (λ=10)</p>
                  <p style={{fontSize: '18px', fontWeight: 700, color: '#1e40af'}}>
                    {(calcCollision(10, 16) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            {/* eMBB */}
            <div className="qos-card qos-card-embb">
              <div className="qos-card-header">
                <h3 style={{fontSize: '18px', fontWeight: 600, color: '#166534'}}>eMBB</h3>
                <span className="qos-badge qos-badge-embb">
                  QCI 5-7
                </span>
              </div>
              <div className="qos-card-content">
                <div className="qos-card-item">
                  <p className="qos-card-label">Preambula soni</p>
                  <p style={{fontSize: '24px', fontWeight: 700, color: '#166534'}}>32</p>
                </div>
                <div className="qos-card-item qos-card-divider">
                  <p className="qos-card-label">Kolliziya (λ=50)</p>
                  <p style={{fontSize: '18px', fontWeight: 700, color: '#15803d'}}>
                    {(calcCollision(50, 32) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            {/* mMTC */}
            <div className="qos-card qos-card-mmtc">
              <div className="qos-card-header">
                <h3 style={{fontSize: '18px', fontWeight: 600, color: '#92400e'}}>mMTC</h3>
                <span className="qos-badge qos-badge-mmtc">
                  QCI 8-9
                </span>
              </div>
              <div className="qos-card-content">
                <div className="qos-card-item">
                  <p className="qos-card-label">Preambula soni</p>
                  <p style={{fontSize: '24px', fontWeight: 700, color: '#92400e'}}>16</p>
                </div>
                <div className="qos-card-item qos-card-divider">
                  <p className="qos-card-label">Kolliziya (λ=200)</p>
                  <p style={{fontSize: '18px', fontWeight: 700, color: '#b45309'}}>
                    {(calcCollision(200, 16) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      

        
      </div>
    </div>
  );
}

