import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/auth";

export function AuthInterceptor() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleUnauthorized = (event: CustomEvent) => {
      logout();
      setLocation("/login");
    };

    window.addEventListener("unauthorized" as any, handleUnauthorized);

    return () => {
      window.removeEventListener("unauthorized" as any, handleUnauthorized);
    };
  }, [setLocation, logout]);

  return null;
}
