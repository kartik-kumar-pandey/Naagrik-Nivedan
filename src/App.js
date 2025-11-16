import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { gsap } from 'gsap';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Login from './pages/Login';
import Home from './pages/Home';
import ReportIssue from './pages/ReportIssue';
import TrackComplaint from './pages/TrackComplaint';
import MapView from './pages/MapView';
import ComplaintsDashboard from './pages/ComplaintsDashboard';
import DepartmentDashboard from './pages/DepartmentDashboard';
import CitizenDashboard from './pages/CitizenDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function AppContent() {
  const [userLocation, setUserLocation] = useState(null);
  const { isAuthenticated } = useAuth();
  const mainRef = useRef(null);

  useEffect(() => {
    if (mainRef.current) {
      gsap.fromTo(mainRef.current, 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );
    }
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-sky-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>
      
      {isAuthenticated() && <Header />}
      <main ref={mainRef} className="relative z-10">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute requiredRole="citizen">
                <CitizenDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/report" 
            element={
              <ProtectedRoute requiredRole="citizen">
                <ReportIssue userLocation={userLocation} setUserLocation={setUserLocation} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/track" 
            element={
              <ProtectedRoute requiredRole="citizen">
                <TrackComplaint />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/map" 
            element={
              <ProtectedRoute requiredRole="citizen">
                <MapView />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute requiredRole="official">
                <DepartmentDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin-dashboard" 
            element={
              <ProtectedRoute requiredRole="official">
                <ComplaintsDashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
