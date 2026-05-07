import { useAuth } from '../context/AuthContext';

export const useUser = () => {
  const { user, isAuthenticated } = useAuth();
  return { user, isAuthenticated };
};
