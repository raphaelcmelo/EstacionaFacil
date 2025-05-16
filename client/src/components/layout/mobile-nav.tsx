import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth";

export default function MobileNav() {
  const [location] = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => {
    return location === path;
  };

  if (!user) {
    // Simplified menu for non-authenticated users
    return (
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex justify-around">
          <Link
            href="/"
            className={cn(
              "flex flex-col items-center py-2 px-3",
              isActive("/") ? "text-primary" : "text-gray-600"
            )}
          >
            <i className="material-icons">home</i>
            <span className="text-xs mt-1">Início</span>
          </Link>
          <Link
            href="/check-permit"
            className={cn(
              "flex flex-col items-center py-2 px-3",
              isActive("/check-permit") ? "text-primary" : "text-gray-600"
            )}
          >
            <i className="material-icons">search</i>
            <span className="text-xs mt-1">Consultar</span>
          </Link>
          <Link
            href="/quick-buy"
            className={cn(
              "flex flex-col items-center py-2 px-3",
              isActive("/quick-buy") ? "text-primary" : "text-gray-600"
            )}
          >
            <i className="material-icons">add_circle</i>
            <span className="text-xs mt-1">Comprar</span>
          </Link>
          <Link
            href="/login"
            className={cn(
              "flex flex-col items-center py-2 px-3",
              isActive("/login") ? "text-primary" : "text-gray-600"
            )}
          >
            <i className="material-icons">person</i>
            <span className="text-xs mt-1">Entrar</span>
          </Link>
        </div>
      </div>
    );
  }

  // Full menu for authenticated users
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around">
        <Link
          href="/dashboard"
          className={cn(
            "flex flex-col items-center py-2 px-3",
            isActive("/dashboard") ? "text-primary" : "text-gray-600"
          )}
        >
          <i className="material-icons">home</i>
          <span className="text-xs mt-1">Início</span>
        </Link>
        <Link
          href="/check-permit"
          className={cn(
            "flex flex-col items-center py-2 px-3",
            isActive("/check-permit") ? "text-primary" : "text-gray-600"
          )}
        >
          <i className="material-icons">search</i>
          <span className="text-xs mt-1">Consultar</span>
        </Link>
        <Link
          href="/quick-buy"
          className={cn(
            "flex flex-col items-center py-2 px-3",
            isActive("/quick-buy") ? "text-primary" : "text-gray-600"
          )}
        >
          <i className="material-icons">add_circle</i>
          <span className="text-xs mt-1">Comprar</span>
        </Link>
        <Link
          href="/vehicles"
          className={cn(
            "flex flex-col items-center py-2 px-3",
            isActive("/vehicles") ? "text-primary" : "text-gray-600"
          )}
        >
          <i className="material-icons">directions_car</i>
          <span className="text-xs mt-1">Veículos</span>
        </Link>
        {(user.role === "FISCAL" || user.role === "ADMIN") && (
          <Link
            href="/fiscal/verify"
            className={cn(
              "flex flex-col items-center py-2 px-3",
              isActive("/fiscal") || isActive("/fiscal/verify")
                ? "text-primary"
                : "text-gray-600"
            )}
          >
            <i className="material-icons">verified</i>
            <span className="text-xs mt-1">Fiscal</span>
          </Link>
        )}
        {(user.role === "MANAGER" || user.role === "ADMIN") && (
          <Link
            href="/admin"
            className={cn(
              "flex flex-col items-center py-2 px-3",
              location.startsWith("/admin") ? "text-primary" : "text-gray-600"
            )}
          >
            <i className="material-icons">dashboard</i>
            <span className="text-xs mt-1">Admin</span>
          </Link>
        )}
      </div>
    </div>
  );
}
