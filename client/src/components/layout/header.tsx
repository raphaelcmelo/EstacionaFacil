import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

export default function Header() {
  const { user, logout } = useAuth();
  const [location, navigate] = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="bg-primary sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {!user ? (
          <Link href="/" className="flex items-center space-x-2">
            <i className="material-icons text-white">local_parking</i>
            <h1 className="text-white font-bold text-xl hidden md:block">
              EstacionaFácil
            </h1>
            <h1 className="text-white font-bold text-xl md:hidden">E-Fácil</h1>
          </Link>
        ) : (
          <Link href="/dashboard" className="flex items-center space-x-2">
            <i className="material-icons text-white">local_parking</i>
            <h1 className="text-white font-bold text-xl hidden md:block">
              EstacionaFácil
            </h1>
            <h1 className="text-white font-bold text-xl md:hidden">E-Fácil</h1>
          </Link>
        )}

        <div className="flex items-center">
          {!user ? (
            <Link href="/login">
              <Button
                variant="default"
                className="bg-primary-dark hover:bg-primary-light text-white"
              >
                Entrar
              </Button>
            </Link>
          ) : (
            <div className="flex items-center space-x-3">
              <span className="text-white text-sm hidden md:inline">
                {user.name}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-8 h-8 rounded-full bg-primary-light text-white p-0 cursor-pointer"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary-light text-white">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {(user.role === "CITIZEN" ||
                    user.role === "FISCAL" ||
                    user.role === "MANAGER" ||
                    user.role === "ADMIN") && (
                    <>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => navigate("/dashboard")}
                      >
                        Meu Painel
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => navigate("/vehicles")}
                      >
                        Meus Veículos
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => navigate("/history")}
                      >
                        Histórico
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => navigate("/permissoes-ativas")}
                      >
                        Permissões Ativas
                      </DropdownMenuItem>
                    </>
                  )}

                  {(user.role === "FISCAL" || user.role === "ADMIN") && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => navigate("/fiscal")}
                      >
                        Painel de Fiscalização
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => navigate("/fiscal/verify")}
                      >
                        Verificar Veículo
                      </DropdownMenuItem>
                    </>
                  )}

                  {(user.role === "MANAGER" || user.role === "ADMIN") && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => navigate("/admin")}
                      >
                        Painel Administrativo
                      </DropdownMenuItem>
                    </>
                  )}

                  {user.role === "ADMIN" && (
                    <>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => navigate("/admin/users")}
                      >
                        Gerenciar Usuários
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={handleLogout}
                  >
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
