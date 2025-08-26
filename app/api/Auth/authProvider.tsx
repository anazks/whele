import React, { useEffect, useState } from 'react';
import { getToken, removeToken, storeToken } from '../Utils/Storage';
import AuthContext from './authContext';

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const login = async (token: string, userData: any) => {
    await storeToken(token);
    setUser(userData);
  };

  const logout = async () => {
    await removeToken();
    setUser(null);
  };

  useEffect(() => {
    const initialize = async () => {
      const token = await getToken();
      if (token) {
        setUser({}); // Optional: fetch user profile with token
      }
      setLoading(false);
    };
    initialize();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
