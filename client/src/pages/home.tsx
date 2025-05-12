import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Helmet } from "react-helmet";

export default function Home() {
  const { user } = useAuth();
  
  return (
    <>
      <Helmet>
        <title>EstacionaFácil - Sistema de Estacionamento Rotativo Municipal</title>
        <meta name="description" content="Estacione seu veículo em qualquer vaga rotativa da cidade de forma simples e rápida. Sistema oficial de estacionamento rotativo municipal." />
      </Helmet>
      
      <div className="mb-10">
        <div className="bg-gradient-to-r from-primary to-primary-dark rounded-xl overflow-hidden shadow-lg mb-8">
          <div className="md:flex">
            <div className="p-6 md:p-8 md:w-1/2">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">Estacionamento Rotativo Municipal</h1>
              <p className="text-white opacity-90 mb-6">Estacione seu veículo em qualquer vaga rotativa da cidade de forma simples e rápida.</p>
              <div className="flex flex-wrap gap-3">
                <Link href="/quick-buy">
                  <Button className="bg-secondary hover:bg-secondary-light text-white font-semibold px-5 py-6 h-auto">
                    <i className="material-icons mr-2">add_circle</i>
                    Comprar Agora
                  </Button>
                </Link>
                <Link href="/check-permit">
                  <Button variant="outline" className="bg-white hover:bg-gray-100 text-primary font-semibold px-5 py-6 h-auto">
                    <i className="material-icons mr-2">search</i>
                    Consultar Tempo
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 h-48 md:h-auto">
              <img 
                src="https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400" 
                alt="Estacionamento municipal rotativo" 
                className="w-full h-full object-cover" 
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <i className="material-icons text-primary text-2xl">credit_card</i>
            </div>
            <h3 className="font-semibold text-lg mb-2">Pagamento Rápido</h3>
            <p className="text-gray-600">Pague com cartão de crédito, débito ou PIX em poucos cliques.</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <i className="material-icons text-secondary text-2xl">notifications_active</i>
            </div>
            <h3 className="font-semibold text-lg mb-2">Alertas de Expiração</h3>
            <p className="text-gray-600">Receba notificações via WhatsApp para renovar sua permissão.</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <i className="material-icons text-primary text-2xl">directions_car</i>
            </div>
            <h3 className="font-semibold text-lg mb-2">Múltiplos Veículos</h3>
            <p className="text-gray-600">Cadastre e gerencie todos os seus veículos em uma única conta.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="p-6 md:p-8">
            <h2 className="text-xl font-bold mb-4">Como Funciona</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold mb-3">1</div>
                <h3 className="font-semibold mb-2">Informe seu veículo</h3>
                <p className="text-gray-600 text-sm">Digite a placa e modelo do seu veículo.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold mb-3">2</div>
                <h3 className="font-semibold mb-2">Escolha o tempo</h3>
                <p className="text-gray-600 text-sm">Selecione a duração desejada para estacionar.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold mb-3">3</div>
                <h3 className="font-semibold mb-2">Pague facilmente</h3>
                <p className="text-gray-600 text-sm">Utilize seu cartão ou PIX para pagamento.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold mb-3">4</div>
                <h3 className="font-semibold mb-2">Estacione tranquilo</h3>
                <p className="text-gray-600 text-sm">Receba confirmação e estacione sem preocupações.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1556741533-6e6a62bd8b49?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300" 
              alt="Pagamento móvel de estacionamento" 
              className="w-full h-40 object-cover" 
            />
            <div className="p-6">
              <h3 className="font-semibold text-lg mb-2">Usuários não cadastrados</h3>
              <p className="text-gray-600 mb-4">Não é necessário criar uma conta para usar o sistema. Compre sua permissão rapidamente.</p>
              <Link href="/quick-buy">
                <Button className="bg-primary hover:bg-primary-light text-white">Comprar sem cadastro</Button>
              </Link>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300" 
              alt="Usuário verificando tempo de estacionamento" 
              className="w-full h-40 object-cover" 
            />
            <div className="p-6">
              <h3 className="font-semibold text-lg mb-2">Usuários cadastrados</h3>
              <p className="text-gray-600 mb-4">Cadastre-se para agilizar compras futuras, receber alertas e ver seu histórico.</p>
              {!user ? (
                <Link href="/register">
                  <Button className="bg-secondary hover:bg-secondary-light text-white">Criar conta</Button>
                </Link>
              ) : (
                <Link href="/dashboard">
                  <Button className="bg-secondary hover:bg-secondary-light text-white">Meu painel</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
