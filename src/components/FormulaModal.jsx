import { useState } from 'react';
import { X, HelpCircle } from 'lucide-react';

const FORMULAS = {
  aloha_pure: {
    title: 'Pure ALOHA',
    formula: 'S = G·e^(-2G)',
    description: 'Throughput formula for Pure ALOHA protocol',
    variables: [
      { name: 'S', description: 'Throughput (0-18.4%)' },
      { name: 'G', description: 'Offered load (attempts per slot)' },
    ],
  },
  aloha_slotted: {
    title: 'Slotted ALOHA',
    formula: 'S = G·e^(-G)',
    description: 'Throughput formula for Slotted ALOHA protocol',
    variables: [
      { name: 'S', description: 'Throughput (0-36.8%)' },
      { name: 'G', description: 'Offered load (attempts per slot)' },
    ],
  },
  collision: {
    title: 'Collision Probability',
    formula: 'P_c = 1 - e^(-λ/N)',
    description: 'Probability of collision with λ arrivals and N preambles',
    variables: [
      { name: 'P_c', description: 'Collision probability (0-1)' },
      { name: 'λ', description: 'Arrival rate (devices)' },
      { name: 'N', description: 'Number of preambles' },
    ],
  },
  throughput: {
    title: 'Throughput',
    formula: 'S = ρ·e^(-ρ)',
    description: 'System throughput where ρ = M/N',
    variables: [
      { name: 'S', description: 'Throughput' },
      { name: 'ρ', description: 'Load factor (M/N)' },
      { name: 'M', description: 'Number of devices' },
      { name: 'N', description: 'Number of preambles' },
    ],
  },
  latency_4step: {
    title: 'Latency (4-step RACH)',
    formula: 'T = T_wait + T_RAR + T_Msg3 + T_CR',
    description: 'Total latency in 4-step random access procedure',
    variables: [
      { name: 'T', description: 'Total latency' },
      { name: 'T_wait', description: 'PRACH wait time' },
      { name: 'T_RAR', description: 'Random access response window' },
      { name: 'T_Msg3', description: 'Message 3 transmission' },
      { name: 'T_CR', description: 'Contention resolution' },
    ],
  },
  success_rate: {
    title: 'Success Rate',
    formula: 'P_s^n = 1-(1-p₁)ⁿ',
    description: 'Probability that at least one device succeeds among n attempts',
    variables: [
      { name: 'P_s^n', description: 'Success probability for n devices' },
      { name: 'p₁', description: 'Single device success probability' },
      { name: 'n', description: 'Number of UEs' },
    ],
  },
  zc_sequence: {
    title: 'Zadoff-Chu Sequence',
    formula: 'x_u(n) = e^(-jπun(n+1)/L_RA)',
    description: 'ZC sequence used in 5G PRACH preambles',
    variables: [
      { name: 'x_u(n)', description: 'ZC sequence value' },
      { name: 'u', description: 'Root index' },
      { name: 'n', description: 'Sample index (0 to L_RA-1)' },
      { name: 'L_RA', description: 'Sequence length (139 or 839)' },
    ],
  },
  detection: {
    title: 'ML Detection',
    formula: 'P_D = 1/(1+e^(-(SNR-SNR₀)/σ))',
    description: 'Detection probability as function of SNR (sigmoid)',
    variables: [
      { name: 'P_D', description: 'Detection probability (0-1)' },
      { name: 'SNR', description: 'Signal-to-noise ratio (dB)' },
      { name: 'SNR₀', description: 'Threshold SNR' },
      { name: 'σ', description: 'Scale factor (bandwidth)' },
    ],
  },
};

export default function FormulaModal({ formulaKey, isOpen, onClose }) {
  const formula = FORMULAS[formulaKey];

  if (!formula || !isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 rounded-lg shadow-2xl z-50 max-w-lg w-full mx-4">
        {/* Header */}
        <div className="bg-blue-600 dark:bg-blue-900 text-white p-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">{formula.title}</h2>
            <p className="text-blue-100 text-sm mt-1">{formula.description}</p>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-blue-700 p-1 rounded"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Formula Display */}
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Formula:</p>
            <p className="font-mono text-lg text-gray-900 dark:text-white font-semibold">
              {formula.formula}
            </p>
          </div>

          {/* Variables */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Variables:</h3>
            <div className="space-y-2">
              {formula.variables.map((variable, idx) => (
                <div
                  key={idx}
                  className="flex gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded"
                >
                  <div className="font-mono font-bold text-blue-600 dark:text-blue-400 min-w-16">
                    {variable.name}
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    {variable.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-900 dark:hover:bg-blue-800 text-white py-2 rounded-lg font-medium transition-colors"
          >
            Yopish
          </button>
        </div>
      </div>
    </>
  );
}

export function FormulaButton({ formulaKey, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`p-1 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full text-blue-600 dark:text-blue-400 transition-colors ${className}`}
        title="Formulani ko'rish"
      >
        <HelpCircle className="w-5 h-5" />
      </button>
      <FormulaModal
        formulaKey={formulaKey}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
