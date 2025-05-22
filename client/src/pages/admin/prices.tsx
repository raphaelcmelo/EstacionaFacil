import { useAuth } from "@/context/auth";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { formatMoney } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertCircle } from "lucide-react";

interface PriceConfig {
  id: string;
  validFrom: string;
  validTo: string | null;
  hour1Price: number;
  hour2Price: number;
  hour3Price: number;
  hour4Price: number;
  hour5Price: number;
  hour6Price: number;
  hour12Price: number;
  createdAt: string;
  updatedAt?: string;
}

interface PriceConfigsResponse {
  current: PriceConfig;
  history: PriceConfig[];
}

// Form schema for adding/editing price configs
const priceConfigSchema = z.object({
  validFrom: z
    .string()
    .min(1, "Data de início é obrigatória")
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Data de início inválida",
    }),
  validTo: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Data de término inválida",
    }),
  hour1Price: z.number().min(0, "O valor deve ser maior ou igual a zero"),
  hour2Price: z.number().min(0, "O valor deve ser maior ou igual a zero"),
  hour3Price: z.number().min(0, "O valor deve ser maior ou igual a zero"),
  hour4Price: z.number().min(0, "O valor deve ser maior ou igual a zero"),
  hour5Price: z.number().min(0, "O valor deve ser maior ou igual a zero"),
  hour6Price: z.number().min(0, "O valor deve ser maior ou igual a zero"),
  hour12Price: z.number().min(0, "O valor deve ser maior ou igual a zero"),
});

type PriceConfigFormData = z.infer<typeof priceConfigSchema>;

