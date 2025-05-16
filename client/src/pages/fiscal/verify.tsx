import { useState } from "react";
import { useAuth } from "@/context/auth";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LicensePlateInput } from "@/components/ui/license-plate-input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";
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
import { apiRequest } from "@/lib/queryClient";
import { formatDateTime, formatTimeRemaining } from "@/lib/utils";
import { useEffect } from "react";
import { InfringementType } from "@shared/schema";
import { useLocation } from "wouter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Form schema for verification
const verifySchema = z.object({
  licensePlate: z
    .string()
    .min(7, "Placa deve ter no mínimo 7 caracteres")
    .max(8, "Placa deve ter no máximo 8 caracteres"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

// Form schema for infringement
const infringementSchema = z.object({
  licensePlate: z
    .string()
    .min(7, "Placa deve ter no mínimo 7 caracteres")
    .max(8, "Placa deve ter no máximo 8 caracteres"),
  infringementType: z.nativeEnum(InfringementType),
  notes: z.string().optional(),
  evidencePhotos: z.array(z.string()).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

type VerifyFormData = z.infer<typeof verifySchema>;
type InfringementFormData = z.infer<typeof infringementSchema>;

export default function FiscalVerify() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, navigate] = useLocation();

  // State variables
  const [isLoading, setIsLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [showVerificationResult, setShowVerificationResult] = useState(false);
  const [showInfringementForm, setShowInfringementForm] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [locationCoords, setLocationCoords] = useState<{
    latitude?: number;
    longitude?: number;
  }>({});

  // Forms
  const verifyForm = useForm<VerifyFormData>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      licensePlate: "",
      latitude: undefined,
      longitude: undefined,
    },
  });

  const infringementForm = useForm<InfringementFormData>({
    resolver: zodResolver(infringementSchema),
    defaultValues: {
      licensePlate: "",
      infringementType: InfringementType.NO_PERMIT,
      notes: "",
      evidencePhotos: [],
      latitude: undefined,
      longitude: undefined,
    },
  });

  // Try to get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setLocationCoords(coords);
          verifyForm.setValue("latitude", coords.latitude);
          verifyForm.setValue("longitude", coords.longitude);
          infringementForm.setValue("latitude", coords.latitude);
          infringementForm.setValue("longitude", coords.longitude);
        },
        (error) => {
          console.log("Error getting location:", error);
        }
      );
    }
  }, []);

  // Update time remaining every second
  useEffect(() => {
    if (!verificationResult || verificationResult.status !== "VALID") return;

    const updateTimeRemaining = () => {
      setTimeRemaining(formatTimeRemaining(verificationResult.permit.endTime));
    };

    updateTimeRemaining();
    const intervalId = setInterval(updateTimeRemaining, 1000);

    return () => clearInterval(intervalId);
  }, [verificationResult]);

  // Mutations
  const verifyMutation = useMutation({
    mutationFn: async (data: VerifyFormData) => {
      const response = await apiRequest("POST", "/api/fiscal/verify", data);
      return await response.json();
    },
    onSuccess: (data) => {
      setVerificationResult(data);
      setShowVerificationResult(true);

      // If no permit found, prepare infringement form
      if (data.status === "NOT_FOUND") {
        infringementForm.setValue(
          "licensePlate",
          verifyForm.getValues("licensePlate")
        );
        setShowInfringementForm(true);
      } else {
        setShowInfringementForm(false);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erro na verificação",
        description:
          error.message ||
          "Ocorreu um erro ao verificar a permissão. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const infringementMutation = useMutation({
    mutationFn: async (data: InfringementFormData) => {
      const response = await apiRequest(
        "POST",
        "/api/fiscal/infringement",
        data
      );
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Infração registrada",
        description: "A infração foi registrada com sucesso.",
      });
      setShowInfringementForm(false);
      navigate("/fiscal");
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao registrar infração",
        description:
          error.message ||
          "Ocorreu um erro ao registrar a infração. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Handlers
  const onSubmitVerify = (data: VerifyFormData) => {
    setIsLoading(true);
    verifyMutation.mutate({
      ...data,
      ...locationCoords,
    });
    setIsLoading(false);
  };

  const onSubmitInfringement = (data: InfringementFormData) => {
    setIsLoading(true);
    infringementMutation.mutate({
      ...data,
      ...locationCoords,
    });
    setIsLoading(false);
  };

  const resetForms = () => {
    verifyForm.reset();
    infringementForm.reset();
    setShowVerificationResult(false);
    setShowInfringementForm(false);
    setVerificationResult(null);
  };

  return (
    <>
      <Helmet>
        <title>Verificar Veículo - EstacionaFácil</title>
        <meta
          name="description"
          content="Verifique o status de permissão de um veículo como fiscal do sistema."
        />
      </Helmet>

      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Verificação de Veículo</h2>
        <div className="bg-blue-50 border-l-4 border-primary p-4 rounded-r-lg mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="material-icons text-primary">info</i>
            </div>
            <div className="ml-3">
              <p className="text-sm text-primary-dark">
                Fiscal: <span className="font-semibold">{user?.name}</span> •
                Código:{" "}
                <span className="font-semibold">
                  {user?.fiscalCode || "F-12345"}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="p-6">
          <CardTitle className="text-lg">Verificar Veículo</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {!showVerificationResult && (
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <Button
                  className="flex-1 py-3 bg-primary text-white rounded-lg flex items-center justify-center"
                  onClick={() => {
                    // Mock camera functionality - in a real app this would use the device camera
                    toast({
                      title: "Funcionalidade da câmera",
                      description:
                        "Esta funcionalidade usaria a câmera do dispositivo em um aplicativo real.",
                    });
                  }}
                >
                  <i className="material-icons mr-2">camera_alt</i>
                  Escanear Placa
                </Button>
                <Button
                  className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-lg flex items-center justify-center"
                  variant="secondary"
                >
                  <i className="material-icons mr-2">edit</i>
                  Inserir Manualmente
                </Button>
              </div>

              <Form {...verifyForm}>
                <form onSubmit={verifyForm.handleSubmit(onSubmitVerify)}>
                  <FormField
                    control={verifyForm.control}
                    name="licensePlate"
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel>Placa do Veículo</FormLabel>
                        <FormControl>
                          <LicensePlateInput
                            placeholder="ABC1234"
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full py-3 bg-secondary hover:bg-secondary-light text-white rounded-lg transition-colors flex items-center justify-center"
                    disabled={isLoading || verifyMutation.isPending}
                  >
                    <i className="material-icons mr-2">search</i>
                    {isLoading || verifyMutation.isPending
                      ? "Verificando..."
                      : "Verificar"}
                  </Button>
                </form>
              </Form>
            </div>
          )}

          {/* Verification result */}
          {showVerificationResult &&
            verificationResult &&
            verificationResult.status === "VALID" && (
              <div className="border-t border-gray-200 pt-6">
                <div className="bg-green-100 p-4 rounded-lg mb-4">
                  <div className="flex items-center">
                    <i className="material-icons text-green-600 mr-2">
                      check_circle
                    </i>
                    <div>
                      <h4 className="font-semibold">Permissão Válida</h4>
                      <p className="text-sm text-green-800">
                        Veículo com permissão ativa
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-sm text-gray-600">Placa:</div>
                      <div className="font-semibold">
                        {verificationResult.permit.vehicle.licensePlate}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Modelo:</div>
                      <div className="font-semibold">
                        {verificationResult.permit.vehicle.model}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Início:</div>
                      <div className="font-semibold">
                        {formatDateTime(verificationResult.permit.startTime)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Término:</div>
                      <div className="font-semibold">
                        {formatDateTime(verificationResult.permit.endTime)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">
                        Tempo Restante:
                      </div>
                      <div className="font-semibold text-primary">
                        {timeRemaining}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Zona:</div>
                      <div className="font-semibold">
                        {verificationResult.permit.zone.name}
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full py-3 bg-primary hover:bg-primary-light text-white rounded-lg transition-colors flex items-center justify-center"
                  onClick={resetForms}
                >
                  <i className="material-icons mr-2">refresh</i>
                  Nova Verificação
                </Button>
              </div>
            )}

          {/* Infringement form */}
          {showInfringementForm && (
            <div className="border-t border-gray-200 pt-6">
              <div className="bg-red-100 p-4 rounded-lg mb-4">
                <div className="flex items-center">
                  <i className="material-icons text-red-600 mr-2">error</i>
                  <div>
                    <h4 className="font-semibold">Permissão Inválida</h4>
                    <p className="text-sm text-red-800">
                      Veículo sem permissão ativa
                    </p>
                  </div>
                </div>
              </div>

              <Form {...infringementForm}>
                <form
                  onSubmit={infringementForm.handleSubmit(onSubmitInfringement)}
                >
                  <FormField
                    control={infringementForm.control}
                    name="infringementType"
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel>Tipo de Infração</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecione o tipo de infração" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={InfringementType.NO_PERMIT}>
                                Sem Permissão
                              </SelectItem>
                              <SelectItem
                                value={InfringementType.EXPIRED_PERMIT}
                              >
                                Permissão Expirada
                              </SelectItem>
                              <SelectItem value={InfringementType.INVALID_ZONE}>
                                Zona Inválida
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={infringementForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel>Observações</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Adicione observações sobre a infração"
                            className="resize-none"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="mb-4">
                    <FormLabel className="block text-sm font-medium text-gray-700 mb-1">
                      Evidências Fotográficas
                    </FormLabel>
                    <div className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg">
                      <div className="text-center">
                        <i className="material-icons text-gray-400 text-3xl mb-2">
                          add_a_photo
                        </i>
                        <p className="text-sm text-gray-500">
                          Clique para adicionar fotos
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-lg transition-colors"
                      onClick={resetForms}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      disabled={isLoading || infringementMutation.isPending}
                    >
                      {isLoading || infringementMutation.isPending
                        ? "Registrando..."
                        : "Registrar Infração"}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
