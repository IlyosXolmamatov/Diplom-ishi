import { useState, useMemo } from 'react';
import {
  ComposedChart,
  ScatterChart,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  Scatter,
  ReferenceLine,
  Bar,
} from 'recharts';
import './ZCSequenceVisualizer.css';

/**
 * ZC ketma-ketlik generatsiyasi
 * x_u(n) = exp(-j * pi * u * n * (n+1) / L)
 */
const generateZCSequence = (u, L) => {
  const sequence = [];
  for (let n = 0; n < L; n++) {
    const angle = (-Math.PI * u * n * (n + 1)) / L;
    sequence.push({
      n,
      real: Math.cos(angle),
      imag: Math.sin(angle),
      magnitude: 1.0,
    });
  }
  return sequence;
};

/**
 * Cross-Correlation hisoblash
 */
const calculateCrossCorrelation = (seq1, seq2) => {
  const L = seq1.length;
  const correlation = [];

  for (let lag = 0; lag < L; lag++) {
    let sumReal = 0;
    let sumImag = 0;

    for (let n = 0; n < L; n++) {
      const idx = (n + lag) % L;

      const a = seq1[n].real;
      const b = seq1[n].imag;
      const c = seq2[idx].real;
      const d = seq2[idx].imag;

      sumReal += (a * c + b * d);
      sumImag += (b * c - a * d);
    }

    const magnitude = Math.sqrt(sumReal * sumReal + sumImag * sumImag) / L;
    correlation.push({ lag, value: magnitude });
  }
  return correlation;
};

/**
 * InfoCard Component
 */
const InfoCard = ({ label, value, unit = '', description = '' }) => (
  <div className="zc-stat-card">
    <div className="zc-stat-label">{label}</div>
    <div className="zc-stat-value">{value}</div>
    {unit && <div className="zc-stat-unit">{unit}</div>}
    {description && <div className="zc-stat-description">{description}</div>}
  </div>
);

/**
 * ChartCard Component
 */
const ChartCard = ({ title, children }) => (
  <div className="zc-chart-card">
    <h3 className="zc-chart-title">{title}</h3>
    <div className="zc-chart-container">
      {children}
    </div>
  </div>
);

