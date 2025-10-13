import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on app load
    const checkAuth = () => {
      try {
        const userSession = localStorage.getItem('userSession');
        if (userSession) {
          const parsedSession = JSON.parse(userSession);
          setUser(parsedSession);
        }
      } catch (error) {
        console.error('Error loading user session:', error);
        localStorage.removeItem('userSession');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData) => {
    const userSession = {
      ...userData,
      isAuthenticated: true,
      loginTime: new Date().toISOString()
    };
    
    localStorage.setItem('userSession', JSON.stringify(userSession));
    setUser(userSession);
  };

  const logout = () => {
    localStorage.removeItem('userSession');
    setUser(null);
  };

  const isAuthenticated = () => {
    return user && user.isAuthenticated;
  };

  const isCitizen = () => {
    return user && user.userType === 'citizen';
  };

  const isOfficial = () => {
    return user && user.userType === 'official';
  };

  const getDepartment = () => {
    return user?.department || null;
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated,
    isCitizen,
    isOfficial,
    getDepartment
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
