import { useAuthStore } from '@/store/auth';

export const getAuthToken = () => {
  const token = useAuthStore.getState().token;
  return token;
}; 