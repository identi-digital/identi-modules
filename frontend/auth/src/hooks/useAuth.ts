import { useEffect, useState } from 'react';
import { AuthService } from '../services/auth';

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AuthService.me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (credentials: any) => {
    const user = await AuthService.login(credentials);
    setUser(user);
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
  };

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };
};
