import { Link } from 'react-router-dom';
import {
  BarChart3,
  Signal,
  Clock,
  Wifi,
  TrendingUp,
  BookOpen,
} from 'lucide-react';

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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
            5G NR PRACH Tahlil Tizimi
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Preambula asosidagi tasodifiy kirish usullarini hisoblash va vizualizatsiya
          </p>
        </div>
      </section>

      {/* Statistics Row */}
      <section className="bg-blue-50 py-12 px-4 sm:px-6 lg:px-8 mb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {statistics.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Xususiyatlar
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.id}
                  className="bg-white border border-gray-200 rounded-lg p-8 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mb-6">{feature.description}</p>
                  <Link
                    to={feature.link}
                    className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    {feature.buttonText}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
