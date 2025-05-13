import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Helmet } from "react-helmet";
import { LoadingSpinner } from "@/components/ui/spinner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function PurchaseOptions() {
  const { user, isLoading } = useAuth();
  const [location, navigate] = useLocation();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/quick-buy");
    }
  }, [user, navigate]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Helmet>
        <title>Opções de Compra - EstacionaFácil</title>
        <meta name="description" content="Escolha como deseja comprar sua permissão de estacionamento." />
      </Helmet>

      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Escolha como deseja continuar</h1>
          <p className="text-gray-600">Você pode comprar uma permissão de estacionamento com ou sem criar uma conta.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Opção de compra sem cadastro */}
          <Card className="relative overflow-hidden border-2 hover:border-primary hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 p-2 bg-primary text-white rounded-bl-lg font-medium">
              Rápido
            </div>
            <CardHeader>
              <CardTitle>Compra sem cadastro</CardTitle>
              <CardDescription>
                Compre rapidamente sem criar uma conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="mr-2 text-green-500">✓</span>
                  <span>Processo rápido sem necessidade de cadastro</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-green-500">✓</span>
                  <span>Compra única para estacionamento imediato</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-red-500">✗</span>
                  <span>Sem histórico de compras</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-red-500">✗</span>
                  <span>Sem cadastro de veículos para uso futuro</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => navigate("/quick-buy")}
              >
                Comprar sem cadastro
              </Button>
            </CardFooter>
          </Card>

          {/* Opção de compra com cadastro */}
          <Card className="relative overflow-hidden border-2 hover:border-primary hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 p-2 bg-primary text-white rounded-bl-lg font-medium">
              Recomendado
            </div>
            <CardHeader>
              <CardTitle>Compra com cadastro</CardTitle>
              <CardDescription>
                Crie uma conta para mais benefícios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="mr-2 text-green-500">✓</span>
                  <span>Cadastre seus veículos para compras futuras</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-green-500">✓</span>
                  <span>Acesse histórico completo de compras</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-green-500">✓</span>
                  <span>Receba notificações sobre suas permissões</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-green-500">✓</span>
                  <span>Compras mais rápidas nas próximas vezes</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="space-y-3 block">
              <Button 
                className="w-full mb-2" 
                onClick={() => navigate("/login?next=/quick-buy")}
              >
                Entrar na minha conta
              </Button>
              <div className="text-center">
                <span className="text-gray-500 text-sm">
                  Novo por aqui?{" "}
                  <Link href="/register?next=/quick-buy" className="text-primary hover:underline">
                    Criar conta
                  </Link>
                </span>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
}