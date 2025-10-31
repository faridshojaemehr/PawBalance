'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, pass: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const hardcodedUser = {
  username: 'farid@PS',
  pass: '@7klPk2h(Q3eoMSK',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check session storage for auth status on initial load
    const storedAuth = sessionStorage.getItem('isAuthenticated');
    setIsAuthenticated(storedAuth === 'true');
    setIsLoading(false);
  }, []);
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
        // Redirect to login if not authenticated, but not if we are already on the login page
        if (window.location.pathname !== '/login') {
            router.push('/login');
        }
    }
  }, [isAuthenticated, isLoading, router]);


  const login = async (username: string, pass: string) => {
    if (username === hardcodedUser.username && pass === hardcodedUser.pass) {
      sessionStorage.setItem('isAuthenticated', 'true');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    sessionStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
    router.push('/login');
  };

  const value = { isAuthenticated, login, logout, isLoading };

  return (
    <AuthContext.Provider value={value}>
        {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
