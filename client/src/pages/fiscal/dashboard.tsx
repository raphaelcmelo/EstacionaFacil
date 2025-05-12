import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { LoadingSpinner } from "@/components/ui/spinner";
import { Helmet } from "react-helmet";
import { formatDateTime } from "@/lib/utils";

export default function FiscalDashboard() {
  const { user } = useAuth();
  
  // Get fiscal activities
  const { data: fiscalActivities, isLoading } = useQuery({
    queryKey: ['/api/fiscal/activity'],
    enabled: !!user && (user.role === "FISCAL" || user.role === "ADMIN"),
  });
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return (
    <>
      <Helmet>
        <title>Painel de Fiscalização - EstacionaFácil</title>
        <meta name="description" content="Monitore e verifique permissões de estacionamento como fiscal do sistema." />
      </Helmet>
      
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Aplicativo de Fiscalização</h2>
        <div className="bg-blue-50 border-l-4 border-primary p-4 rounded-r-lg mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="material-icons text-primary">info</i>
            </div>
            <div className="ml-3">
              <p className="text-sm text-primary-dark">
                Fiscal: <span className="font-semibold">{user?.name}</span> • Código: <span className="font-semibold">{user?.fiscalCode || "F-12345"}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Card className="mb-6 overflow-hidden">
        <CardHeader className="p-6">
          <CardTitle className="text-lg">Verificar Veículo</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-6">
            <Link href="/fiscal/verify">
              <Button className="w-full py-3 bg-primary hover:bg-primary-light text-white rounded-lg transition-colors flex items-center justify-center">
                <i className="material-icons mr-2">search</i>
                Iniciar Verificação
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">Verificações Hoje</h3>
                    <p className="text-2xl font-bold text-primary">{fiscalActivities?.length || 0}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <i className="material-icons text-primary">verified</i>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">Infrações Registradas</h3>
                    <p className="text-2xl font-bold text-red-500">0</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <i className="material-icons text-red-500">report_problem</i>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 border-b border-gray-200">
          <CardTitle className="text-lg">Atividade Recente</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Placa</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horário</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ação</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {fiscalActivities && fiscalActivities.length > 0 ? (
                fiscalActivities.map((action: any) => (
                  <tr key={action.id}>
                    <td className="px-4 py-3 whitespace-nowrap font-medium">{action.licensePlate}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {formatDateTime(action.actionTime)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full 
                        ${action.actionType === 'VERIFICATION' ? 'bg-green-100 text-green-800' : 
                          action.actionType === 'INFRINGEMENT' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {action.actionType === 'VERIFICATION' ? 'Verificado' : 
                         action.actionType === 'INFRINGEMENT' ? 'Infração' : 
                         'Patrulha'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      <Button variant="ghost" size="sm" className="text-primary hover:text-primary-dark">
                        <i className="material-icons text-sm">visibility</i>
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                    Nenhuma atividade registrada ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-200">
          <Button variant="ghost" className="w-full py-2 text-primary hover:bg-blue-50">
            Ver Todas as Verificações
          </Button>
        </div>
      </Card>
    </>
  );
}
