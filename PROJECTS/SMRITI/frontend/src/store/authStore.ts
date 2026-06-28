import { create } from 'zustand';
import { authApi } from '../api/auth';
import type { UserProfile } from '../api/auth';

interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  
  registerUser: (payload: any) => Promise<void>;
  loginUser: (payload: any) => Promise<void>;
  logoutUser: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  clearError: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  initializeAuth: () => {
    const access = localStorage.getItem('access_token');
    const refresh = localStorage.getItem('refresh_token');
    if (access && refresh) {
      set({ accessToken: access, isAuthenticated: true });
      get().fetchProfile().catch(() => {
        // If profile fetch fails on init, clear tokens
        get().logoutUser();
      });
    }
  },

  registerUser: async (payload) => {
    set({ loading: true, error: null });
    try {
      await authApi.register(payload);
      set({ loading: false });
    } catch (err: any) {
      const msg = err.response?.data?.email?.[0] || err.response?.data?.password?.[0] || err.response?.data?.detail || 'Registration failed';
      set({ loading: false, error: msg });
      throw err;
    }
  },

  loginUser: async (payload) => {
    set({ loading: true, error: null });
    try {
      const data = await authApi.login(payload);
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      set({
        user: data.user,
        accessToken: data.access,
        isAuthenticated: true,
        loading: false,
      });
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Invalid email or password';
      set({ loading: false, error: msg });
      throw err;
    }
  },

  logoutUser: async () => {
    set({ loading: true, error: null });
    const refresh = localStorage.getItem('refresh_token');
    try {
      if (refresh) {
        await authApi.logout(refresh);
      }
    } catch (err) {
      // Proceed with local logout even if API call fails
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        loading: false,
      });
    }
  },

  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      const user = await authApi.getProfile();
      set({ user, loading: false });
    } catch (err: any) {
      set({ loading: false, error: err.response?.data?.detail || 'Failed to fetch profile' });
      throw err;
    }
  },
}));

// Listen to standard logout event dispatched by client.ts interceptor
if (typeof window !== 'undefined') {
  window.addEventListener('auth-logout', () => {
    useAuthStore.getState().logoutUser();
  });
}
