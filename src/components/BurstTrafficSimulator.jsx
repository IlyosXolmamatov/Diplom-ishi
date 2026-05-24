import { useState, useEffect, useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

function lgamma(z) {
  const g = 7;
  const c = [
    0.99999999999980993,
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.13857109526572012,
    9.9843695780195716e-6,
    1.5056327351493116e-7,
  ];
  let x = c[0];
  for (let i = 1; i < g + 2; i++) x += c[i] / (z + i);
  const t = z + g + 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

function betaPDF(x, a, b) {
  if (x <= 0 || x >= 1) return 0;
  const logB = lgamma(a) + lgamma(b) - lgamma(a + b);
  return Math.exp((a - 1) * Math.log(x) + (b - 1) * Math.log(1 - x) - logB);
}

export default function BurstTrafficSimulator() {
  const [numDevices, setNumDevices] = useState(1000);
  const [burstDuration, setBurstDuration] = useState(100);
  const [alpha, setAlpha] = useState(2);
  const [beta, setBeta] = useState(8);
  const [N, setN] = useState(64);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSlot, setCurrentSlot] = useState(0);
  const [speed, setSpeed] = useState(1);

  // Generate slots data
  const slots = useMemo(() => {
    const pdfValues = Array.from(
      { length: burstDuration },
      (_, j) => betaPDF((j + 0.5) / burstDuration, alpha, beta)
    );
    const pdfSum = pdfValues.reduce((a, b) => a + b, 0);

    return Array.from({ length: burstDuration }, (_, i) => {
      const x = (i + 0.5) / burstDuration;
      const pdf = betaPDF(x, alpha, beta);
      const arrivals = Math.round((pdf * numDevices) / pdfSum);
      const collision = (1 - Math.exp(-arrivals / N)) * 100;
      return { slot: i + 1, arrivals, collision };
    });
  }, [numDevices, burstDuration, alpha, beta, N]);

  // Calculate peak metrics
  const maxArrivals = useMemo(
    () => Math.max(...slots.map((s) => s.arrivals)),
    [slots]
  );
  const maxCollision = useMemo(
    () => Math.max(...slots.map((s) => s.collision)),
    [slots]
  );
  const peakSlot = useMemo(
    () => slots.findIndex((s) => s.arrivals === maxArrivals) + 1,
    [slots, maxArrivals]
  );

  // Calculate average collision and high slots
  const avgCollision = useMemo(
    () => slots.reduce((sum, s) => sum + s.collision, 0) / slots.length,
    [slots]
  );
  const highSlots = useMemo(
    () => slots.filter((s) => s.collision > 50).length,
    [slots]
  );

  // Calculate recommended ACB
  const recommendedACB = useMemo(() => {
    for (let p = 0.01; p <= 1; p += 0.01) {
      const collisionAtPeak = (1 - Math.exp((-maxArrivals * p) / N)) * 100;
      if (collisionAtPeak < 20) {
        return p.toFixed(2);
      }
    }
    return '1.00';
  }, [maxArrivals, N]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlot((prev) => {
        if (prev >= burstDuration - 1) {
          return 0;
        }
        return prev + 1;
      });
    }, 1000 / speed / 10);

    return () => clearInterval(interval);
  }, [isPlaying, speed, burstDuration]);

  const chartData = slots.map((s, idx) => ({
    ...s,
    isHighlighted: idx === currentSlot,
  }));

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-10 mb-16">
      {/* Title */}
      <h2 className="text-3xl font-bold text-gray-900 mb-8">
        IoT Burst Trafik Simulyatsiyasi (Alarm Ssenariysi)
      </h2>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {/* Devices slider */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <label className="text-sm font-semibold text-gray-700 block mb-2">
            Qurilmalar soni: {numDevices}
          </label>
          <input
            type="range"
            min="100"
            max="5000"
            step="100"
            value={numDevices}
            onChange={(e) => setNumDevices(Number(e.target.value))}
            className="w-full"
          />
          <p className="text-xs text-gray-600 mt-2">100-5000</p>
        </div>

        {/* Burst duration slider */}
        <div className="bg-green-50 p-4 rounded-lg">
          <label className="text-sm font-semibold text-gray-700 block mb-2">
            Burst davomiyligi (ms): {burstDuration}
          </label>
          <input
            type="range"
            min="10"
            max="500"
            step="10"
            value={burstDuration}
            onChange={(e) => setBurstDuration(Number(e.target.value))}
            className="w-full"
          />
          <p className="text-xs text-gray-600 mt-2">10-500</p>
        </div>

        {/* Alpha (intensity) slider */}
        <div className="bg-purple-50 p-4 rounded-lg">
          <label className="text-sm font-semibold text-gray-700 block mb-2">
            Burst intensivligi α: {alpha.toFixed(1)}
          </label>
          <input
            type="range"
            min="1"
            max="10"
            step="0.5"
            value={alpha}
            onChange={(e) => setAlpha(Number(e.target.value))}
            className="w-full"
          />
          <p className="text-xs text-gray-600 mt-2">1-10</p>
        </div>

        {/* Speed select */}
        <div className="bg-orange-50 p-4 rounded-lg">
          <label className="text-sm font-semibold text-gray-700 block mb-2">
            Simulyatsiya tezligi
          </label>
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={1}>1x (Normal)</option>
            <option value={2}>2x (Tez)</option>
            <option value={5}>5x (Juda tez)</option>
          </select>
        </div>

        {/* Play/Pause button */}
        <div className="flex items-end">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`w-full px-4 py-3 rounded-lg font-semibold text-white transition-colors ${
              isPlaying
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isPlaying ? 'Toxtash' : 'Boshlash'}
          </button>
        </div>
      </div>

      {/* Peak Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <p className="text-xs text-gray-600 mb-1">Max qabul (slotda)</p>
          <p className="text-2xl font-bold text-blue-600">{maxArrivals}</p>
          <p className="text-xs text-gray-600 mt-2">Qurilma/slot</p>
        </div>

        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-xs text-gray-600 mb-1">Max kolliziya %</p>
          <p className="text-2xl font-bold text-red-600">
            {maxCollision.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-600 mt-2">Pik qiymat</p>
        </div>

        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
          <p className="text-xs text-gray-600 mb-1">Pik slot</p>
          <p className="text-2xl font-bold text-green-600">{peakSlot}</p>
          <p className="text-xs text-gray-600 mt-2">Slot raqami</p>
        </div>

        <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
          <p className="text-xs text-gray-600 mb-1">Jami qurilmalar</p>
          <p className="text-2xl font-bold text-purple-600">{numDevices}</p>
          <p className="text-xs text-gray-600 mt-2">IoT cihazlar</p>
        </div>
      </div>

      {/* Animated Chart */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Qabul va Kolliziya Dinamikasi
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={chartData} margin={{ top: 20, right: 80, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="slot"
              label={{ value: 'Slot', position: 'insideBottomRight', offset: -10 }}
            />
            <YAxis yAxisId="left" label={{ value: 'Qabul', angle: -90, position: 'insideLeft' }} />
            <YAxis
              yAxisId="right"
              orientation="right"
              label={{ value: 'Kolliziya (%)', angle: 90, position: 'insideRight' }}
            />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="arrivals" fill="#3B82F6" name="Qabul (ta)" />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="collision"
              stroke="#EF4444"
              name="Kolliziya (%)"
              isAnimationActive={false}
            />
            {currentSlot < slots.length && (
              <ReferenceLine
                x={chartData[currentSlot].slot}
                stroke="#10B981"
                strokeWidth={2}
                strokeDasharray="5 5"
                label={{ value: `Slot ${currentSlot + 1}`, position: 'top', fill: '#10B981' }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tahlil Natijalari</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Ortacha kolliziya:</p>
            <p className="text-2xl font-bold text-blue-600">{avgCollision.toFixed(1)}%</p>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">Kritik slotlar (&gt;50%):</p>
            <p className="text-2xl font-bold text-orange-600">{highSlots} ta</p>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">Tavsiya p_ACB (20% collision):</p>
            <p className="text-2xl font-bold text-green-600">{recommendedACB}</p>
          </div>
        </div>

        <p className="text-sm text-gray-700 mt-4 leading-relaxed">
          <strong>Tafsir:</strong> Simulyatsiya shuni ko'rsatadiki, {numDevices} ta qurilmadan {highSlots} ta slot
          50% dan ortiq kolliziyaga ega. ACB mexanizmini {recommendedACB} qiymatiga o'rnatish orqali pik
          kolliziyani 20% ga qisqartirish mumkin.
        </p>
      </div>
    </div>
  );
}
