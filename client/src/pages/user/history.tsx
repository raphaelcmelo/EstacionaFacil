import { useAuth } from "@/context/auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/spinner";
import { useState } from "react";
import { Helmet } from "react-helmet";
import { formatDateTime, formatMoney } from "@/lib/utils";

export default function UserHistory() {
  const { user } = useAuth();
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);

  // Get permit history
  const { data: permitHistory, isLoading } = useQuery({
    queryKey: ["/api/permits/history", { limit, offset }],
    enabled: !!user,
  });

  // Handle pagination
  const handleNextPage = () => {
    setOffset((prev) => prev + limit);
  };

  const handlePrevPage = () => {
    setOffset((prev) => Math.max(0, prev - limit));
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Helmet>
        <title>Histórico de Permissões - EstacionaFácil</title>
        <meta
          name="description"
          content="Visualize o histórico completo de suas permissões de estacionamento."
        />
      </Helmet>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Histórico de Permissões</h2>
      </div>

      <Card>
        <CardHeader className="p-4 border-b border-gray-200 bg-blue-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-lg">Suas Permissões</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Filtrar por:</span>
              <Select defaultValue="all">
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="week">Esta semana</SelectItem>
                  <SelectItem value="month">Este mês</SelectItem>
                  <SelectItem value="year">Este ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
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
                  Valor
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
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
                      {formatDateTime(history.startTime)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {history.durationHours}{" "}
                      {history.durationHours === 1 ? "hora" : "horas"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatMoney(history.amount)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div
                        className={`px-2 py-1 text-xs rounded-full inline-flex items-center
                        ${
                          history.paymentStatus === "COMPLETED"
                            ? "bg-green-100 text-green-800"
                            : history.paymentStatus === "FAILED"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {history.paymentStatus === "COMPLETED"
                          ? "Pago"
                          : history.paymentStatus === "FAILED"
                          ? "Falhou"
                          : history.paymentStatus === "PENDING"
                          ? "Pendente"
                          : history.paymentStatus}
                      </div>
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
                    colSpan={7}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    Nenhuma permissão encontrada no histórico.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {permitHistory?.length > 0 && (
          <div className="p-4 border-t border-gray-200 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Mostrando {offset + 1}-
              {Math.min(offset + permitHistory.length, offset + limit)}{" "}
              resultados
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="border-gray-300 text-gray-700"
                disabled={offset === 0}
                onClick={handlePrevPage}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-100"
                disabled={permitHistory.length < limit}
                onClick={handleNextPage}
              >
                Próximo
              </Button>
            </div>
          </div>
        )}
      </Card>
    </>
  );
}
