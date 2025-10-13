import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Camera, Search, Home, BarChart3, LogOut, User, Building2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const location = useLocation();
  const { user, isCitizen, isOfficial, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const getNavItems = () => {
    if (isCitizen()) {
      return [
        { path: '/', label: 'My Complaints', icon: User },
        { path: '/home', label: 'Home', icon: Home },
        { path: '/report', label: 'Report Issue', icon: Camera },
        { path: '/track', label: 'Track Complaint', icon: Search },
      ];
    } else if (isOfficial()) {
      return [
        { path: '/dashboard', label: 'Department Dashboard', icon: Building2 },
        { path: '/admin-dashboard', label: 'All Complaints', icon: BarChart3 },
      ];
    }
    return [];
  };

  const navItems = getNavItems();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Civic Reporter</span>
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === path
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              {isCitizen() ? (
                <User className="w-4 h-4" />
              ) : (
                <Building2 className="w-4 h-4" />
              )}
              <span>{user?.email}</span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <div className="px-4 py-2 text-sm text-gray-700 border-b">
                  <div className="font-medium">{user?.email}</div>
                  <div className="text-xs text-gray-500">
                    {isCitizen() ? 'Citizen' : `${user?.department} Official`}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
