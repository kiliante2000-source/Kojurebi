import { create } from 'zustand';
import { api } from '../services/api';
import type { User } from '../types/shop';

type AuthState = {
  user: User | null;
  loading: boolean;
  bootstrapped: boolean;
  error: string | null;
  bootstrap: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  bootstrapped: false,
  error: null,
  clearError: () => set({ error: null }),

  bootstrap: async () => {
    try {
      const data = await api.get<{ user: User }>('/api/auth/me');
      set({ user: data.user, bootstrapped: true });
    } catch {
      set({ user: null, bootstrapped: true });
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const data = await api.post<{ user: User }>('/api/auth/login', { email, password });
      set({ user: data.user, loading: false });
    } catch (e) {
      set({
        loading: false,
        error: e instanceof Error ? e.message : 'No se pudo entrar al estudio',
      });
      throw e;
    }
  },

  logout: async () => {
    await api.post('/api/auth/logout');
    set({ user: null });
  },
}));
