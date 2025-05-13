// Em client/src/lib/auth.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User } from "@shared/schema";

// Gere um ID único para esta instância do módulo para depuração
const AUTH_MODULE_INSTANCE_ID = Math.random();
console.log(`[DEBUG] auth.tsx module instance ID: ${AUTH_MODULE_INSTANCE_ID}`);

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
console.log(
  `[DEBUG] AuthContext created in module ID: ${AUTH_MODULE_INSTANCE_ID}`,
  AuthContext
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  console.log(
    `[DEBUG] AuthProvider from module ID: ${AUTH_MODULE_INSTANCE_ID} is rendering. Context it will use:`,
    AuthContext
  );

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", {
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
      const res = await fetch("/api/auth/register", {
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
  console.log(
    `[DEBUG] AuthProvider (module ID: ${AUTH_MODULE_INSTANCE_ID}) providing value:`,
    value
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  // Adicione o ID do módulo ao log do useAuth também
  console.log(
    `[DEBUG] useAuth from module ID: ${AUTH_MODULE_INSTANCE_ID} called. Context it will use:`,
    AuthContext
  );
  return useContext(AuthContext);
}