export default function AdminPrices() {
  const { user } = useAuth();
  const { toast } = useToast();

  // States for dialogs
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPriceConfig, setSelectedPriceConfig] =
    useState<PriceConfig | null>(null);

  // Get price configs
  const { data: priceConfigs, isLoading: isLoadingPrices } =
    useQuery<PriceConfigsResponse>({
      queryKey: ["/v1/estaciona-facil/precos"],
      queryFn: async () => {
        const response = await apiRequest("GET", "/v1/estaciona-facil/precos");
        return response;
      },
      enabled: !!user && (user.role === "MANAGER" || user.role === "ADMIN"),
    });

  // Forms
  const addForm = useForm<PriceConfigFormData>({
    resolver: zodResolver(priceConfigSchema),
    defaultValues: {
      validFrom: format(new Date(), "yyyy-MM-dd'T'HH:mm", { locale: ptBR }),
      validTo: "",
      hour1Price: 0,
      hour2Price: 0,
      hour3Price: 0,
      hour4Price: 0,
      hour5Price: 0,
      hour6Price: 0,
      hour12Price: 0,
    },
  });

  const editForm = useForm<PriceConfigFormData>({
    resolver: zodResolver(priceConfigSchema),
    defaultValues: {
      validFrom: "",
      validTo: "",
      hour1Price: 0,
      hour2Price: 0,
      hour3Price: 0,
      hour4Price: 0,
      hour5Price: 0,
      hour6Price: 0,
      hour12Price: 0,
    },
  });

  // Mutations
  const addPriceConfigMutation = useMutation({
    mutationFn: async (data: PriceConfigFormData) => {
      return await apiRequest("POST", "/v1/estaciona-facil/precos/criar", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/v1/estaciona-facil/precos"],
      });
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
        description:
          error.message ||
          "Erro ao adicionar configuração de preço. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const editPriceConfigMutation = useMutation({
    mutationFn: async (variables: {
      id: string;
      data: PriceConfigFormData;
    }) => {
      const { id, data } = variables;

      const formattedData = {
        ...data,
        validFrom: new Date(data.validFrom).toISOString(),
        validTo: data.validTo
          ? new Date(data.validTo).toISOString()
          : undefined,
      };

      const url = `/v1/estaciona-facil/precos/${id}`;

      try {
        const response = await apiRequest("PATCH", url, formattedData);
        return response;
      } catch (error) {
        throw error;
      }
    },
  });

  const deletePriceConfigMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/v1/estaciona-facil/precos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/v1/estaciona-facil/precos"],
      });
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
        description:
          error.message ||
          "Erro ao excluir configuração de preço. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Handlers
  const handleAddPriceConfig = () => {
    setIsAddDialogOpen(true);
  };

  const handleEditPriceConfig = (priceConfig: PriceConfig) => {
    setSelectedPriceConfig(priceConfig);
    editForm.reset({
      validFrom: format(new Date(priceConfig.validFrom), "yyyy-MM-dd'T'HH:mm", {
        locale: ptBR,
      }),
      validTo: priceConfig.validTo
        ? format(new Date(priceConfig.validTo), "yyyy-MM-dd'T'HH:mm", {
            locale: ptBR,
          })
        : "",
      hour1Price: priceConfig.hour1Price,
      hour2Price: priceConfig.hour2Price,
      hour3Price: priceConfig.hour3Price,
      hour4Price: priceConfig.hour4Price,
      hour5Price: priceConfig.hour5Price,
      hour6Price: priceConfig.hour6Price,
      hour12Price: priceConfig.hour12Price,
    });
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setSelectedPriceConfig(null);
    editForm.reset();
  };

  const handleDeletePriceConfig = (priceConfig: PriceConfig) => {
    setSelectedPriceConfig(priceConfig);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeletePriceConfig = () => {
    if (selectedPriceConfig?.id) {
      deletePriceConfigMutation.mutate(selectedPriceConfig.id);
    }
  };

  const onAddSubmit = (data: PriceConfigFormData) => {
    addPriceConfigMutation.mutate(data);
  };

  const onEditSubmit = async (data: PriceConfigFormData) => {
    if (!selectedPriceConfig?.id) {
      toast({
        title: "Erro",
        description: "ID da configuração de preço não encontrado",
        variant: "destructive",
      });
      return;
    }

    try {
      const formattedData = {
        ...data,
        validFrom: data.validFrom,
        validTo: data.validTo || undefined,
      };

      const response = await apiRequest(
        "PATCH",
        `/v1/estaciona-facil/precos/${selectedPriceConfig.id}`,
        formattedData
      );

      queryClient.invalidateQueries({
        queryKey: ["/v1/estaciona-facil/precos"],
      });

      toast({
        title: "Configuração de preço atualizada",
        description: "Configuração de preço atualizada com sucesso.",
      });

      setIsEditDialogOpen(false);
      setSelectedPriceConfig(null);
      editForm.reset();
    } catch (error) {
      toast({
        title: "Erro",
        description:
          error instanceof Error
            ? error.message
            : "Erro ao atualizar configuração de preço. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Format dates for display
  const formatDate = (date: string) => {
    return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: ptBR });
  };

  if (!user || (user.role !== "MANAGER" && user.role !== "ADMIN")) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Acesso Negado</h2>
          <p className="text-gray-600 mb-4">
            Você não tem permissão para acessar esta página.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Helmet>
        <title>Gerenciar Preços - EstacionaFácil</title>
        <meta
          name="description"
          content="Gerencie os preços de estacionamento do sistema rotativo municipal."
        />
      </Helmet>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gerenciar Preços</h2>
        {!priceConfigs?.current && (
          <Button onClick={handleAddPriceConfig} variant="secondary">
            <i className="material-icons mr-2">add</i>
            Nova Configuração de Preço
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader className="p-4 border-b border-gray-200">
            <CardTitle className="text-lg">Configuração de Preços</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {isLoadingPrices ? (
              <LoadingSpinner size="sm" />
            ) : priceConfigs?.current ? (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">
                      Configuração Atual de Preços
                    </h3>
                    <p className="text-sm text-gray-600">
                      Válida desde: {formatDate(priceConfigs.current.validFrom)}
                      {priceConfigs.current.validTo &&
                        ` até ${formatDate(priceConfigs.current.validTo)}`}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() =>
                        handleEditPriceConfig(priceConfigs.current)
                      }
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
                <h3 className="font-semibold mb-2">
                  Nenhuma configuração de preço definida
                </h3>
                <p className="text-gray-600 mb-4">
                  Ainda não existe configuração de preços cadastrada.
                </p>
                <Button onClick={handleAddPriceConfig} variant="secondary">
                  Adicionar Configuração
                </Button>
              </div>
            )}

            {priceConfigs?.history && priceConfigs.history.length > 0 && (
              <div className="mt-8">
                <h3 className="font-semibold text-lg mb-4">
                  Histórico de Preços
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Período de Validade
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          1h
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          2h
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          3h
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          4h
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          5h
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          6h
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          12h
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {priceConfigs.history.map((config: PriceConfig) => (
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
            <form
              onSubmit={addForm.handleSubmit(onAddSubmit)}
              className="space-y-4"
            >
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
                    <p className="text-xs text-gray-500">
                      Se não informado, será válido indefinidamente.
                    </p>
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
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          {...field}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            if (!isNaN(value)) {
                              field.onChange(Number(value.toFixed(2)));
                            }
                          }}
                        />
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
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          {...field}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            if (!isNaN(value)) {
                              field.onChange(Number(value.toFixed(2)));
                            }
                          }}
                        />
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
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          {...field}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            if (!isNaN(value)) {
                              field.onChange(Number(value.toFixed(2)));
                            }
                          }}
                        />
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
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          {...field}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            if (!isNaN(value)) {
                              field.onChange(Number(value.toFixed(2)));
                            }
                          }}
                        />
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
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          {...field}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            if (!isNaN(value)) {
                              field.onChange(Number(value.toFixed(2)));
                            }
                          }}
                        />
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
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          {...field}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            if (!isNaN(value)) {
                              field.onChange(Number(value.toFixed(2)));
                            }
                          }}
                        />
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
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          {...field}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            if (!isNaN(value)) {
                              field.onChange(Number(value.toFixed(2)));
                            }
                          }}
                        />
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
                  variant="default"
                  disabled={addPriceConfigMutation.isPending}
                >
                  {addPriceConfigMutation.isPending
                    ? "Adicionando..."
                    : "Adicionar"}
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
            <form
              onSubmit={editForm.handleSubmit((data) => {
                onEditSubmit(data);
              })}
              className="space-y-4"
            >
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
                    <p className="text-xs text-gray-500">
                      Se não informado, será válido indefinidamente.
                    </p>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="hour1Price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor 1 hora (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          {...field}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            if (!isNaN(value)) {
                              field.onChange(Number(value.toFixed(2)));
                            }
                          }}
                        />
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
                      <FormLabel>Valor 2 horas (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          {...field}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            if (!isNaN(value)) {
                              field.onChange(Number(value.toFixed(2)));
                            }
                          }}
                        />
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
                      <FormLabel>Valor 3 horas (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          {...field}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            if (!isNaN(value)) {
                              field.onChange(Number(value.toFixed(2)));
                            }
                          }}
                        />
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
                      <FormLabel>Valor 4 horas (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          {...field}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            if (!isNaN(value)) {
                              field.onChange(Number(value.toFixed(2)));
                            }
                          }}
                        />
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
                      <FormLabel>Valor 5 horas (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          {...field}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            if (!isNaN(value)) {
                              field.onChange(Number(value.toFixed(2)));
                            }
                          }}
                        />
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
                      <FormLabel>Valor 6 horas (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          {...field}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            if (!isNaN(value)) {
                              field.onChange(Number(value.toFixed(2)));
                            }
                          }}
                        />
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
                      <FormLabel>Valor 12 horas (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          {...field}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            if (!isNaN(value)) {
                              field.onChange(Number(value.toFixed(2)));
                            }
                          }}
                        />
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
                  onClick={handleCloseEditDialog}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="default"
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
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Configuração de Preço</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta configuração de preço? Esta
              ação não pode ser desfeita e pode afetar as permissões de
              estacionamento existentes.
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
