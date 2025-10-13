import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Search, MapPin, AlertTriangle, Clock, Users } from 'lucide-react';

const Home = () => {
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
      <div className="text-center py-12">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Report Civic Issues
          <span className="block text-blue-600">Make a Difference</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Help improve your community by reporting civic issues like potholes, street lights, 
          garbage problems, and more. Our AI-powered system will classify your issue and 
          route it to the appropriate department.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/report"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Camera className="w-5 h-5" />
            <span>Report an Issue</span>
          </Link>
          <Link
            to="/map"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2"
          >
            <MapPin className="w-5 h-5" />
            <span>View Map</span>
          </Link>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map(({ icon: Icon, label, value }, index) => (
            <div key={index} className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Icon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{value}</div>
              <div className="text-gray-600">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map(({ icon: Icon, title, description, link }, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
              <p className="text-gray-600 mb-4">{description}</p>
              <Link
                to={link}
                className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
              >
                Get Started →
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 rounded-lg p-8 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
        <p className="text-xl mb-6 opacity-90">
          Join thousands of citizens who are actively improving their communities.
        </p>
        <Link
          to="/report"
          className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center space-x-2"
        >
          <Camera className="w-5 h-5" />
          <span>Start Reporting</span>
        </Link>
      </div>
    </div>
  );
};

export default Home;
