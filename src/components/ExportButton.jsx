import { Download } from 'lucide-react';
import './ExportButton.css';

export default function ExportButton({ snr, avgCollision, highSlots, recommendedACB }) {
  const handleExport = () => {
    const now = new Date().toLocaleString('uz-UZ');
    const summary = `=== 5G PRACH TAHLIL NATIJALARI ===
Sana: ${now}

ALOHA Taqqoslash:
Pure ALOHA Smax = 18.4% (G=0.5)
Slotted ALOHA Smax = 36.8% (G=1.0)

PRACH Taqqoslash (N=64):
4-step PRACH:
  - Otkazuvchanlik: 85%
  - Kechikish: 16.5ms
  - Kolliziya: 36.4%

2-step PRACH:
  - Otkazuvchanlik: 90%
  - Kechikish: 6.5ms
  - Kolliziya: 36.4%

Grant-free RA:
  - Otkazuvchanlik: 75%
  - Kechikish: 2ms
  - Kolliziya: 45%

Machine Learning Tahlil:
SNR = ${snr} dB
Ortacha Kolliziya = ${avgCollision.toFixed(1)}%
Kritik Slotlar (>50%) = ${highSlots}
Tavsiya p_ACB = ${recommendedACB}

Kechikish Taqqoslash:
4-step = 16.5ms
2-step = 6.5ms
Kamaytirish = 60.6%

Manba: 3GPP TS 38.211, Section 6.3.3
Standart: 5G NR Release 17`;

    const blob = new Blob([summary], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `5G_PRACH_Analysis_${Date.now()}.txt`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="export-btn"
    >
      <Download className="w-5 h-5" />
      Natijalarni saqlash
    </button>
  );
}
