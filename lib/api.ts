import axios from 'axios';
import Constants from 'expo-constants';
import { useAuth } from '@/store/auth';

const baseURL =
  (Constants.expoConfig?.extra as any)?.apiUrl || 'http://localhost:3333/api';

export const api = axios.create({ baseURL });

api.interceptors.request.use((cfg) => {
  const token = useAuth.getState().token;
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) useAuth.getState().logout();
    return Promise.reject(err);
  },
);
