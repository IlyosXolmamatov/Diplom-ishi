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
import './BurstTrafficSimulator.css';

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
  const [speed, setSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSlot, setCurrentSlot] = useState(0);

  // Constants for beta distribution and preamble count
  const beta = 8;
  const N = 64;

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
  const recommendedACB = (() => {
    for (let p = 0.01; p <= 1; p += 0.01) {
      const collisionAtPeak = (1 - Math.exp((-maxArrivals * p) / N)) * 100;
      if (collisionAtPeak < 20) {
        return p.toFixed(2);
      }
    }
    return '1.00';
  })();

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
    <div className="burst-container">
      {/* Title */}
      <h2 className="burst-title">
        IoT Burst Trafik Simulyatsiyasi (Alarm Ssenariysi)
      </h2>

      {/* Controls */}
      <div className="burst-controls">
        {/* Devices slider */}
        <div className="control-box control-box-blue">
          <label className="control-label">
            Qurilmalar soni: {numDevices}
          </label>
          <input
            type="range"
            min="100"
            max="5000"
            step="100"
            value={numDevices}
            onChange={(e) => setNumDevices(Number(e.target.value))}
            className="control-input"
          />
          <p className="control-note">100-5000</p>
        </div>

        {/* Burst duration slider */}
        <div className="control-box control-box-green">
          <label className="control-label">
            Burst davomiyligi (ms): {burstDuration}
          </label>
          <input
            type="range"
            min="10"
            max="500"
            step="10"
            value={burstDuration}
            onChange={(e) => setBurstDuration(Number(e.target.value))}
            className="control-input"
          />
          <p className="control-note">10-500</p>
        </div>

        {/* Alpha (intensity) slider */}
        <div className="control-box control-box-purple">
          <label className="control-label">
            Burst intensivligi α: {alpha.toFixed(1)}
          </label>
          <input
            type="range"
            min="1"
            max="10"
            step="0.5"
            value={alpha}
            onChange={(e) => setAlpha(Number(e.target.value))}
            className="control-input"
          />
          <p className="control-note">1-10</p>
        </div>

        {/* Speed select */}
        <div className="control-box control-box-orange">
          <label className="control-label">
            Simulyatsiya tezligi
          </label>
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="select-field"
          >
            <option value={1}>1x (Normal)</option>
            <option value={2}>2x (Tez)</option>
            <option value={5}>5x (Juda tez)</option>
          </select>
        </div>

        {/* Play/Pause button */}
        <div className="play-button-container">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`play-btn ${isPlaying ? 'play-btn-active' : 'play-btn-inactive'}`}
          >
            {isPlaying ? 'Toxtash' : 'Boshlash'}
          </button>
        </div>
      </div>

      {/* Peak Info Cards */}
      <div className="metric-cards">
        <div className="metric-card metric-card-blue">
          <p className="metric-label">Max qabul (slotda)</p>
          <p className="metric-value metric-value-blue">{maxArrivals}</p>
          <p className="metric-unit">Qurilma/slot</p>
        </div>

        <div className="metric-card metric-card-red">
          <p className="metric-label">Max kolliziya %</p>
          <p className="metric-value metric-value-red">
            {maxCollision.toFixed(1)}%
          </p>
          <p className="metric-unit">Pik qiymat</p>
        </div>

        <div className="metric-card metric-card-green">
          <p className="metric-label">Pik slot</p>
          <p className="metric-value metric-value-green">{peakSlot}</p>
          <p className="metric-unit">Slot raqami</p>
        </div>

        <div className="metric-card metric-card-purple">
          <p className="metric-label">Jami qurilmalar</p>
          <p className="metric-value metric-value-purple">{numDevices}</p>
          <p className="metric-unit">IoT cihazlar</p>
        </div>
      </div>

      {/* Animated Chart */}
      <div className="chart-section">
        <h3 className="chart-title">
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
      <div className="summary-section">
        <h3 className="summary-title">Tahlil Natijalari</h3>
        <div className="summary-stats">
          <div className="summary-stat">
            <p className="summary-stat-label">Ortacha kolliziya:</p>
            <p className="summary-stat-value summary-stat-value-blue">{avgCollision.toFixed(1)}%</p>
          </div>

          <div className="summary-stat">
            <p className="summary-stat-label">Kritik slotlar (&gt;50%):</p>
            <p className="summary-stat-value summary-stat-value-orange">{highSlots} ta</p>
          </div>

          <div className="summary-stat">
            <p className="summary-stat-label">Tavsiya p_ACB (20% collision):</p>
            <p className="summary-stat-value summary-stat-value-green">{recommendedACB}</p>
          </div>
        </div>

        <p className="summary-text">
          <strong>Tafsir:</strong> Simulyatsiya shuni ko'rsatadiki, {numDevices} ta qurilmadan {highSlots} ta slot
          50% dan ortiq kolliziyaga ega. ACB mexanizmini {recommendedACB} qiymatiga o'rnatish orqali pik
          kolliziyani 20% ga qisqartirish mumkin.
        </p>
      </div>
    </div>
  );
}
