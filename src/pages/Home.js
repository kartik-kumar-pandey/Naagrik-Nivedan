import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Search, MapPin, AlertTriangle, Clock, Users } from 'lucide-react';
import { gsap } from 'gsap';

const Home = () => {
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const featuresRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    if (heroRef.current) {
      gsap.fromTo(heroRef.current.children,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power3.out" }
      );
    }
    if (statsRef.current) {
      gsap.fromTo(statsRef.current.children,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.6, delay: 0.3, stagger: 0.1, ease: "back.out(1.7)" }
      );
    }
    if (featuresRef.current) {
      gsap.fromTo(featuresRef.current.children,
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.6, delay: 0.5, stagger: 0.15, ease: "power2.out" }
      );
    }
    if (ctaRef.current) {
      gsap.fromTo(ctaRef.current,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.8, delay: 0.8, ease: "power2.out" }
      );
    }
  }, []);
  const features = [
    {
      icon: Camera,
      title: 'Easy Reporting',
      description: 'Take photos or upload images to report civic issues quickly and efficiently.',
      link: '/report'
    },
    {
      icon: Search,
      title: 'Track Status',
      description: 'Monitor the progress of your complaints and get updates on resolution status.',
      link: '/track'
    },
    {
      icon: MapPin,
      title: 'Interactive Map',
      description: 'View all reported issues on an interactive map with heatmap visualization.',
      link: '/map'
    }
  ];

  const stats = [
    { icon: AlertTriangle, label: 'Issues Reported', value: '1,234' },
    { icon: Clock, label: 'Avg. Resolution', value: '3.2 days' },
    { icon: Users, label: 'Active Users', value: '5,678' }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div ref={heroRef} className="text-center py-16">
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          <span className="block text-gray-900 mb-2 drop-shadow-lg">Report Civic Issues</span>
          <span className="block gradient-text">Make a Difference</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 mb-10 max-w-3xl mx-auto leading-relaxed drop-shadow-sm">
          Help improve your community by reporting civic issues like potholes, street lights, 
          garbage problems, and more. Our AI-powered system will classify your issue and 
          route it to the appropriate department.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/report"
            className="bg-gradient-to-r from-blue-400 to-cyan-400 text-white px-10 py-4 rounded-xl font-bold hover:from-blue-500 hover:to-cyan-500 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg shadow-blue-400/50 hover:shadow-xl hover:shadow-blue-400/60 hover:scale-105"
          >
            <Camera className="w-5 h-5" />
            <span>Report an Issue</span>
          </Link>
          <Link
            to="/map"
            className="glass text-gray-800 px-10 py-4 rounded-xl font-bold hover:bg-white/80 transition-all duration-300 flex items-center justify-center space-x-2 border-2 border-white/30 hover:scale-105"
          >
            <MapPin className="w-5 h-5" />
            <span>View Map</span>
          </Link>
        </div>
      </div>

      {/* Stats Section */}
      <div ref={statsRef} className="glass rounded-2xl shadow-modern p-8 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map(({ icon: Icon, label, value }, index) => (
            <div key={index} className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-300 to-cyan-300 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Icon className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-blue-600 mb-2">{value}</div>
              <div className="text-gray-700 font-medium">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="mb-12">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-12 drop-shadow-sm">
          How It Works
        </h2>
        <div ref={featuresRef} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map(({ icon: Icon, title, description, link }, index) => (
            <div key={index} className="modern-card p-8 group cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-300 to-cyan-300 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">{description}</p>
              <Link
                to={link}
                className="text-blue-600 font-bold hover:text-cyan-600 transition-colors duration-300 inline-flex items-center space-x-2 group-hover:translate-x-2"
              >
                <span>Get Started</span>
                <span>→</span>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div ref={ctaRef} className="bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl p-12 text-center text-white shadow-modern">
        <h2 className="text-4xl font-bold mb-4 drop-shadow-md">Ready to Make a Difference?</h2>
        <p className="text-xl mb-8 text-white drop-shadow-sm">
          Join thousands of citizens who are actively improving their communities.
        </p>
        <Link
          to="/report"
          className="bg-white text-blue-700 px-10 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all duration-300 inline-flex items-center space-x-2 shadow-lg hover:scale-105"
        >
          <Camera className="w-5 h-5" />
          <span>Start Reporting</span>
        </Link>
      </div>
    </div>
  );
};

export default Home;
