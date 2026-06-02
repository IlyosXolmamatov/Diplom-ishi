import { Link } from 'react-router-dom';
import {
  BarChart3,
  Signal,
  Clock,
  Wifi,
  TrendingUp,
  BookOpen,
} from 'lucide-react';
import ZCSequenceVisualizer from '../components/ZCSequenceVisualizer';
import '../pages/Home.css';

export default function Home() {
  const features = [
    {
      id: 1,
      icon: BarChart3,
      title: 'ALOHA Kalkulyator',
      description: 'Pure va Slotted ALOHA taqqoslash',
      link: '/aloha',
      buttonText: 'Boshlash',
    },
    {
      id: 2,
      icon: Signal,
      title: 'PRACH Tahlil',
      description: 'Kolliziya ehtimoli va otkazuvchanlik',
      link: '/prach',
      buttonText: 'Boshlash',
    },
    {
      id: 3,
      icon: Clock,
      title: 'Kechikish Hisob',
      description: '4-step va 2-step RACH taqqoslash',
      link: '/latency',
      buttonText: 'Boshlash',
    },
    {
      id: 4,
      icon: Wifi,
      title: 'Grant-free RA',
      description: 'mMTC va IoT ssenariylar',
      link: '/grantfree',
      buttonText: 'Boshlash',
    },
    {
      id: 5,
      icon: TrendingUp,
      title: 'Taqqoslash',
      description: 'Barcha usullar bir joyda',
      link: '/comparison',
      buttonText: 'Boshlash',
    },
    {
      id: 6,
      icon: BookOpen,
      title: 'Nazariya',
      description: '3GPP TS 38.211 formulalar',
      link: '/',
      buttonText: 'Ko\'rish',
    },
  ];

  const statistics = [
    { label: 'N=64 preambula', value: '64' },
    { label: '16.5ms kechikish', value: '16.5' },
    { label: '36.8% Slotted ALOHA', value: '36.8%' },
    { label: '98.3% ML aniqlash', value: '98.3%' },
  ];

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="main-container">
          <h1 className="hero-title">
            5G NR PRACH Tahlil Tizimi
          </h1>
          <p className="hero-subtitle">
            Preambula asosidagi tasodifiy kirish usullarini hisoblash va vizualizatsiya
          </p>
        </div>
      </section>

      {/* Statistics Row */}
      <section className="statistics-section">
        <div className="statistics-container">
          <div className="info-grid">
            {statistics.map((stat, index) => (
              <div key={index} className="info-box">
                <div className="info-value">{stat.value}</div>
                <div className="info-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="features-section">
        <div className="features-container">
          <h2 className="section-title">
            Xususiyatlar
          </h2>
          <div className="feature-grid">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.id} className="feature-card">
                  <div className="icon-container">
                    <Icon className="w-6 h-6" style={{ color: 'var(--color-accent, #3b82f6)' }} />
                  </div>
                  <div className="content-wrapper">
                    <h3 className="card-title">
                      {feature.title}
                    </h3>
                    <p className="card-description">
                      {feature.description}
                    </p>
                    <Link
                      to={feature.link}
                      className="card-button mt-auto"
                    >
                      {feature.buttonText}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Zadoff-Chu Sequence Visualizer */}
      <section className="visualizer-section">
        <div className="visualizer-container">
          <ZCSequenceVisualizer />
        </div>
      </section>
    </div>
  );
}
