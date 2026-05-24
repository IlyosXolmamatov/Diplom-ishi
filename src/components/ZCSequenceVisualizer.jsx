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
    <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
      {/* Title */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Zadoff-Chu Ketma-ketligi Vizualizatsiyasi
        </h2>
        <p className="text-xs text-gray-600">3GPP TS 38.211, Section 6.3.3</p>
        <div className="mt-2 bg-gray-50 rounded p-3 border border-gray-200">
          <p className="text-sm font-mono text-gray-800">
            x<sub>u</sub>(n) = e<sup>-jπun(n+1)/L_RA</sup>
          </p>
        </div>
      </div>

      {/* Controls Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Root Index Slider */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Root index u: <span className="text-blue-600">{rootIndex}</span>
          </label>
          <input
            type="range"
            min="1"
            max="138"
            value={rootIndex}
            onChange={(e) => setRootIndex(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <p className="text-xs text-gray-500 mt-1">1-138 oraliqda</p>
        </div>

        {/* L_RA Select */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">L_RA tanlang</label>
          <select
            value={L_RA}
            onChange={(e) => setL_RA(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value={139}>L_RA = 139 (Short preamble)</option>
            <option value={839}>L_RA = 839 (Long preamble)</option>
          </select>
        </div>

        {/* Checkboxes */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Ko'rsatma</label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showMagnitude}
                onChange={(e) => setShowMagnitude(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Magnitude</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showPhase}
                onChange={(e) => setShowPhase(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Kompleks tekislik</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showCorrelation}
                onChange={(e) => setShowCorrelation(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Korrelyatsiya</span>
            </label>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-linear-to-br from-green-50 to-green-100 rounded-lg border border-green-300 p-4">
          <p className="text-xs font-medium text-gray-600 mb-1">Magnitude xossasi</p>
          <p className="text-2xl font-bold text-green-600">1.000</p>
          <p className="text-xs text-gray-600 mt-1">Konstantlik: |x_u(n)| = 1</p>
        </div>

        <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-300 p-4">
          <p className="text-xs font-medium text-gray-600 mb-1">Preambula uzunligi</p>
          <p className="text-2xl font-bold text-blue-600">L_RA = {L_RA}</p>
          <p className="text-xs text-gray-600 mt-1">{L_RA === 139 ? 'Qisqa' : 'Uzun'} preambula</p>
        </div>

        <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-300 p-4">
          <p className="text-xs font-medium text-gray-600 mb-1">Root indeksi</p>
          <p className="text-2xl font-bold text-blue-600">u = {rootIndex}</p>
          <p className="text-xs text-gray-600 mt-1">ZC ketma-ketlik tariflovchi</p>
        </div>

        <div className="bg-linear-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-300 p-4">
          <p className="text-xs font-medium text-gray-600 mb-1">Maksimal preambula</p>
          <p className="text-2xl font-bold text-orange-600">{Math.floor(L_RA / 13)}</p>
          <p className="text-xs text-gray-600 mt-1">⌊L_RA / 13⌋ = {Math.floor(L_RA / 13)}</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Magnitude Chart */}
        {showMagnitude && (
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Magnitude spektri</h3>
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
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Kompleks tekislik (I/Q)</h3>
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
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
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
          <div className="lg:col-span-2 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
            <p className="text-gray-600">Grafikni ko'rsatish uchun yuqorida checkbox-larni belgilang</p>
          </div>
        )}
      </div>

      {/* Information Box */}
      <div className="mt-8 bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
        <p className="text-sm text-gray-800">
          <span className="font-semibold">Zadoff-Chu ketma-ketliklari</span> — bu 3GPP 5G standartida PRACH (Physical Random Access Channel) preambulalarini yaratishda ishlatiladigan
          pseudotasodifiy ketma-ketliklar. Ularning asosiy xossasi: barcha elementlarining magnitude 1 ga teng va turli root indekslari
          uchun past o'zaro korrelyatsiyaga ega.
        </p>
      </div>
    </div>
  );
}
