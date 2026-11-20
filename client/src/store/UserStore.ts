
import { create } from "zustand";
import { AuthAPI, type AuthUser } from "../API/AuthAPI";

interface UserState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<boolean>;
  signup: (
    name: string,
    email: string,
    password: string
  ) => Promise<boolean>;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
  clearError: () => void;
}

function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = error.response as {
      data?: { message?: string; error?: string };
    };

    return (
      response.data?.message ??
      response.data?.error ??
      "Authentication failed. Please try again."
    );
  }

  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: !!localStorage.getItem("token"),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });

    try {
      const result = await AuthAPI.login(email, password);

      const token = result.JWT_token;

      localStorage.setItem("token", token);

      set({
        user: null,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (error) {
      set({
        isLoading: false,
        error: getErrorMessage(error),
      });

      return false;
    }
  },

  signup: async (name, email, password) => {
    set({ isLoading: true, error: null });

    try {
      const result = await AuthAPI.signup(name, email, password);

      localStorage.setItem("token", result.token);

      set({
        user: result.user,
        token: result.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (error) {
      set({
        isLoading: false,
        error: getErrorMessage(error),
      });

      return false;
    }
  },

  setUser: (user) =>
    set({
      user,
      isAuthenticated: user !== null,
    }),

  logout: () => {
    localStorage.removeItem("token");

    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));
 