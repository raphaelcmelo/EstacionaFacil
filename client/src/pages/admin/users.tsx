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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import {
  CheckCircle,
  AlertCircle,
  User,
  Shield,
  Award,
  UserCog,
} from "lucide-react";
import { UserRole } from "@shared/schema";

// Form schema for adding/editing users
const userFormSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  cpf: z.string().optional(),
  phone: z.string().optional(),
  role: z.enum(["CITIZEN", "FISCAL", "MANAGER", "ADMIN"] as const),
  fiscalCode: z.string().optional(),
  managerDept: z.string().optional(),
  password: z.string().min(1, "Senha é obrigatória").optional(),
});

type UserFormData = z.infer<typeof userFormSchema>;

export default function AdminUsers() {
  const { user } = useAuth();
  const { toast } = useToast();

  // States for dialogs
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  // Get users list
  const { data: users, isLoading } = useQuery({
    queryKey: ["/v1/gestor-usuarios/users"],
    queryFn: async () => {
      return await apiRequest("GET", `${baseUrl}/v1/gestor-usuarios/users`);
    },
    enabled: !!user && user.role === "ADMIN",
  });

  // Forms
  const addForm = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      cpf: "",
      phone: "",
      role: "CITIZEN",
      fiscalCode: "",
      managerDept: "",
      password: "",
    },
  });

  const editForm = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema.partial({ password: true })),
    defaultValues: {
      name: "",
      email: "",
      cpf: "",
      phone: "",
      role: "CITIZEN",
      fiscalCode: "",
      managerDept: "",
      password: "",
    },
  });

  // Mutations
  const addUserMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      return await apiRequest("POST", "/api/admin/users", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Usuário adicionado",
        description: "Usuário adicionado com sucesso.",
      });
      setIsAddDialogOpen(false);
      addForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description:
          error.message || "Erro ao adicionar usuário. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const editUserMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<UserFormData>;
    }) => {
      return await apiRequest("PUT", `/api/admin/users/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Usuário atualizado",
        description: "Usuário atualizado com sucesso.",
      });
      setIsEditDialogOpen(false);
      editForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description:
          error.message || "Erro ao atualizar usuário. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const toggleUserActiveMutation = useMutation({
    mutationFn: async ({ id, active }: { id: number; active: boolean }) => {
      return await apiRequest("PUT", `/api/admin/users/${id}`, { active });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Status alterado",
        description: "Status do usuário alterado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description:
          error.message ||
          "Erro ao alterar status do usuário. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/admin/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Usuário excluído",
        description: "Usuário excluído com sucesso.",
      });
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description:
          error.message || "Erro ao excluir usuário. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Handlers
  const handleEditUser = (user: any) => {
    editForm.reset({
      name: user.name,
      email: user.email,
      cpf: user.cpf || "",
      phone: user.phone || "",
      role: user.role,
      fiscalCode: user.fiscalCode || "",
      managerDept: user.managerDept || "",
    });
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleDeleteUser = (user: any) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteUser = () => {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser.id);
    }
  };

  const toggleUserActive = (user: any) => {
    toggleUserActiveMutation.mutate({
      id: user.id,
      active: !user.active,
    });
  };

  const onAddSubmit = (data: UserFormData) => {
    addUserMutation.mutate(data);
  };

  const onEditSubmit = (data: UserFormData) => {
    if (selectedUser) {
      // Only include the fields that have changed
      const changedData: Partial<UserFormData> = {};

      Object.keys(data).forEach((key) => {
        const typedKey = key as keyof UserFormData;
        if (data[typedKey] !== selectedUser[typedKey]) {
          if (typedKey === "role") {
            changedData[typedKey] = data[typedKey] as UserRole;
          } else {
            changedData[typedKey] = data[typedKey];
          }
        }
      });

      // Only send password if it's provided
      if (data.password === "") {
        delete changedData.password;
      }

      editUserMutation.mutate({ id: selectedUser.id, data: changedData });
    }
  };

  // Helper to get the role badge
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Badge className="bg-purple-600">Administrador</Badge>;
      case "MANAGER":
        return <Badge className="bg-blue-600">Gerente</Badge>;
      case "FISCAL":
        return <Badge className="bg-green-600">Fiscal</Badge>;
      default:
        return <Badge className="bg-gray-600">Cidadão</Badge>;
    }
  };

  // Helper to get the role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Shield className="h-5 w-5 text-purple-600" />;
      case "MANAGER":
        return <Award className="h-5 w-5 text-blue-600" />;
      case "FISCAL":
        return <UserCog className="h-5 w-5 text-green-600" />;
      default:
        return <User className="h-5 w-5 text-gray-600" />;
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user || user.role !== "ADMIN") {
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
        <title>Gerenciar Usuários - EstacionaFácil</title>
        <meta
          name="description"
          content="Gerencie os usuários do sistema, incluindo cidadãos, fiscais, gerentes e administradores."
        />
      </Helmet>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gerenciar Usuários</h2>
        <Button onClick={() => setIsAddDialogOpen(true)} variant="secondary">
          <i className="material-icons mr-2">add</i>
          Adicionar Usuário
        </Button>
      </div>

      <Card>
        <CardHeader className="p-4 border-b border-gray-200 flex justify-between items-center">
          <CardTitle className="text-lg">Usuários do Sistema</CardTitle>
          <div className="flex items-center space-x-2">
            <Input placeholder="Buscar usuário..." className="w-64" />
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="CITIZEN">Cidadãos</SelectItem>
                <SelectItem value="FISCAL">Fiscais</SelectItem>
                <SelectItem value="MANAGER">Gerentes</SelectItem>
                <SelectItem value="ADMIN">Administradores</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
                    E-mail
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users?.length > 0 ? (
                  users.map((user: any) => (
                    <tr key={user.id} className="bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                            {getRoleIcon(user.role)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.cpf || "CPF não informado"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {user.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.phone || "Telefone não informado"}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {getRoleBadge(user.role)}
                      </td>
                      {/* <td className="px-4 py-4 whitespace-nowrap">
                        {user.role === "FISCAL" && (
                          <div className="text-sm text-gray-900">
                            Código: {user.fiscalCode || "N/A"}
                          </div>
                        )}
                        {user.role === "MANAGER" && (
                          <div className="text-sm text-gray-900">
                            Depto: {user.managerDept || "N/A"}
                          </div>
                        )}
                      </td> */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditUser(user)}
                                  className="text-primary hover:text-primary-dark"
                                >
                                  <i className="material-icons text-sm">edit</i>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Editar Usuário</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleUserActive(user)}
                                  className={
                                    user.active
                                      ? "text-amber-600 hover:text-amber-700"
                                      : "text-green-600 hover:text-green-700"
                                  }
                                >
                                  <i className="material-icons text-sm">
                                    {user.active ? "block" : "check_circle"}
                                  </i>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  {user.active
                                    ? "Desativar Usuário"
                                    : "Ativar Usuário"}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          {user.id !== user.id && ( // Don't allow deleting yourself - This condition seems to always be false, should be current user's ID
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteUser(user)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <i className="material-icons text-sm">
                                      delete
                                    </i>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Excluir Usuário</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-6 text-center text-gray-500"
                    >
                      Nenhum usuário encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Usuário</DialogTitle>
            <DialogDescription>
              Preencha os dados do novo usuário.
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
                    <FormLabel>Nome completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do usuário" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={addForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input placeholder="email@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addForm.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="123.456.789-00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="(99) 99999-9999" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={addForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Usuário</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={(value: UserRole) => {
                          field.onChange(value);
                          // Reset specific fields when role changes
                          if (value !== "FISCAL")
                            addForm.setValue("fiscalCode", "");
                          if (value !== "MANAGER")
                            addForm.setValue("managerDept", "");
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CITIZEN">Cidadão</SelectItem>
                          <SelectItem value="FISCAL">Fiscal</SelectItem>
                          <SelectItem value="MANAGER">Gerente</SelectItem>
                          <SelectItem value="ADMIN">Administrador</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {addForm.watch("role") === "FISCAL" && (
                <FormField
                  control={addForm.control}
                  name="fiscalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código do Fiscal</FormLabel>
                      <FormControl>
                        <Input placeholder="F-12345" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {addForm.watch("role") === "MANAGER" && (
                <FormField
                  control={addForm.control}
                  name="managerDept"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departamento</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Operações" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={addForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Digite a senha"
                        {...field}
                      />
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
                  className="bg-primary hover:bg-primary-light"
                  disabled={addUserMutation.isPending}
                >
                  {addUserMutation.isPending ? "Adicionando..." : "Adicionar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>Atualize os dados do usuário.</DialogDescription>
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
                    <FormLabel>Nome completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do usuário" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input placeholder="email@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="123.456.789-00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="(99) 99999-9999" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Usuário</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={(value: UserRole) => {
                          field.onChange(value);
                          // Reset specific fields when role changes
                          if (value !== "FISCAL")
                            editForm.setValue("fiscalCode", "");
                          if (value !== "MANAGER")
                            editForm.setValue("managerDept", "");
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CITIZEN">Cidadão</SelectItem>
                          <SelectItem value="FISCAL">Fiscal</SelectItem>
                          <SelectItem value="MANAGER">Gerente</SelectItem>
                          <SelectItem value="ADMIN">Administrador</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {editForm.watch("role") === "FISCAL" && (
                <FormField
                  control={editForm.control}
                  name="fiscalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código do Fiscal</FormLabel>
                      <FormControl>
                        <Input placeholder="F-12345" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {editForm.watch("role") === "MANAGER" && (
                <FormField
                  control={editForm.control}
                  name="managerDept"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departamento</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Operações" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={editForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nova Senha (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Deixe em branco para manter a atual"
                        {...field}
                      />
                    </FormControl>
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
                  disabled={editUserMutation.isPending}
                >
                  {editUserMutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o usuário {selectedUser?.name}?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteUserMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
