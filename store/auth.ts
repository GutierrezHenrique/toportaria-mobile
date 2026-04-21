import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Role = 'ADMIN' | 'PORTEIRO' | 'MORADOR';
export type User = { id: string; name: string; email: string; role: Role };

type State = {
  token: string | null;
  user: User | null;
  setAuth: (t: string, u: User) => void;
  logout: () => void;
};

export const useAuth = create<State>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: 'toportaria-auth', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