export default function ZCSequenceVisualizer() {
  // State
  const [L_RA, setL_RA] = useState(139);
  const [rootIndex, setRootIndex] = useState(22);
  const [showMagnitude, setShowMagnitude] = useState(true);
  const [showPhase, setShowPhase] = useState(false);
  const [showCorrelation, setShowCorrelation] = useState(false);

  // Calculations
  const maxRootIndex = useMemo(() => L_RA - 1, [L_RA]);
  const safeRootIndex = Math.min(rootIndex, maxRootIndex);

  const zcSequence = useMemo(
    () => generateZCSequence(safeRootIndex, L_RA),
    [safeRootIndex, L_RA]
  );

  const magnitudeData = useMemo(() => {
    return zcSequence.slice(0, 50).map((item) => ({
      n: item.n,
      magnitude: item.magnitude,
    }));
  }, [zcSequence]);

  const complexPlaneData = useMemo(
    () => zcSequence.map((item) => ({ real: item.real, imag: item.imag })),
    [zcSequence]
  );

  const correlationData = useMemo(() => {
    if (!showCorrelation) return [];
    const nextRoot = safeRootIndex === maxRootIndex ? safeRootIndex - 1 : safeRootIndex + 1;
    const seq1 = zcSequence;
    const seq2 = generateZCSequence(nextRoot, L_RA);
    return calculateCrossCorrelation(seq1, seq2);
  }, [safeRootIndex, L_RA, showCorrelation, zcSequence, maxRootIndex]);

  const theoreticalThreshold = useMemo(() => 1 / Math.sqrt(L_RA), [L_RA]);
  const maxPreambula = Math.floor(L_RA / 13);
  const L_RALabel = L_RA === 139 ? 'Qisqa (139)' : 'Uzun (839)';

  return (
    <div className="zc-container">
      <div className="zc-wrapper">
        {/* Header */}
        <div className="zc-header">
          <h1 className="zc-title">Zadoff-Chu Ketma-ketligi</h1>
          <p className="zc-subtitle">3GPP TS 38.211, Section 6.3.3 — 5G NR PRACH Vizualizatsiyasi</p>
        </div>

        {/* Formula Block */}
        <div className="zc-formula-block">
          <h3 className="zc-formula-title">Matematik Formula</h3>
          <div className="zc-formula-display">
            <div className="zc-formula-text">
              x<sub>u</sub>(n) = e<sup>-j·π·u·n·(n + 1) / L<sub>RA</sub></sup>
            </div>
          </div>
          <div className="zc-formula-params">
            <div className="zc-formula-param">
              <div className="zc-formula-param-label">
                <span style={{ color: '#2563eb' }}>u</span> — Root indeksi
              </div>
              <div className="zc-formula-param-value">1 ≤ u ≤ {maxRootIndex}</div>
            </div>
            <div className="zc-formula-param">
              <div className="zc-formula-param-label">
                <span style={{ color: '#2563eb' }}>n</span> — Element indeksi
              </div>
              <div className="zc-formula-param-value">0 ≤ n &lt; L<sub>RA</sub></div>
            </div>
            <div className="zc-formula-param">
              <div className="zc-formula-param-label">
                L<sub>RA</sub> — Preambula uzunligi
              </div>
              <div className="zc-formula-param-value">139 yoki 839</div>
            </div>
          </div>
        </div>

        {/* Control Cards */}
        <div className="zc-controls-grid">
          {/* Root Index Card */}
          <div className="zc-control-card">
            <label className="zc-control-label">Root Indeksi (u)</label>
            <div className="zc-slider-display">
              <div className="zc-slider-value">{safeRootIndex}</div>
            </div>
            <input
              type="range"
              min={1}
              max={maxRootIndex}
              value={safeRootIndex}
              onChange={(e) => setRootIndex(parseInt(e.target.value, 10))}
              className="zc-slider"
            />
            <div className="zc-slider-range">Diapazon: 1 – {maxRootIndex}</div>
          </div>

          {/* L_RA Card */}
          <div className="zc-control-card">
            <label className="zc-control-label">Preambula Uzunligi</label>
            <select
              value={L_RA}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setL_RA(val);
                if (safeRootIndex >= val) setRootIndex(val - 1);
              }}
              className="zc-select"
            >
              <option value={139}>Qisqa (139)</option>
              <option value={839}>Uzun (839)</option>
            </select>
            <div className="zc-select-label">{L_RALabel}</div>
          </div>

          {/* Checkboxes Card */}
          <div className="zc-control-card">
            <label className="zc-control-label">Grafiklarni Tanlang</label>
            <div className="zc-checkboxes">
              <label className="zc-checkbox-group">
                <input
                  type="checkbox"
                  checked={showMagnitude}
                  onChange={(e) => setShowMagnitude(e.target.checked)}
                />
                <span className="zc-checkbox-label">Magnitude Spektri</span>
              </label>
              <label className="zc-checkbox-group">
                <input
                  type="checkbox"
                  checked={showPhase}
                  onChange={(e) => setShowPhase(e.target.checked)}
                />
                <span className="zc-checkbox-label">Kompleks Tekislik</span>
              </label>
              <label className="zc-checkbox-group">
                <input
                  type="checkbox"
                  checked={showCorrelation}
                  onChange={(e) => setShowCorrelation(e.target.checked)}
                />
                <span className="zc-checkbox-label">O'zaro Korrelyatsiya</span>
              </label>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="zc-stats-grid">
          <InfoCard
            label="Magnitude"
            value="1.000"
            unit="|x_u(n)| = 1"
            description="Barcha nuqtalar birlik aylanada joylashadi"
          />
          <InfoCard
            label="Preambula Uzunligi"
            value={L_RA}
            unit={L_RALabel}
            description="Qisqa yoki uzun preambula formati"
          />
          <InfoCard
            label="Root Indeksi"
            value={safeRootIndex}
            unit={`1 ≤ u ≤ ${maxRootIndex}`}
            description="Ortogonal bazani yaratuvchi ildiz"
          />
          <InfoCard
            label="Maksimal Preambula"
            value={maxPreambula}
            unit={`⌊${L_RA}/13⌋`}
            description="Bitta root-dan olinadigan preambulalar"
          />
        </div>

        {/* Charts */}
        <div className="zc-charts-grid">
          {/* Magnitude Spectrum */}
          {showMagnitude && (
            <ChartCard title="Magnitude Spektri (Birinchi 50 nuqta)">
              <ResponsiveContainer width="100%" height={240}>
                <ComposedChart data={magnitudeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="n" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 1.3]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                    }}
                    formatter={(v) => v.toFixed(3)}
                  />
                  <Bar dataKey="magnitude" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                  <ReferenceLine y={1.0} stroke="#10b981" strokeDasharray="4 4" />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartCard>
          )}

          {/* Complex Plane */}
          {showPhase && (
            <ChartCard title="Kompleks Tekislik (I/Q)">
              <ResponsiveContainer width="100%" height={240}>
                <ScatterChart margin={{ top: 10, right: 15, bottom: 10, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="real" type="number" domain={[-1.3, 1.3]} tick={{ fontSize: 11 }} />
                  <YAxis dataKey="imag" type="number" domain={[-1.3, 1.3]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                    }}
                  />
                  <Scatter name="ZC Nuqtalari" data={complexPlaneData} fill="#8b5cf6" />
                  <ReferenceLine x={0} stroke="#d1d5db" />
                  <ReferenceLine y={0} stroke="#d1d5db" />
                </ScatterChart>
              </ResponsiveContainer>
            </ChartCard>
          )}

          {/* Cross-Correlation */}
          {showCorrelation && (
            <ChartCard
              title={`O'zaro Korrelyatsiya (u=${safeRootIndex} vs u=${
                safeRootIndex === maxRootIndex ? safeRootIndex - 1 : safeRootIndex + 1
              })`}
            >
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={correlationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="lag" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={[0, Math.max(0.2, theoreticalThreshold * 1.5)]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                    }}
                    formatter={(v) => v.toFixed(4)}
                  />
                  <Line type="monotone" dataKey="value" stroke="#ef4444" dot={false} strokeWidth={2} />
                  <ReferenceLine
                    y={theoreticalThreshold}
                    stroke="#10b981"
                    strokeDasharray="5 5"
                    label={{
                      value: `Chegara: ${theoreticalThreshold.toFixed(4)}`,
                      fontSize: 10,
                      fill: '#10b981',
                      position: 'top',
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          )}
        </div>

        {/* Empty State */}
        {!showMagnitude && !showPhase && !showCorrelation && (
          <div className="zc-empty-state">
            <p className="zc-empty-state-text">
              📊 Grafiklarni ko'rish uchun yuqorida checkbox'larni belgilang
            </p>
          </div>
        )}

        {/* Info Section */}
        <div className="zc-info-section">
          <h4 className="zc-info-title">📚 Zadoff-Chu Ketma-ketliklari Haqida</h4>
          <p className="zc-info-text">
            Zadoff-Chu ketma-ketliklari 3GPP 5G standartida <strong>PRACH</strong> (Physical Random Access Channel) preambulalarini yaratishda ishlatiladigan pseudotasodifiy ketma-ketliklar. Asosiy xossalari: <strong>barcha elementlarining magnitude 1 ga teng</strong> va <strong>turli root indekslari uchun past o'zaro korrelyatsiyaga ega</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
