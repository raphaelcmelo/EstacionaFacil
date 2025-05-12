import { useAuth } from "@/lib/auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/spinner";
import { Helmet } from "react-helmet";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatMoney } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertCircle } from "lucide-react";

// Form schema for adding/editing price configs
const priceConfigSchema = z.object({
  zoneId: z.number().int().positive("Selecione uma zona"),
  validFrom: z.string().min(1, "Data de início é obrigatória"),
  validTo: z.string().optional(),
  hour1Price: z.string().min(1, "Informe o valor para 1 hora"),
  hour2Price: z.string().min(1, "Informe o valor para 2 horas"),
  hour3Price: z.string().min(1, "Informe o valor para 3 horas"),
  hour4Price: z.string().min(1, "Informe o valor para 4 horas"),
  hour5Price: z.string().min(1, "Informe o valor para 5 horas"),
  hour6Price: z.string().min(1, "Informe o valor para 6 horas"),
  hour12Price: z.string().min(1, "Informe o valor para 12 horas"),
});

type PriceConfigFormData = z.infer<typeof priceConfigSchema>;

export default function AdminPrices() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // States for dialogs
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPriceConfig, setSelectedPriceConfig] = useState<any>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
  
  // Get zones list
  const { data: zones, isLoading: isLoadingZones } = useQuery({
    queryKey: ['/api/zones'],
    enabled: !!user && (user.role === "MANAGER" || user.role === "ADMIN"),
  });
  
  // Get price configs for selected zone
  const { data: priceConfigs, isLoading: isLoadingPrices } = useQuery({
    queryKey: ['/api/admin/prices', selectedZoneId],
    enabled: !!selectedZoneId,
  });
  
  // Forms
  const addForm = useForm<PriceConfigFormData>({
    resolver: zodResolver(priceConfigSchema),
    defaultValues: {
      zoneId: 0,
      validFrom: format(new Date(), "yyyy-MM-dd'T'HH:mm", { locale: ptBR }),
      validTo: "",
      hour1Price: "",
      hour2Price: "",
      hour3Price: "",
      hour4Price: "",
      hour5Price: "",
      hour6Price: "",
      hour12Price: "",
    },
  });
  
  const editForm = useForm<PriceConfigFormData>({
    resolver: zodResolver(priceConfigSchema),
    defaultValues: {
      zoneId: 0,
      validFrom: "",
      validTo: "",
      hour1Price: "",
      hour2Price: "",
      hour3Price: "",
      hour4Price: "",
      hour5Price: "",
      hour6Price: "",
      hour12Price: "",
    },
  });
  
  // Mutations
  const addPriceConfigMutation = useMutation({
    mutationFn: async (data: PriceConfigFormData) => {
      return await apiRequest("POST", "/api/admin/prices", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/prices', selectedZoneId] });
      toast({
        title: "Configuração de preço adicionada",
        description: "Configuração de preço adicionada com sucesso.",
      });
      setIsAddDialogOpen(false);
      addForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar configuração de preço. Tente novamente.",
        variant: "destructive",
      });
    },
  });
  
  const editPriceConfigMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: PriceConfigFormData }) => {
      return await apiRequest("PUT", `/api/admin/prices/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/prices', selectedZoneId] });
      toast({
        title: "Configuração de preço atualizada",
        description: "Configuração de preço atualizada com sucesso.",
      });
      setIsEditDialogOpen(false);
      editForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar configuração de preço. Tente novamente.",
        variant: "destructive",
      });
    },
  });
  
  const deletePriceConfigMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/admin/prices/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/prices', selectedZoneId] });
      toast({
        title: "Configuração de preço excluída",
        description: "Configuração de preço excluída com sucesso.",
      });
      setIsDeleteDialogOpen(false);
      setSelectedPriceConfig(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir configuração de preço. Tente novamente.",
        variant: "destructive",
      });
    },
  });
  
  // Handlers
  const handleZoneChange = (zoneId: string) => {
    setSelectedZoneId(parseInt(zoneId));
  };
  
  const handleAddPriceConfig = () => {
    addForm.setValue("zoneId", selectedZoneId || 0);
    setIsAddDialogOpen(true);
  };
  
  const handleEditPriceConfig = (priceConfig: any) => {
    editForm.reset({
      zoneId: priceConfig.zoneId,
      validFrom: format(new Date(priceConfig.validFrom), "yyyy-MM-dd'T'HH:mm", { locale: ptBR }),
      validTo: priceConfig.validTo ? format(new Date(priceConfig.validTo), "yyyy-MM-dd'T'HH:mm", { locale: ptBR }) : "",
      hour1Price: priceConfig.hour1Price,
      hour2Price: priceConfig.hour2Price,
      hour3Price: priceConfig.hour3Price,
      hour4Price: priceConfig.hour4Price,
      hour5Price: priceConfig.hour5Price,
      hour6Price: priceConfig.hour6Price,
      hour12Price: priceConfig.hour12Price,
    });
    setSelectedPriceConfig(priceConfig);
    setIsEditDialogOpen(true);
  };
  
  const handleDeletePriceConfig = (priceConfig: any) => {
    setSelectedPriceConfig(priceConfig);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDeletePriceConfig = () => {
    if (selectedPriceConfig) {
      deletePriceConfigMutation.mutate(selectedPriceConfig.id);
    }
  };
  
  const onAddSubmit = (data: PriceConfigFormData) => {
    addPriceConfigMutation.mutate(data);
  };
  
  const onEditSubmit = (data: PriceConfigFormData) => {
    if (selectedPriceConfig) {
      editPriceConfigMutation.mutate({ id: selectedPriceConfig.id, data });
    }
  };
  
  // Format dates for display
  const formatDate = (date: string) => {
    return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: ptBR });
  };
  
  if (isLoadingZones) {
    return <LoadingSpinner />;
  }
  
  if (!user || (user.role !== "MANAGER" && user.role !== "ADMIN")) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Acesso Negado</h2>
          <p className="text-gray-600 mb-4">Você não tem permissão para acessar esta página.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>Gerenciar Preços - EstacionaFácil</title>
        <meta name="description" content="Gerencie os preços de estacionamento para cada zona do sistema rotativo municipal." />
      </Helmet>
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gerenciar Preços</h2>
        <Button 
          onClick={handleAddPriceConfig} 
          className="bg-secondary hover:bg-secondary-light text-white"
          disabled={!selectedZoneId}
        >
          <i className="material-icons mr-2">add</i>
          Nova Configuração de Preço
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader className="p-4 border-b border-gray-200">
            <CardTitle className="text-lg">Configuração de Preços por Zona</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="mb-6">
              <Label className="block text-sm font-medium text-gray-700 mb-2">Selecione uma zona para configurar os preços:</Label>
              <Select onValueChange={handleZoneChange}>
                <SelectTrigger className="w-full md:w-80">
                  <SelectValue placeholder="Selecione uma zona" />
                </SelectTrigger>
                <SelectContent>
                  {zones?.map((zone: any) => (
                    <SelectItem key={zone.id} value={zone.id.toString()}>
                      {zone.name} {!zone.active && "(Inativa)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedZoneId && (
              <div>
                <Tabs defaultValue="current">
                  <TabsList className="mb-4">
                    <TabsTrigger value="current">Configuração Atual</TabsTrigger>
                    <TabsTrigger value="history">Histórico</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="current">
                    {isLoadingPrices ? (
                      <LoadingSpinner size={24} />
                    ) : priceConfigs?.current ? (
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">Configuração Atual de Preços</h3>
                            <p className="text-sm text-gray-600">
                              Válida desde: {formatDate(priceConfigs.current.validFrom)}
                              {priceConfigs.current.validTo && ` até ${formatDate(priceConfigs.current.validTo)}`}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditPriceConfig(priceConfigs.current)}
                              className="text-primary"
                            >
                              <i className="material-icons text-sm mr-1">edit</i>
                              Editar
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
                          <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <h4 className="font-medium mb-1">1 hora</h4>
                            <p className="text-secondary text-lg font-semibold">
                              {formatMoney(priceConfigs.current.hour1Price)}
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <h4 className="font-medium mb-1">2 horas</h4>
                            <p className="text-secondary text-lg font-semibold">
                              {formatMoney(priceConfigs.current.hour2Price)}
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <h4 className="font-medium mb-1">3 horas</h4>
                            <p className="text-secondary text-lg font-semibold">
                              {formatMoney(priceConfigs.current.hour3Price)}
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <h4 className="font-medium mb-1">4 horas</h4>
                            <p className="text-secondary text-lg font-semibold">
                              {formatMoney(priceConfigs.current.hour4Price)}
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <h4 className="font-medium mb-1">5 horas</h4>
                            <p className="text-secondary text-lg font-semibold">
                              {formatMoney(priceConfigs.current.hour5Price)}
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <h4 className="font-medium mb-1">6 horas</h4>
                            <p className="text-secondary text-lg font-semibold">
                              {formatMoney(priceConfigs.current.hour6Price)}
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <h4 className="font-medium mb-1">12 horas</h4>
                            <p className="text-secondary text-lg font-semibold">
                              {formatMoney(priceConfigs.current.hour12Price)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-gray-50 rounded-lg">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                          <i className="material-icons text-primary">info</i>
                        </div>
                        <h3 className="font-semibold mb-2">Nenhuma configuração de preço definida</h3>
                        <p className="text-gray-600 mb-4">Esta zona ainda não possui configuração de preços cadastrada.</p>
                        <Button
                          onClick={handleAddPriceConfig}
                          className="bg-secondary hover:bg-secondary-light text-white"
                        >
                          Adicionar Configuração
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="history">
                    {isLoadingPrices ? (
                      <LoadingSpinner size={24} />
                    ) : priceConfigs?.history && priceConfigs.history.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Período de Validade</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">1h</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">2h</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">3h</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">4h</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">5h</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">6h</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">12h</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {priceConfigs.history.map((config: any) => (
                              <tr key={config.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                    {formatDate(config.validFrom)}
                                  </div>
                                  {config.validTo && (
                                    <div className="text-sm text-gray-500">
                                      até {formatDate(config.validTo)}
                                    </div>
                                  )}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {formatMoney(config.hour1Price)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {formatMoney(config.hour2Price)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {formatMoney(config.hour3Price)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {formatMoney(config.hour4Price)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {formatMoney(config.hour5Price)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {formatMoney(config.hour6Price)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {formatMoney(config.hour12Price)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                  <div className="flex space-x-2">
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => handleDeletePriceConfig(config)}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <i className="material-icons text-sm">delete</i>
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-gray-50 rounded-lg">
                        <p className="text-gray-600">Nenhum histórico de preços disponível para esta zona.</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Add Price Config Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Configuração de Preço</DialogTitle>
            <DialogDescription>
              Configure os valores para cada período de estacionamento.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
              <FormField
                control={addForm.control}
                name="validFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Válido a partir de</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addForm.control}
                name="validTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Válido até (opcional)</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-gray-500">Se não informado, será válido indefinidamente.</p>
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addForm.control}
                  name="hour1Price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor 1 hora</FormLabel>
                      <FormControl>
                        <Input placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="hour2Price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor 2 horas</FormLabel>
                      <FormControl>
                        <Input placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="hour3Price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor 3 horas</FormLabel>
                      <FormControl>
                        <Input placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="hour4Price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor 4 horas</FormLabel>
                      <FormControl>
                        <Input placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="hour5Price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor 5 horas</FormLabel>
                      <FormControl>
                        <Input placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="hour6Price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor 6 horas</FormLabel>
                      <FormControl>
                        <Input placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="hour12Price"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Valor 12 horas</FormLabel>
                      <FormControl>
                        <Input placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary-light"
                  disabled={addPriceConfigMutation.isPending}
                >
                  {addPriceConfigMutation.isPending ? "Adicionando..." : "Adicionar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Price Config Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Configuração de Preço</DialogTitle>
            <DialogDescription>
              Atualize os valores para cada período de estacionamento.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="validFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Válido a partir de</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="validTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Válido até (opcional)</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-gray-500">Se não informado, será válido indefinidamente.</p>
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="hour1Price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor 1 hora</FormLabel>
                      <FormControl>
                        <Input placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="hour2Price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor 2 horas</FormLabel>
                      <FormControl>
                        <Input placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="hour3Price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor 3 horas</FormLabel>
                      <FormControl>
                        <Input placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="hour4Price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor 4 horas</FormLabel>
                      <FormControl>
                        <Input placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="hour5Price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor 5 horas</FormLabel>
                      <FormControl>
                        <Input placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="hour6Price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor 6 horas</FormLabel>
                      <FormControl>
                        <Input placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="hour12Price"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Valor 12 horas</FormLabel>
                      <FormControl>
                        <Input placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary-light"
                  disabled={editPriceConfigMutation.isPending}
                >
                  {editPriceConfigMutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Price Config Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Configuração de Preço</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta configuração de preço? Esta ação não pode ser desfeita e pode afetar as permissões de estacionamento existentes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePriceConfig}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deletePriceConfigMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Label component for the form
function Label({ children, className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={`block text-sm font-medium text-gray-700 ${className || ''}`} {...props}>
      {children}
    </label>
  );
}
