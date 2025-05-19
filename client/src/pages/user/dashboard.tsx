import { useAuth } from "@/context/auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { LoadingSpinner } from "@/components/ui/spinner";
import { formatTimeRemaining, formatDateTime, formatMoney } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { apiRequest } from "@/lib/queryClient";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

type Vehicle = {
  id: string;
  userId: string;
  placa: string;
  modelo: string;
  createdAt: string;
  updatedAt: string;
};

export default function UserDashboard() {
  const { user } = useAuth();

  // Get active parking permits
  const { data: activePermits = [], isLoading: isLoadingPermits } = useQuery({
    queryKey: ["/api/permits/active"],
    enabled: !!user,
  });

  // Get user vehicles
  const { data: vehicles = [], isLoading: isLoadingVehicles } = useQuery<
    Vehicle[]
  >({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const response = await apiRequest(
        "GET",
        `${baseUrl}/v1/estaciona-facil/veiculo/listar`
      );
      return response;
    },
    enabled: !!user,
  });

  // Get permit history for the stats
  const { data: permitHistory = [], isLoading: isLoadingHistory } = useQuery({
    queryKey: ["/api/permits/history", { limit: 10, offset: 0 }],
    enabled: !!user,
  });

  // State for time remaining counters
  const [timeRemaining, setTimeRemaining] = useState<{ [key: number]: string }>(
    {}
  );

  // Update time remaining every second
  useEffect(() => {
    if (!activePermits) return;

    const updateTimeRemaining = () => {
      const newTimeRemaining: { [key: number]: string } = {};

      activePermits.forEach((permit: any) => {
        newTimeRemaining[permit.id] = formatTimeRemaining(permit.endTime);
      });

      setTimeRemaining(newTimeRemaining);
    };

    updateTimeRemaining();
    const intervalId = setInterval(updateTimeRemaining, 1000);

    return () => clearInterval(intervalId);
  }, [activePermits]);

  // Calculate stats
  const purchasesThisMonth = permitHistory?.length || 0;

  // Calculate savings (mock calculation - in reality would depend on business rules)
  const savingsThisMonth = purchasesThisMonth > 3 ? 8.5 : 0;

  if (isLoadingPermits || isLoadingVehicles || isLoadingHistory) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Helmet>
        <title>Meu Painel - EstacionaFácil</title>
        <meta
          name="description"
          content="Gerencie suas permissões de estacionamento, visualize suas permissões ativas e acesse seu histórico."
        />
      </Helmet>

      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">
          Olá, {user?.name?.split(" ")[0]}!
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Permissões Ativas</span>
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <i className="material-icons text-green-600">timer</i>
                </div>
              </div>
              <p className="text-2xl font-semibold">
                {activePermits?.length || 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Veículos Cadastrados</span>
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <i className="material-icons text-primary">directions_car</i>
                </div>
              </div>
              <p className="text-2xl font-semibold">{vehicles?.length || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Compras Este Mês</span>
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <i className="material-icons text-purple-600">receipt</i>
                </div>
              </div>
              <p className="text-2xl font-semibold">{purchasesThisMonth}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Economia no Mês</span>
                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                  <i className="material-icons text-yellow-600">savings</i>
                </div>
              </div>
              <p className="text-2xl font-semibold">
                {formatMoney(savingsThisMonth)}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader className="p-4 border-b border-gray-200">
          <CardTitle className="text-lg">Permissões Ativas</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {activePermits?.length > 0 ? (
            activePermits.map((permit: any) => (
              <div key={permit.id} className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                  <div className="mb-2 md:mb-0">
                    <div className="flex items-center">
                      <i className="material-icons text-green-600 mr-2">
                        directions_car
                      </i>
                      <span className="font-semibold">
                        {permit.vehicle.licensePlate} • {permit.vehicle.model}
                      </span>
                    </div>
                    <div className="text-gray-600 text-sm mt-1">
                      {permit.zone.name}
                    </div>
                  </div>
                  <div className="bg-green-100 px-3 py-1 rounded-full text-green-800 text-sm font-medium flex items-center self-start md:self-center">
                    <i className="material-icons text-xs mr-1">check_circle</i>
                    Ativa
                  </div>
                </div>
                <div className="flex flex-col md:flex-row justify-between md:items-center">
                  <div>
                    <div className="text-sm text-gray-600">Válida até:</div>
                    <div className="font-semibold">
                      {formatDateTime(permit.endTime)}
                    </div>
                  </div>
                  <div className="mt-2 md:mt-0">
                    <div className="text-sm text-gray-600">Tempo restante:</div>
                    <div className="font-semibold text-lg text-primary">
                      {timeRemaining[permit.id] ||
                        formatTimeRemaining(permit.endTime)}
                    </div>
                  </div>
                  <div className="mt-3 md:mt-0">
                    <Link href="/quick-buy">
                      <Button className="bg-secondary hover:bg-secondary-light text-white">
                        Estender
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <i className="material-icons text-gray-400 text-2xl">
                  timer_off
                </i>
              </div>
              <h3 className="font-semibold text-lg mb-2">
                Nenhuma permissão ativa
              </h3>
              <p className="text-gray-600 mb-4">
                Você não possui permissões de estacionamento ativas no momento.
              </p>
              <Link href="/quick-buy">
                <Button variant="secondary">Comprar Permissão</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader className="p-4 border-b border-gray-200 flex justify-between items-center">
          <CardTitle className="text-lg">Meus Veículos</CardTitle>
          <Link href="/vehicles">
            <Button variant="default" size="sm">
              <i className="material-icons text-sm mr-1">add</i>
              Adicionar
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vehicles?.length > 0 ? (
              vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-primary transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center">
                      <i className="material-icons text-primary mr-2">
                        directions_car
                      </i>
                      <span className="font-semibold">{vehicle.placa}</span>
                    </div>
                    <div className="flex space-x-2">
                      <Link href={`/vehicles?edit=${vehicle.id}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-gray-500 hover:text-primary"
                        >
                          <i className="material-icons text-sm">edit</i>
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <div className="text-gray-600">{vehicle.modelo}</div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-6">
                <p className="text-gray-600">
                  Você não possui veículos cadastrados.
                </p>
                <Link href="/vehicles">
                  <Button variant="default">Cadastrar Veículo</Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 border-b border-gray-200 flex justify-between items-center">
          <CardTitle className="text-lg">Histórico de Permissões</CardTitle>
          <Link href="/history">
            <Button
              variant="outline"
              size="sm"
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              <i className="material-icons text-sm mr-1">filter_list</i>
              Ver Tudo
            </Button>
          </Link>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Veículo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duração
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Zona
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {permitHistory?.length > 0 ? (
                permitHistory.map((history: any) => (
                  <tr key={history.id}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="font-medium">
                          {history.vehicle.licensePlate}
                        </span>
                        <span className="text-gray-500 ml-2">
                          {history.vehicle.model}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {new Date(history.startTime).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {history.durationHours}{" "}
                      {history.durationHours === 1 ? "hora" : "horas"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {history.zone.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatMoney(history.amount)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-primary hover:text-primary-dark"
                      >
                        <i className="material-icons text-sm">receipt</i>
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    Nenhuma permissão encontrada no histórico.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
