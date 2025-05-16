// Em client/src/lib/auth.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User } from "@shared/schema";
const baseUrl = import.meta.env.VITE_API_BASE_URL;
// Gere um ID único para esta instância do módulo para depuração
const AUTH_MODULE_INSTANCE_ID = Math.random();
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (userData: any) => Promise<User>;
  logout: () => Promise<void>;
}

// Adicione o ID do módulo à mensagem de erro e ao log de criação do contexto
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {
    throw new Error(
      `AuthContext not initialized (stub from module ID: ${AUTH_MODULE_INSTANCE_ID})`
    );
  },
  register: async () => {
    throw new Error(
      `AuthContext not initialized (stub from module ID: ${AUTH_MODULE_INSTANCE_ID})`
    );
  },
  logout: async () => {
    throw new Error(
      `AuthContext not initialized (stub from module ID: ${AUTH_MODULE_INSTANCE_ID})`
    );
  },
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${baseUrl}/v1/gestor-usuarios/auth/me`, {
          credentials: "include",
        });
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  // ... (resto das funções login, register, logout sem alterações) ...
  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Login failed");
      const userData = await res.json();
      setUser(userData);
      return userData;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await fetch(`${baseUrl}/v1/gestor-usuarios/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Registration failed");
      const newUserData = await res.json();
      setUser(newUserData);
      return newUserData;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const value = { user, isLoading, login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  // Adicione o ID do módulo ao log do useAuth também

  return useContext(AuthContext);
}
