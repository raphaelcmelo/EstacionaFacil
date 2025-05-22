import { useAuth } from "@/context/auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { LoadingSpinner } from "@/components/ui/spinner";
import { Helmet } from "react-helmet";
import { formatMoney, formatDateTime } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { PaymentStatus, PaymentMethod } from "@shared/schema";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Permissao {
  id: string;
  placa: string;
  dataInicio: string;
  dataFim: string;
  valor: number;
  status: PaymentStatus;
  metodoPagamento?: PaymentMethod;
  codigoTransacao?: string;
  duracaoHoras: number;
  criadoEm: string;
  atualizadoEm: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState("week");

  // Get admin statistics
  const { data: adminStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["/v1/estaciona-facil/admin/dashboard"],
    queryFn: async () => {
      const response = await apiRequest(
        "GET",
        "/v1/estaciona-facil/admin/dashboard"
      );
      return response;
    },
    enabled: !!user && (user.role === "MANAGER" || user.role === "ADMIN"),
  });

  // Get latest permits
  const { data: latestPermits, isLoading: isLoadingPermits } = useQuery<
    Permissao[]
  >({
    queryKey: ["/v1/estaciona-facil/admin/permissoes"],
    queryFn: async () => {
      const response = await apiRequest(
        "GET",
        "/v1/estaciona-facil/admin/permissoes"
      );
      return response;
    },
    enabled: !!user && (user.role === "MANAGER" || user.role === "ADMIN"),
  });

  // Get permits by hour
  const { data: permissoesPorHorario, isLoading: isLoadingHorario } = useQuery({
    queryKey: ["/v1/estaciona-facil/admin/permissoes/horario"],
    queryFn: async () => {
      const response = await apiRequest(
        "GET",
        "/v1/estaciona-facil/admin/permissoes/horario"
      );
      return response;
    },
    enabled: !!user && (user.role === "MANAGER" || user.role === "ADMIN"),
  });

  if (isLoadingStats || isLoadingPermits || isLoadingHorario) {
    return <LoadingSpinner />;
  }

  const getStatusBadge = (status: PaymentStatus) => {
    const now = new Date();
    const isExpired = status === PaymentStatus.COMPLETED && now > new Date();

    if (status === PaymentStatus.PENDING) {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
          Pendente
        </span>
      );
    } else if (status === PaymentStatus.COMPLETED && !isExpired) {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
          Ativa
        </span>
      );
    } else if (status === PaymentStatus.FAILED) {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
          Falhou
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
          Expirada
        </span>
      );
    }
  };

  return (
    <>
      <Helmet>
        <title>Painel Administrativo - EstacionaFácil</title>
        <meta
          name="description"
          content="Gerencie o sistema de estacionamento rotativo municipal, visualize estatísticas e monitore as operações."
        />
      </Helmet>

      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Painel Administrativo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Permissões Hoje</span>
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <i className="material-icons text-primary">
                    confirmation_number
                  </i>
                </div>
              </div>
              <p className="text-2xl font-semibold">
                {adminStats?.permissoesHoje || 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Receita Hoje</span>
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <i className="material-icons text-green-600">paid</i>
                </div>
              </div>
              <p className="text-2xl font-semibold">
                {formatMoney(adminStats?.receitaTotalHoje || 0)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Infrações Hoje</span>
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <i className="material-icons text-red-600">report_problem</i>
                </div>
              </div>
              <p className="text-2xl font-semibold">
                {adminStats?.infracoesHoje || 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Usuários Ativos</span>
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <i className="material-icons text-purple-600">people</i>
                </div>
              </div>
              <p className="text-2xl font-semibold">
                {adminStats?.totalUsuariosCidadao || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="lg:col-span-3">
            <CardHeader className="p-4 border-b border-gray-200 bg-blue-100 flex justify-between items-center">
              <CardTitle className="text-lg">Receita Diária</CardTitle>
              <Select defaultValue={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Últimos 7 dias</SelectItem>
                  <SelectItem value="month">Últimos 30 dias</SelectItem>
                  <SelectItem value="year">Este ano</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={permissoesPorHorario}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="hora"
                      label={{
                        value: "Horário",
                        position: "insideBottom",
                        offset: -5,
                      }}
                    />
                    <YAxis
                      label={{
                        value: "Quantidade de Permissões",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <Tooltip
                      formatter={(value) => [
                        `${value} permissões`,
                        "Quantidade",
                      ]}
                      labelFormatter={(label) => `Horário: ${label}`}
                    />
                    <Bar dataKey="quantidade" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-3">
            <CardHeader className="p-4 border-b border-gray-200 bg-blue-100 flex justify-between items-center">
              <CardTitle className="text-lg">Últimas Permissões</CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Ver Todas
              </Button>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Veículo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duração
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Válido até
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {latestPermits?.map((permissao: Permissao) => (
                    <tr key={permissao.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        #{permissao.id.slice(-4)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                        {permissao.placa}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {permissao.duracaoHoras} horas
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {formatMoney(permissao.valor)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {formatDateTime(permissao.dataFim)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {getStatusBadge(permissao.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
