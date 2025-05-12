import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { LoadingSpinner } from "@/components/ui/spinner";
import { Helmet } from "react-helmet";
import { formatMoney } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState("week");
  
  // Get admin statistics
  const { data: adminStats, isLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
    enabled: !!user && (user.role === "MANAGER" || user.role === "ADMIN"),
  });
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return (
    <>
      <Helmet>
        <title>Painel Administrativo - EstacionaFácil</title>
        <meta name="description" content="Gerencie o sistema de estacionamento rotativo municipal, visualize estatísticas e monitore as operações." />
      </Helmet>
      
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Painel Administrativo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Permissões Hoje</span>
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <i className="material-icons text-primary">confirmation_number</i>
                </div>
              </div>
              <p className="text-2xl font-semibold">{adminStats?.permitStats?.todayCount || 0}</p>
              <p className="text-xs text-green-600 flex items-center">
                <i className="material-icons text-xs mr-1">arrow_upward</i>
                {Math.round(((adminStats?.permitStats?.todayCount || 0) / (adminStats?.permitStats?.yesterdayCount || 1) - 1) * 100)}% em relação a ontem
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
              <p className="text-2xl font-semibold">{formatMoney(adminStats?.permitStats?.todayRevenue || 0)}</p>
              <p className="text-xs text-green-600 flex items-center">
                <i className="material-icons text-xs mr-1">arrow_upward</i>
                {Math.round(((adminStats?.permitStats?.todayRevenue || 0) / (adminStats?.permitStats?.yesterdayRevenue || 1) - 1) * 100)}% em relação a ontem
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
              <p className="text-2xl font-semibold">23</p>
              <p className="text-xs text-red-600 flex items-center">
                <i className="material-icons text-xs mr-1">arrow_downward</i>
                5% em relação a ontem
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
              <p className="text-2xl font-semibold">1.287</p>
              <p className="text-xs text-green-600 flex items-center">
                <i className="material-icons text-xs mr-1">arrow_upward</i>
                3% esta semana
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="lg:col-span-2">
            <CardHeader className="p-4 border-b border-gray-200 flex justify-between items-center">
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
              <div className="h-64 flex items-center justify-center">
                {/* Placeholder for chart - in a real app, use a chart library like recharts */}
                <div className="text-center text-gray-500">
                  <i className="material-icons text-5xl mb-2">bar_chart</i>
                  <p>Gráfico de receita diária</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4 border-b border-gray-200">
              <CardTitle className="text-lg">Ocupação por Zona</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                {adminStats?.zoneOccupancy?.map((zone: any) => (
                  <div key={zone.zoneId}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{zone.zoneName}</span>
                      <span className="text-sm text-gray-600">{zone.occupancyRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${
                          zone.occupancyRate > 80 ? 'bg-red-500' : 
                          zone.occupancyRate > 60 ? 'bg-primary' : 
                          'bg-green-500'
                        } h-2 rounded-full`}
                        style={{ width: `${zone.occupancyRate}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="p-4 border-b border-gray-200 flex justify-between items-center">
              <CardTitle className="text-lg">Últimas Permissões</CardTitle>
              <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-100">
                Ver Todas
              </Button>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Veículo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duração</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zona</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">#PER-7832</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">ABC1234</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">2 horas</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">Centro</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">R$ 5,00</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Ativa</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">#PER-7831</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">DEF5678</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">1 hora</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">Orla</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">R$ 3,00</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Ativa</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">#PER-7830</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">GHI9012</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">3 horas</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">Comercial</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">R$ 7,00</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Expirada</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <CardHeader className="p-4 border-b border-gray-200">
              <CardTitle className="text-lg">Desempenho dos Fiscais</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                {adminStats?.fiscalPerformance?.map((fiscal: any) => (
                  <div key={fiscal.fiscalId} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-medium">{fiscal.fiscalName}</div>
                      <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {fiscal.verifications} verificações hoje
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-grow bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${fiscal.performance}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium">{fiscal.performance}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <div className="p-4 border-t border-gray-200">
              <Button variant="ghost" className="w-full py-2 text-primary hover:bg-blue-50">
                Relatório Completo
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
