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
import './LatencyCalculator.css';

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
  const reduction_pct = (((T_4step - T_2step) / T_4step) * 100).toFixed(1);

  // Success rate calculations
  const p1 = Math.exp(-lambda / N);
  const p10 = ((1 - Math.pow(1 - p1, 10)) * 100).toFixed(1);

  // Generate latency chart data
  const latencyChartData = useMemo(() => {
    const t_wait = prachPeriod / 2;
    const t_rar = rarWindow * slotDuration;
    const data = [];
    for (let M = 10; M <= 500; M += 10) {
      const lat4 =
        t_wait +
        t_rar +
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
          <p className="section-subtitle">
            4-step va 2-step RACH protseduralarini solishtirish
          </p>
          <div className="badge-pill">
            3GPP TS 38.321 | Manba [5]
          </div>
        </div>

        {/* Parameters Card */}
        <div className="viz-box mb-16">
          <h2 className="control-section-title">Parametrlar</h2>
          <div className="parameter-group">
            {/* SCS Select */}
            <div className="slider-container">
              <label className="slider-label">
                Subcarrier Spacing (SCS)
              </label>
              <select
                value={scs}
                onChange={(e) => setScs(parseInt(e.target.value))}
                className="select-field"
              >
                <option value={15}>15 kHz</option>
                <option value={30}>30 kHz</option>
                <option value={60}>60 kHz</option>
                <option value={120}>120 kHz</option>
              </select>
              <p className="parameter-note">Slot davomiyligi: {slotDuration.toFixed(3)} ms</p>
            </div>

            {/* PRACH Period Slider */}
            <div className="slider-container">
              <label className="slider-label">
                PRACH davri: <span className="slider-value">{prachPeriod}</span> ms
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={prachPeriod}
                onChange={(e) => setPrachPeriod(parseInt(e.target.value))}
                className="device-slider"
              />
              <p className="parameter-note">1-20 ms</p>
            </div>

            {/* RAR Window Slider */}
            <div className="slider-container">
              <label className="slider-label">
                RAR oynasi: <span className="slider-value">{rarWindow}</span> slot
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={rarWindow}
                onChange={(e) => setRarWindow(parseInt(e.target.value))}
                className="device-slider"
              />
              <p className="parameter-note">1-10 slot</p>
            </div>

            {/* nMsg3 Input */}
            <div className="slider-container">
              <label className="slider-label">
                Msg3 slot-lar (nMsg3)
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={nMsg3}
                onChange={(e) => setNMsg3(Math.max(1, Math.min(5, parseInt(e.target.value) || 1)))}
                className="parameter-input"
              />
              <p className="parameter-note">1-5 slot</p>
            </div>

            {/* nCR Input */}
            <div className="slider-container">
              <label className="slider-label">
                Contention Resolution slot-lar (nCR)
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={nCR}
                onChange={(e) => setNCR(Math.max(1, Math.min(5, parseInt(e.target.value) || 1)))}
                className="parameter-input"
              />
              <p className="parameter-note">1-5 slot</p>
            </div>

            {/* Lambda Input */}
            <div className="slider-container">
              <label className="slider-label">
                UE soni (λ)
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={lambda}
                onChange={(e) => setLambda(Math.max(1, Math.min(500, parseInt(e.target.value) || 1)))}
                className="parameter-input"
              />
              <p className="parameter-note">1-500 UE</p>
            </div>
          </div>
        </div>

        {/* Results Cards */}
        <div className="viz-grid mb-16">
          <div className="viz-stat-box">
            <h3 className="stat-label">4-step kechikish</h3>
            <p className="stat-value blue">{T_4step.toFixed(1)}</p>
            <p className="stat-note">ms</p>
          </div>

          <div className="viz-stat-box">
            <h3 className="stat-label">2-step kechikish</h3>
            <p className="stat-value red">{T_2step.toFixed(1)}</p>
            <p className="stat-note">ms</p>
          </div>

          <div className="viz-stat-box">
            <h3 className="stat-label">Kamaytirish</h3>
            <p className="stat-value green">{reduction_pct}</p>
            <p className="stat-note">%</p>
          </div>

          <div className="viz-stat-box">
            <h3 className="stat-label">Muvaffaqiyat (10 urinish)</h3>
            <p className="stat-value" style={{color: '#a855f7'}}>{p10}</p>
            <p className="stat-note">%</p>
          </div>
        </div>

        {/* Timing Diagram */}
        <div className="viz-box mb-12">
          <h2 className="simulation-title">Vaqt bloklari</h2>

          {/* 4-step diagram */}
          <div className="timing-diagram-container">
            <h3 className="timing-subtitle">4-step RACH</h3>
            <div className="timing-diagram">
              {/* T_wait block */}
              <div
                className="timing-block timing-block-wait"
                style={{ height: `${(T_wait / T_4step) * 100}%` }}
              >
                <span className="timing-block-value">{T_wait.toFixed(2)}</span>
                <span className="timing-block-label">Kutish</span>
              </div>

              {/* T_RAR block */}
              <div
                className="timing-block timing-block-rar"
                style={{ height: `${(T_RAR / T_4step) * 100}%` }}
              >
                <span className="timing-block-value">{T_RAR.toFixed(2)}</span>
                <span className="timing-block-label">RAR</span>
              </div>

              {/* T_Msg3 block */}
              <div
                className="timing-block timing-block-msg3"
                style={{ height: `${(T_Msg3 / T_4step) * 100}%` }}
              >
                <span className="timing-block-value">{T_Msg3.toFixed(2)}</span>
                <span className="timing-block-label">Msg3</span>
              </div>

              {/* T_CR block */}
              <div
                className="timing-block timing-block-cr"
                style={{ height: `${(T_CR / T_4step) * 100}%` }}
              >
                <span className="timing-block-value">{T_CR.toFixed(2)}</span>
                <span className="timing-block-label">CR</span>
              </div>

              {/* Total label */}
              <div className="timing-total-label">
                Jami: {T_4step.toFixed(1)} ms
              </div>
            </div>
          </div>

          {/* 2-step diagram */}
          <div className="timing-diagram-container">
            <h3 className="timing-subtitle">2-step RACH</h3>
            <div className="timing-diagram">
              {/* T_wait block */}
              <div
                className="timing-block timing-block-wait"
                style={{ height: `${(T_wait / T_2step) * 100}%` }}
              >
                <span className="timing-block-value">{T_wait.toFixed(2)}</span>
                <span className="timing-block-label">Kutish</span>
              </div>

              {/* T_RAR block (reduced) */}
              <div
                className="timing-block timing-block-rar-reduced"
                style={{ height: `${((T_RAR * 0.55) / T_2step) * 100}%` }}
              >
                <span className="timing-block-value">{(T_RAR * 0.55).toFixed(2)}</span>
                <span className="timing-block-label">RAR</span>
              </div>

              {/* T_CR block (reduced) */}
              <div
                className="timing-block timing-block-cr-reduced"
                style={{ height: `${((T_CR * 0.5) / T_2step) * 100}%` }}
              >
                <span className="timing-block-value">{(T_CR * 0.5).toFixed(2)}</span>
                <span className="timing-block-label">CR</span>
              </div>

              {/* Total label */}
              <div className="timing-total-label">
                Jami: {T_2step.toFixed(1)} ms
              </div>
            </div>
          </div>
        </div>

        {/* Latency vs UE Chart */}
        <div className="viz-box mb-12">
          <h2 className="simulation-title">Kechikish vs UE soni</h2>
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
          <h2 className="simulation-title">Muvaffaqiyat darajasi (Rel-17)</h2>
          <div className="table-wrapper">
            <table className="latency-table">
              <thead>
                <tr>
                  <th>UE soni</th>
                  <th>P<sub>1</sub> (bir urinish)</th>
                  <th>P<sub>10</sub> (10 urinish)</th>
                </tr>
              </thead>
              <tbody>
                {successRateData.map((row, idx) => (
                  <tr key={idx} className={row.isActive ? 'active' : ''}>
                    <td>
                      <strong>{row.ue}</strong>
                      {row.isActive && <span className="current-badge">✓ Joriy</span>}
                    </td>
                    <td>{row.p1}%</td>
                    <td><strong>{row.p10}%</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="viz-box mb-12">
          <h2 className="simulation-title">RA usullari solishtirish</h2>
          <div className="table-wrapper">
            <table className="latency-table">
              <thead>
                <tr>
                  <th>RA turi</th>
                  <th>Min kechikish</th>
                  <th>O'rtacha kechikish</th>
                  <th>3GPP standart</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>4-step</strong></td>
                  <td style={{color: '#2563eb', fontFamily: 'monospace'}}>{(T_4step * 0.85).toFixed(1)} ms</td>
                  <td style={{color: '#2563eb', fontFamily: 'monospace'}}>{T_4step.toFixed(1)} ms</td>
                  <td style={{color: '#4b5563'}}>Release 15</td>
                </tr>
                <tr>
                  <td><strong>2-step</strong></td>
                  <td style={{color: '#dc2626', fontFamily: 'monospace'}}>{(T_2step * 0.85).toFixed(1)} ms</td>
                  <td style={{color: '#dc2626', fontFamily: 'monospace'}}>{T_2step.toFixed(1)} ms</td>
                  <td style={{color: '#4b5563'}}>Release 16</td>
                </tr>
                <tr style={{backgroundColor: '#dcfce7'}}>
                  <td><strong>Grant-Free RA</strong></td>
                  <td style={{color: '#16a34a', fontFamily: 'monospace'}}>1.0 ms</td>
                  <td style={{color: '#16a34a', fontFamily: 'monospace'}}>2.0 ms</td>
                  <td style={{color: '#4b5563'}}>Release 17</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Formula Explanation */}
        <div className="formula-section">
          <div className="formula-header">
            <div>
              <h3 className="formula-header-title">
                Kechikish formulalari
                <span className="formula-header-subtitle">(Manba [5])</span>
              </h3>
            </div>
            <FormulaButton formulaKey="latency_4step" />
          </div>

          <div className="formula-grid">
            {/* 4-step formula */}
            <div className="formula-box">
              <p className="formula-box-title">4-step RACH:</p>
              <p className="formula-text">
                T<sub>4step</sub> = T<sub>wait</sub> + T<sub>RAR</sub> + T<sub>Msg3</sub> + T<sub>CR</sub>
              </p>
              <div className="formula-details">
                <div>T<sub>wait</sub> = PRACH davri / 2 = {T_wait.toFixed(2)} ms</div>
                <div>T<sub>RAR</sub> = RAR oynasi × slot = {T_RAR.toFixed(2)} ms</div>
                <div>T<sub>Msg3</sub> = nMsg3 × slot = {T_Msg3.toFixed(2)} ms</div>
                <div>T<sub>CR</sub> = nCR × slot = {T_CR.toFixed(2)} ms</div>
                <div className="formula-details-value blue">
                  Jami: {T_4step.toFixed(2)} ms
                </div>
              </div>
            </div>

            {/* 2-step formula */}
            <div className="formula-box">
              <p className="formula-box-title">2-step RACH:</p>
              <p className="formula-text">
                T<sub>2step</sub> = T<sub>wait</sub> + 0.55×T<sub>RAR</sub> + 0.5×T<sub>CR</sub>
              </p>
              <div className="formula-details">
                <div>T<sub>wait</sub> = {T_wait.toFixed(2)} ms</div>
                <div>RAR × 0.55 = {(T_RAR * 0.55).toFixed(2)} ms</div>
                <div>CR × 0.5 = {(T_CR * 0.5).toFixed(2)} ms</div>
                <div className="formula-details-value red">
                  Jami: {T_2step.toFixed(2)} ms
                </div>
              </div>
            </div>

            {/* Success rate formula */}
            <div className="formula-box">
              <p className="formula-box-title">Bir urinishdagi muvaffaqiyat:</p>
              <p className="formula-text">P<sub>1</sub> = e<sup>-λ/N</sup></p>
              <div className="formula-details">
                <div>λ = UE soni = {lambda}</div>
                <div>N = preambula soni = {N}</div>
                <div className="formula-details-value purple">
                  P<sub>1</sub> = {(p1 * 100).toFixed(2)}%
                </div>
              </div>
            </div>

            {/* 10 attempts formula */}
            <div className="formula-box">
              <p className="formula-box-title">10 urinishdagi muvaffaqiyat:</p>
              <p className="formula-text">P<sub>10</sub> = (1 - (1-P<sub>1</sub>)<sup>10</sup>) × 100%</p>
              <div className="formula-details">
                <div>P<sub>1</sub> = {(p1 * 100).toFixed(2)}%</div>
                <div>Kamayish ehtimoli = {((1 - p1) * 100).toFixed(2)}%</div>
                <div className="formula-details-value green">
                  P<sub>10</sub> = {p10}%
                </div>
              </div>
            </div>
          </div>

          {/* Slot duration info */}
          <div className="formula-info-box">
            <p className="formula-info-title">Slot davomiyligi (SCS asosida):</p>
            <p className="formula-info-text">
              Har bir SCS uchun slot davomiyligi = 1 / (SCS / 15) ms
              <br />
              Hozirda: 1 / ({scs} / 15) = <span className="formula-info-highlight">{slotDuration.toFixed(3)} ms</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
