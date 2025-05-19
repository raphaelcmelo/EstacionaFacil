import { useAuth } from "@/context/auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LicensePlateInput } from "@/components/ui/license-plate-input";
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
import { useLocation } from "wouter";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

const vehicleSchema = z.object({
  placa: z
    .string()
    .transform((val) => val.toUpperCase().replace(/[^A-Z0-9]/g, ""))
    .refine(
      (val) =>
        /^[A-Z]{3}[0-9]{4}$/.test(val) || // Padrão antigo: ABC1234
        /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(val), // Padrão Mercosul: ABC1D23
      {
        message: "Placa inválida. Use o formato ABC-1234 ou ABC1D23.",
      }
    )
    .refine((val) => val.length === 7, {
      message:
        "Placa deve ter exatamente 7 caracteres (ex: ABC1234 ou ABC1D23).",
    }),
  modelo: z.string().min(2, "Modelo deve ter pelo menos 2 caracteres"),
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

type Vehicle = {
  id: string;
  userId: string;
  placa: string;
  modelo: string;
  createdAt: string;
  updatedAt: string;
};

export default function UserVehicles() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();

  // Get URL parameters
  const params = new URLSearchParams(location.split("?")[1]);
  const editId = params.get("edit");

  // States for dialogs
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(!!editId);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Get user vehicles
  const { data: vehicles = [], isLoading } = useQuery<Vehicle[]>({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const response = await apiRequest(
        "GET",
        `${baseUrl}/v1/estaciona-facil/veiculo/listar`
      );
      console.log("Dados dos veículos:", response); // Para debug
      return response;
    },
    enabled: !!user,
  });

  console.log("Veículos após processamento:", vehicles); // Para debug

  // Forms
  const addForm = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      placa: "",
      modelo: "",
    },
  });

  const editForm = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      placa: "",
      modelo: "",
    },
  });

  // Mutations
  const addVehicleMutation = useMutation({
    mutationFn: async (data: VehicleFormData) => {
      const payload = {
        ...data,
      };
      return await apiRequest(
        "POST",
        `${baseUrl}/v1/estaciona-facil/veiculo/criar`,
        payload
      );
    },
    onSuccess: () => {
      console.log("veiculo adicionado");
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      toast({
        title: "Veículo adicionado",
        description: "Veículo adicionado com sucesso.",
      });
      setIsAddDialogOpen(false);
      addForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description:
          error.message || "Erro ao adicionar veículo. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const editVehicleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: VehicleFormData }) => {
      return await apiRequest("PUT", `/api/vehicles/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast({
        title: "Veículo atualizado",
        description: "Veículo atualizado com sucesso.",
      });
      setIsEditDialogOpen(false);
      setLocation("/vehicles");
      editForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description:
          error.message || "Erro ao atualizar veículo. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const deleteVehicleMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/vehicles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast({
        title: "Veículo excluído",
        description: "Veículo excluído com sucesso.",
      });
      setIsDeleteDialogOpen(false);
      setSelectedVehicle(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description:
          error.message || "Erro ao excluir veículo. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Handle opening the edit dialog
  const handleEditVehicle = (vehicle: Vehicle) => {
    editForm.reset({
      placa: vehicle.placa,
      modelo: vehicle.modelo,
    });
    setSelectedVehicle(vehicle);
    setIsEditDialogOpen(true);
  };

  // Check if we need to preload edit form based on URL param
  if (editId && vehicles && !isEditDialogOpen) {
    const vehicleToEdit = vehicles.find((v) => v.id === editId);
    if (vehicleToEdit) {
      handleEditVehicle(vehicleToEdit);
    }
  }

  // Handlers
  const onAddSubmit = (data: VehicleFormData) => {
    addVehicleMutation.mutate(data);
  };

  const onEditSubmit = (data: VehicleFormData) => {
    if (selectedVehicle) {
      editVehicleMutation.mutate({ id: selectedVehicle.id, data });
    }
  };

  const handleDeleteVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteVehicle = () => {
    if (selectedVehicle) {
      deleteVehicleMutation.mutate(selectedVehicle.id);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Helmet>
        <title>Meus Veículos - EstacionaFácil</title>
        <meta
          name="description"
          content="Gerencie seus veículos cadastrados para facilitar a compra de permissões de estacionamento."
        />
      </Helmet>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Meus Veículos</h2>
        <Button onClick={() => setIsAddDialogOpen(true)} variant="secondary">
          <i className="material-icons mr-2">add</i>
          Adicionar Veículo
        </Button>
      </div>

      <Card>
        <CardHeader className="p-4 border-b border-gray-200">
          <CardTitle className="text-lg">Veículos Cadastrados</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.isArray(vehicles) && vehicles.length > 0 ? (
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
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-primary"
                        onClick={() => handleEditVehicle(vehicle)}
                      >
                        <i className="material-icons text-sm">edit</i>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-red-600"
                        onClick={() => handleDeleteVehicle(vehicle)}
                      >
                        <i className="material-icons text-sm">delete</i>
                      </Button>
                    </div>
                  </div>
                  <div className="text-gray-600">{vehicle.modelo}</div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-8">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <i className="material-icons text-gray-400 text-2xl">
                    directions_car
                  </i>
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  Nenhum veículo cadastrado
                </h3>
                <p className="text-gray-600 mb-4">
                  Adicione veículos para facilitar a compra de permissões.
                </p>
                <Button
                  onClick={() => setIsAddDialogOpen(true)}
                  variant="secondary"
                >
                  Adicionar Veículo
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Vehicle Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Veículo</DialogTitle>
            <DialogDescription>
              Preencha os dados do veículo para cadastrá-lo.
            </DialogDescription>
          </DialogHeader>

          <Form {...addForm}>
            <form
              onSubmit={addForm.handleSubmit(onAddSubmit)}
              className="space-y-4"
            >
              <FormField
                control={addForm.control}
                name="placa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Placa do Veículo</FormLabel>
                    <FormControl>
                      <LicensePlateInput
                        placeholder="ABC1234"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-gray-500 mt-1">
                      Formato: ABC1234 ou ABC1D23
                    </p>
                  </FormItem>
                )}
              />

              <FormField
                control={addForm.control}
                name="modelo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo do Veículo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Fiat Palio" {...field} />
                    </FormControl>
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
                  variant="default"
                  disabled={addVehicleMutation.isPending}
                >
                  {addVehicleMutation.isPending
                    ? "Adicionando..."
                    : "Adicionar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Vehicle Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) setLocation("/vehicles");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Veículo</DialogTitle>
            <DialogDescription>Atualize os dados do veículo.</DialogDescription>
          </DialogHeader>

          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(onEditSubmit)}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="placa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Placa do Veículo</FormLabel>
                    <FormControl>
                      <LicensePlateInput
                        placeholder="ABC1234"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-gray-500 mt-1">
                      Formato: ABC1234 ou ABC1D23
                    </p>
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="modelo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo do Veículo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Fiat Palio" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setLocation("/vehicles");
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary-light"
                  disabled={editVehicleMutation.isPending}
                >
                  {editVehicleMutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Vehicle Confirmation */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Veículo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este veículo? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteVehicle}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteVehicleMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
