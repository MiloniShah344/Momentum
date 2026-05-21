import { create } from 'zustand';

export interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  onboarding_complete: boolean;
  fitness_goal?: string | null;
  workout_frequency_goal?: number;
  weight_unit?: string;
  measurement_unit?: string;
  theme_preference?: string;
}

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  isInitialized: boolean;

  setUser: (user: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isInitialized: false,

  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  setInitialized: (isInitialized) => set({ isInitialized }),
  clearAuth: () => set({ user: null }),
}));
