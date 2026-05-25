import { useState, useMemo } from 'react';
import {
  ComposedChart,
  ScatterChart,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  Scatter,
  ReferenceLine,
  Bar,
} from 'recharts';

export default function ZCSequenceVisualizer() {
  const [rootIndex, setRootIndex] = useState(22);
  const [L_RA, setL_RA] = useState(139);
  const [showMagnitude, setShowMagnitude] = useState(true);
  const [showPhase, setShowPhase] = useState(false);
  const [showCorrelation, setShowCorrelation] = useState(false);

  // Generate ZC sequence
  const generateZC = (u, L) => {
    const sequence = [];
    for (let n = 0; n < L; n++) {
      const angle = (-Math.PI * u * n * (n + 1)) / L;
      sequence.push({
        n,
        real: Math.cos(angle),
        imag: Math.sin(angle),
        magnitude: 1.0,
        phase: angle % (2 * Math.PI),
      });
    }
    return sequence;
  };

  // Calculate cross-correlation
  const crossCorrelation = (seq1, seq2) => {
    return seq1.map((_, lag) => {
      let sum = 0;
      for (let n = 0; n < seq1.length; n++) {
        const idx = (n + lag) % seq1.length;
        sum += Math.sqrt(
          Math.pow(seq1[n].real * seq2[idx].real + seq1[n].imag * seq2[idx].imag, 2) +
          Math.pow(seq1[n].imag * seq2[idx].real - seq1[n].real * seq2[idx].imag, 2)
        );
      }
      return { lag, value: sum / seq1.length };
    });
  };

  // Generate current ZC sequence
  const zcSequence = useMemo(() => generateZC(rootIndex, L_RA), [rootIndex, L_RA]);

  // Generate magnitude chart data (first 50 points)
  const magnitudeData = useMemo(() => {
    return zcSequence.slice(0, 50).map(item => ({
      n: item.n,
      magnitude: item.magnitude,
    }));
  }, [zcSequence]);

  // Generate complex plane data
  const complexPlaneData = useMemo(() => {
    return zcSequence.map(item => ({
      real: item.real,
      imag: item.imag,
    }));
  }, [zcSequence]);

  // Generate correlation data
  const correlationData = useMemo(() => {
    const zcSeq1 = generateZC(rootIndex, L_RA);
    const zcSeq2 = generateZC(rootIndex + 1, L_RA);
    return crossCorrelation(zcSeq1, zcSeq2);
  }, [rootIndex, L_RA]);

  const theoreticalThreshold = 1 / Math.sqrt(L_RA);

  return (
    <div className="viz-box mb-16" style={{ backgroundColor: 'var(--color-card-bg, #ffffff)' }}>
      {/* Title */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary, #1f2937)' }}>
          Zadoff-Chu Ketma-ketligi Vizualizatsiyasi
        </h2>
        <p className="text-xs mb-4" style={{ color: 'var(--color-text-secondary, #6b7280)' }}>3GPP TS 38.211, Section 6.3.3</p>
        <div className="mt-2 rounded p-3 border" style={{ backgroundColor: 'var(--color-bg-secondary, #f9fafb)', borderColor: 'var(--color-card-border, #e5e7eb)' }}>
          <p className="text-sm font-mono" style={{ color: 'var(--color-text-primary, #1f2937)' }}>
            x<sub>u</sub>(n) = e<sup>-jπun(n+1)/L_RA</sup>
          </p>
        </div>
      </div>

      {/* Controls Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Root Index Slider */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary, #1f2937)' }}>
            Root index u: <span style={{ color: 'var(--color-accent, #3b82f6)' }}>{rootIndex}</span>
          </label>
          <input
            type="range"
            min="1"
            max="138"
            value={rootIndex}
            onChange={(e) => setRootIndex(parseInt(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{ accentColor: 'var(--color-accent, #3b82f6)' }}
          />
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary, #6b7280)' }}>1-138 oraliqda</p>
        </div>

        {/* L_RA Select */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary, #1f2937)' }}>L_RA tanlang</label>
          <select
            value={L_RA}
            onChange={(e) => setL_RA(parseInt(e.target.value))}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
            style={{
              backgroundColor: 'var(--color-card-bg, #ffffff)',
              color: 'var(--color-text-primary, #1f2937)',
              borderColor: 'var(--color-card-border, #e5e7eb)',
              focusRingColor: 'var(--color-accent, #3b82f6)'
            }}
          >
            <option value={139}>L_RA = 139 (Short preamble)</option>
            <option value={839}>L_RA = 839 (Long preamble)</option>
          </select>
        </div>

        {/* Checkboxes */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary, #1f2937)' }}>Ko'rsatma</label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showMagnitude}
                onChange={(e) => setShowMagnitude(e.target.checked)}
                className="w-4 h-4 rounded"
                style={{ accentColor: 'var(--color-accent, #3b82f6)' }}
              />
              <span className="ml-2 text-sm" style={{ color: 'var(--color-text-primary, #1f2937)' }}>Magnitude</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showPhase}
                onChange={(e) => setShowPhase(e.target.checked)}
                className="w-4 h-4 rounded"
                style={{ accentColor: 'var(--color-accent, #3b82f6)' }}
              />
              <span className="ml-2 text-sm" style={{ color: 'var(--color-text-primary, #1f2937)' }}>Kompleks tekislik</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showCorrelation}
                onChange={(e) => setShowCorrelation(e.target.checked)}
                className="w-4 h-4 rounded"
                style={{ accentColor: 'var(--color-accent, #3b82f6)' }}
              />
              <span className="ml-2 text-sm" style={{ color: 'var(--color-text-primary, #1f2937)' }}>Korrelyatsiya</span>
            </label>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <div className="rounded-lg border p-6 viz-box" style={{ backgroundColor: 'var(--color-card-bg, #ffffff)', borderColor: 'var(--color-card-border, #e5e7eb)' }}>
          <p className="text-xs font-medium mb-3" style={{ color: 'var(--color-text-secondary, #6b7280)' }}>Magnitude xossasi</p>
          <p className="text-3xl font-bold mb-3" style={{ color: 'var(--color-accent, #3b82f6)' }}>1.000</p>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary, #6b7280)' }}>Konstantlik: |x_u(n)| = 1</p>
        </div>

        <div className="rounded-lg border p-6 viz-box" style={{ backgroundColor: 'var(--color-card-bg, #ffffff)', borderColor: 'var(--color-card-border, #e5e7eb)' }}>
          <p className="text-xs font-medium mb-3" style={{ color: 'var(--color-text-secondary, #6b7280)' }}>Preambula uzunligi</p>
          <p className="text-3xl font-bold mb-3" style={{ color: 'var(--color-accent, #3b82f6)' }}>L_RA = {L_RA}</p>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary, #6b7280)' }}>{L_RA === 139 ? 'Qisqa' : 'Uzun'} preambula</p>
        </div>

        <div className="rounded-lg border p-6 viz-box" style={{ backgroundColor: 'var(--color-card-bg, #ffffff)', borderColor: 'var(--color-card-border, #e5e7eb)' }}>
          <p className="text-xs font-medium mb-3" style={{ color: 'var(--color-text-secondary, #6b7280)' }}>Root indeksi</p>
          <p className="text-3xl font-bold mb-3" style={{ color: 'var(--color-accent, #3b82f6)' }}>u = {rootIndex}</p>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary, #6b7280)' }}>ZC ketma-ketlik tariflovchi</p>
        </div>

        <div className="rounded-lg border p-6 viz-box" style={{ backgroundColor: 'var(--color-card-bg, #ffffff)', borderColor: 'var(--color-card-border, #e5e7eb)' }}>
          <p className="text-xs font-medium mb-3" style={{ color: 'var(--color-text-secondary, #6b7280)' }}>Maksimal preambula</p>
          <p className="text-3xl font-bold mb-3" style={{ color: 'var(--color-accent, #3b82f6)' }}>{Math.floor(L_RA / 13)}</p>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary, #6b7280)' }}>⌊L_RA / 13⌋ = {Math.floor(L_RA / 13)}</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Magnitude Chart */}
        {showMagnitude && (
          <div className="viz-box rounded-lg border p-6" style={{ backgroundColor: 'var(--color-card-bg, #ffffff)', borderColor: 'var(--color-card-border, #e5e7eb)' }}>
            <h3 className="text-lg font-semibold mb-6" style={{ color: 'var(--color-text-primary, #1f2937)' }}>Magnitude spektri</h3>
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart data={magnitudeData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="n" />
                <YAxis domain={[0, 1.2]} />
                <Tooltip formatter={(value) => value.toFixed(3)} />
                <Bar dataKey="magnitude" fill="#3b82f6" />
                <ReferenceLine y={1.0} stroke="#10b981" strokeDasharray="5 5" label="Konstanta = 1.0" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Complex Plane Chart */}
        {showPhase && (
          <div className="viz-box rounded-lg border p-6" style={{ backgroundColor: 'var(--color-card-bg, #ffffff)', borderColor: 'var(--color-card-border, #e5e7eb)' }}>
            <h3 className="text-lg font-semibold mb-6" style={{ color: 'var(--color-text-primary, #1f2937)' }}>Kompleks tekislik (I/Q)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <ScatterChart
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                data={complexPlaneData}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="real" type="number" domain={[-1.2, 1.2]} label={{ value: 'Real', position: 'right', offset: 5 }} />
                <YAxis dataKey="imag" type="number" domain={[-1.2, 1.2]} label={{ value: 'Imaginary', angle: -90, position: 'insideLeft' }} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="ZC nuqtalari" data={complexPlaneData} fill="#8b5cf6" />
                <ReferenceLine x={0} stroke="#ccc" />
                <ReferenceLine y={0} stroke="#ccc" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Correlation Chart */}
        {showCorrelation && (
          <div className="viz-box rounded-lg border p-6 lg:col-span-2" style={{ backgroundColor: 'var(--color-card-bg, #ffffff)', borderColor: 'var(--color-card-border, #e5e7eb)' }}>
            <h3 className="text-lg font-semibold mb-6" style={{ color: 'var(--color-text-primary, #1f2937)' }}>
              O'zaro korrelyatsiya: u={rootIndex} va u={rootIndex + 1}
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={correlationData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="lag" />
                <YAxis />
                <Tooltip formatter={(value) => value.toFixed(4)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#ef4444"
                  name="Korrelyatsiya"
                  isAnimationActive={false}
                />
                <ReferenceLine
                  y={theoreticalThreshold}
                  stroke="#10b981"
                  strokeDasharray="5 5"
                  label={`Teorik chegara: 1/√L_RA = ${theoreticalThreshold.toFixed(4)}`}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Empty state when no charts selected */}
        {!showMagnitude && !showPhase && !showCorrelation && (
          <div className="lg:col-span-2 rounded-lg border-2 border-dashed p-8 text-center" style={{ backgroundColor: 'var(--color-bg-secondary, #f9fafb)', borderColor: 'var(--color-card-border, #e5e7eb)' }}>
            <p style={{ color: 'var(--color-text-secondary, #6b7280)' }}>Grafikni ko'rsatish uchun yuqorida checkbox-larni belgilang</p>
          </div>
        )}
      </div>

      {/* Information Box */}
      <div className="border-l-4 p-6 rounded" style={{ backgroundColor: 'var(--color-bg-secondary, #f9fafb)', borderLeftColor: 'var(--color-accent, #3b82f6)' }}>
        <p className="text-sm" style={{ color: 'var(--color-text-primary, #1f2937)' }}>
          <span className="font-semibold">Zadoff-Chu ketma-ketliklari</span> — bu 3GPP 5G standartida PRACH (Physical Random Access Channel) preambulalarini yaratishda ishlatiladigan
          pseudotasodifiy ketma-ketliklar. Ularning asosiy xossasi: barcha elementlarining magnitude 1 ga teng va turli root indekslari
          uchun past o'zaro korrelyatsiyaga ega.
        </p>
      </div>
    </div>
  );
}
