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
import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, AlertCircle } from "lucide-react";

// Form schema for adding/editing zones
const zoneFormSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
  active: z.boolean().default(true),
});

type ZoneFormData = z.infer<typeof zoneFormSchema>;

export default function AdminZones() {
  const { user } = useAuth();
  const { toast } = useToast();

  // States for dialogs
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<any>(null);

  // Get zones list
  const { data: zones, isLoading } = useQuery({
    queryKey: ["/api/admin/zones"],
    enabled: !!user && (user.role === "MANAGER" || user.role === "ADMIN"),
  });

  // Forms
  const addForm = useForm<ZoneFormData>({
    resolver: zodResolver(zoneFormSchema),
    defaultValues: {
      name: "",
      description: "",
      active: true,
    },
  });

  const editForm = useForm<ZoneFormData>({
    resolver: zodResolver(zoneFormSchema),
    defaultValues: {
      name: "",
      description: "",
      active: true,
    },
  });

  // Mutations
  const addZoneMutation = useMutation({
    mutationFn: async (data: ZoneFormData) => {
      return await apiRequest("POST", "/api/admin/zones", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/zones"] });
      toast({
        title: "Zona adicionada",
        description: "Zona adicionada com sucesso.",
      });
      setIsAddDialogOpen(false);
      addForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description:
          error.message || "Erro ao adicionar zona. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const editZoneMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ZoneFormData }) => {
      return await apiRequest("PUT", `/api/admin/zones/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/zones"] });
      toast({
        title: "Zona atualizada",
        description: "Zona atualizada com sucesso.",
      });
      setIsEditDialogOpen(false);
      editForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description:
          error.message || "Erro ao atualizar zona. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const toggleZoneActiveMutation = useMutation({
    mutationFn: async ({ id, active }: { id: number; active: boolean }) => {
      return await apiRequest("PUT", `/api/admin/zones/${id}`, { active });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/zones"] });
      toast({
        title: "Status alterado",
        description: "Status da zona alterado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description:
          error.message || "Erro ao alterar status da zona. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const deleteZoneMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/admin/zones/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/zones"] });
      toast({
        title: "Zona excluída",
        description: "Zona excluída com sucesso.",
      });
      setIsDeleteDialogOpen(false);
      setSelectedZone(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir zona. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Handlers
  const handleEditZone = (zone: any) => {
    editForm.reset({
      name: zone.name,
      description: zone.description || "",
      active: zone.active,
    });
    setSelectedZone(zone);
    setIsEditDialogOpen(true);
  };

  const handleDeleteZone = (zone: any) => {
    setSelectedZone(zone);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteZone = () => {
    if (selectedZone) {
      deleteZoneMutation.mutate(selectedZone.id);
    }
  };

  const toggleZoneActive = (zone: any) => {
    toggleZoneActiveMutation.mutate({
      id: zone.id,
      active: !zone.active,
    });
  };

  const onAddSubmit = (data: ZoneFormData) => {
    addZoneMutation.mutate(data);
  };

  const onEditSubmit = (data: ZoneFormData) => {
    if (selectedZone) {
      editZoneMutation.mutate({ id: selectedZone.id, data });
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

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
        <title>Gerenciar Zonas - EstacionaFácil</title>
        <meta
          name="description"
          content="Gerencie as zonas de estacionamento do sistema rotativo municipal."
        />
      </Helmet>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gerenciar Zonas</h2>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-secondary hover:bg-secondary-light text-white"
        >
          <i className="material-icons mr-2">add</i>
          Adicionar Zona
        </Button>
      </div>

      <Card>
        <CardHeader className="p-4 border-b border-gray-200">
          <CardTitle className="text-lg">Zonas de Estacionamento</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ocupação atual
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
                {zones?.length > 0 ? (
                  zones.map((zone: any) => (
                    <tr
                      key={zone.id}
                      className={!zone.active ? "bg-gray-50" : ""}
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <i className="material-icons text-primary">
                              location_on
                            </i>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {zone.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {zone.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900 max-w-md">
                          {zone.description || "Sem descrição"}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                          <div
                            className={`h-2.5 rounded-full ${
                              zone.occupancyRate > 80
                                ? "bg-red-500"
                                : zone.occupancyRate > 60
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                            style={{ width: `${zone.occupancyRate || 0}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 text-right">
                          {zone.occupancyRate || 0}% ocupada
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full flex items-center w-fit ${
                            zone.active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {zone.active ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Ativa
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Inativa
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditZone(zone)}
                            className="text-primary hover:text-primary-dark"
                          >
                            <i className="material-icons text-sm">edit</i>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleZoneActive(zone)}
                            className={
                              zone.active
                                ? "text-amber-600 hover:text-amber-700"
                                : "text-green-600 hover:text-green-700"
                            }
                          >
                            <i className="material-icons text-sm">
                              {zone.active ? "block" : "check_circle"}
                            </i>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteZone(zone)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <i className="material-icons text-sm">delete</i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-gray-500"
                    >
                      Nenhuma zona encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Zone Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Zona</DialogTitle>
            <DialogDescription>
              Preencha os dados da nova zona de estacionamento.
            </DialogDescription>
          </DialogHeader>

          <Form {...addForm}>
            <form
              onSubmit={addForm.handleSubmit(onAddSubmit)}
              className="space-y-4"
            >
              <FormField
                control={addForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Zona</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Centro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={addForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva os detalhes da zona"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={addForm.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                    </FormControl>
                    <FormLabel className="font-normal">Zona ativa</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                  disabled={addZoneMutation.isPending}
                >
                  {addZoneMutation.isPending ? "Adicionando..." : "Adicionar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Zone Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Zona</DialogTitle>
            <DialogDescription>
              Atualize os dados da zona de estacionamento.
            </DialogDescription>
          </DialogHeader>

          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(onEditSubmit)}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Zona</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Centro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva os detalhes da zona"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                    </FormControl>
                    <FormLabel className="font-normal">Zona ativa</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                  disabled={editZoneMutation.isPending}
                >
                  {editZoneMutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Zone Confirmation */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Zona</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a zona "{selectedZone?.name}"? Esta
              ação não pode ser desfeita e pode afetar as permissões de
              estacionamento existentes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteZone}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteZoneMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
