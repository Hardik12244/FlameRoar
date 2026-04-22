import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { api } from '../services/api';

export const ClerkAxiosInterceptor = ({ children }) => {
  const { getToken, isLoaded } = useAuth();
  const [interceptorReady, setInterceptorReady] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    
    // Clear any existing interceptors (useful for hot-reloads)
    api.interceptors.request.clear();
    
    const requestInterceptor = api.interceptors.request.use(
      async (config) => {
        try {
          const token = await getToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (err) {
          console.error("Token injection failed:", err);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    setInterceptorReady(true);
    
    return () => {
      api.interceptors.request.eject(requestInterceptor);
    };
  }, [getToken, isLoaded]);

  if (!interceptorReady) return null;

  return <>{children}</>;
};
