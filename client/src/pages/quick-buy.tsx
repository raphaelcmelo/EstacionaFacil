import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LicensePlateInput } from "@/components/ui/license-plate-input";
import { DurationOption } from "@/components/ui/duration-option";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";
import { formatMoney, formatDateTime } from "@/lib/utils";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { PaymentMethod } from "@shared/schema";

import { LoadingSpinner } from "@/components/ui/spinner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface Vehicle {
  id: string;
  placa: string;
  modelo: string;
}

interface PriceConfig {
  hour1Price: number;
  hour2Price: number;
  hour3Price: number;
  hour4Price: number;
  hour5Price: number;
  hour6Price: number;
  hour12Price: number;
}

// Form schema
const quickBuySchema = z.object({
  licensePlate: z
    .string()
    .min(7, "Placa deve ter no mínimo 7 caracteres")
    .max(8, "Placa deve ter no máximo 8 caracteres"),
  model: z.string().min(2, "Modelo deve ter pelo menos 2 caracteres"),
  durationHours: z.number().min(1).max(12),
  paymentMethod: z.enum([
    PaymentMethod.CREDIT_CARD,
    PaymentMethod.DEBIT_CARD,
    PaymentMethod.PIX,
    PaymentMethod.TESTE,
  ]),
});

type QuickBuyFormData = z.infer<typeof quickBuySchema>;

// Credit card form schema
const creditCardSchema = z.object({
  cardNumber: z
    .string()
    .min(16, "Número do cartão deve ter pelo menos 16 dígitos"),
  cardExpiry: z.string().min(5, "Data de validade inválida"),
  cardCvv: z.string().min(3, "CVV inválido"),
  cardName: z.string().min(3, "Nome no cartão é obrigatório"),
});

type CreditCardFormData = z.infer<typeof creditCardSchema>;

export default function QuickBuy() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, navigate] = useLocation();

  // State variables
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [selectedHourPrice, setSelectedHourPrice] = useState<string>("0.00");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [permitData, setPermitData] = useState<any>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [vehicleFromParams, setVehicleFromParams] = useState<Vehicle | null>(
    null
  );
  const [showReceipt, setShowReceipt] = useState(false);

  // Form for quick buy
  const quickBuyForm = useForm<QuickBuyFormData>({
    resolver: zodResolver(quickBuySchema),
    defaultValues: {
      licensePlate: "",
      model: "",
      durationHours: 0,
      paymentMethod: PaymentMethod.CREDIT_CARD,
    },
  });

  // Credit card form
  const creditCardForm = useForm<CreditCardFormData>({
    resolver: zodResolver(creditCardSchema),
    defaultValues: {
      cardNumber: "",
      cardExpiry: "",
      cardCvv: "",
      cardName: "",
    },
  });

  const selectedPaymentMethod = quickBuyForm.watch("paymentMethod");

  // Get user vehicles if logged in
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const {
    data: userVehicles,
    isLoading: isLoadingVehicles,
    refetch: refetchVehicles,
  } = useQuery<Vehicle[]>({
    queryKey: ["/v1/estaciona-facil/veiculo/listar"],
    enabled: !!user,
  });

  // Get current price config
  const { data: priceConfig, isLoading: isLoadingPrices } =
    useQuery<PriceConfig>({
      queryKey: ["/v1/estaciona-facil/precos"],
      queryFn: async () => {
        const response = await apiRequest("GET", "/v1/estaciona-facil/precos");
        return response.current;
      },
    });

  // Watch form fields for manual input
  const licensePlateValue = quickBuyForm.watch("licensePlate");
  const modelValue = quickBuyForm.watch("model");

  // Disable vehicle selection if manual input exists
  const isVehicleSelectionDisabled =
    licensePlateValue.length > 0 || modelValue.length > 0;

  // Função para capitalizar texto
  const capitalizeText = (text: string) => {
    return text.toUpperCase();
  };

  // Handle vehicle selection
  const handleVehicleSelection = (value: string) => {
    setSelectedVehicle(value);
    if (value === "new") {
      quickBuyForm.setValue("licensePlate", "");
      quickBuyForm.setValue("model", "");
    } else {
      const vehicle = userVehicles?.find((v) => v.id.toString() === value);
      if (vehicle) {
        quickBuyForm.setValue("licensePlate", vehicle.placa);
        quickBuyForm.setValue("model", vehicle.modelo);
        // Avança automaticamente para a etapa 2 quando um veículo é selecionado
        setCurrentStep(2);
      }
    }
  };

  // Update price when duration or zone changes
  useEffect(() => {
    if (priceConfig && selectedDuration) {
      switch (selectedDuration) {
        case 1:
          setSelectedHourPrice(priceConfig.hour1Price.toString());
          break;
        case 2:
          setSelectedHourPrice(priceConfig.hour2Price.toString());
          break;
        case 3:
          setSelectedHourPrice(priceConfig.hour3Price.toString());
          break;
        case 4:
          setSelectedHourPrice(priceConfig.hour4Price.toString());
          break;
        case 5:
          setSelectedHourPrice(priceConfig.hour5Price.toString());
          break;
        case 6:
          setSelectedHourPrice(priceConfig.hour6Price.toString());
          break;
        case 12:
          setSelectedHourPrice(priceConfig.hour12Price.toString());
          break;
        default:
          setSelectedHourPrice("0.00");
      }
      quickBuyForm.setValue("durationHours", selectedDuration);
    }
  }, [selectedDuration, priceConfig]);

  // Atualiza o useEffect para setar o vehicleFromParams
  useEffect(() => {
    if (!userVehicles) return;

    const params = new URLSearchParams(location.split("?")[1]);
    const idParam = params.get("veiculo");

    if (idParam) {
      const veiculoEncontrado = userVehicles.find((v) => v.id === idParam);
      if (veiculoEncontrado) {
        setSelectedVehicle(idParam);
        setVehicleFromParams(veiculoEncontrado);
        quickBuyForm.setValue("licensePlate", veiculoEncontrado.placa);
        quickBuyForm.setValue("model", veiculoEncontrado.modelo);
      } else {
        // Caso o ID do veículo não seja encontrado, redireciona para a página inicial ou define como "new"
        setSelectedVehicle("new");
        setVehicleFromParams(null);
        quickBuyForm.setValue("licensePlate", "");
        quickBuyForm.setValue("model", "");
      }
    } else {
      // Se não houver parâmetro e houver veículos, não seleciona nenhum por padrão
      if (userVehicles.length > 0) {
        setSelectedVehicle(null);
        setVehicleFromParams(null);
        quickBuyForm.setValue("licensePlate", "");
        quickBuyForm.setValue("model", "");
      } else {
        // Se não houver veículos, seleciona "new"
        setSelectedVehicle("new");
        setVehicleFromParams(null);
        quickBuyForm.setValue("licensePlate", "");
        quickBuyForm.setValue("model", "");
      }
    }
  }, [userVehicles, location, quickBuyForm]);

  // Purchase permit mutation
  const purchasePermitMutation = useMutation({
    mutationFn: async (data: QuickBuyFormData) => {
      const response = await apiRequest(
        "POST",
        "/v1/estaciona-facil/permits/quick-buy",
        data
      );
      return response;
    },
    onSuccess: (data) => {
      setPermitData(data);
      setShowReceipt(true);
      setIsSubmitting(false);
    },
    onError: (error: any) => {
      setIsSubmitting(false);
      toast({
        title: "Erro na compra",
        description:
          error.message ||
          "Ocorreu um erro ao processar sua compra. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = async (data: QuickBuyFormData) => {
    setIsSubmitting(true);

    // If credit card selected, validate card details
    if (data.paymentMethod === PaymentMethod.CREDIT_CARD) {
      const creditCardValid = await creditCardForm.trigger();
      if (!creditCardValid) {
        setIsSubmitting(false);
        return;
      }
    }

    purchasePermitMutation.mutate(data);
  };

  // Calculate end time
  const getEndTime = () => {
    if (!selectedDuration) return "";

    const now = new Date();
    const endTime = new Date(now.getTime() + selectedDuration * 60 * 60 * 1000);

    return formatDateTime(endTime);
  };

  const handleDownloadReceipt = () => {
    const receiptElement = document.getElementById("receipt-content");
    if (!receiptElement) return;

    const receiptData = {
      transactionCode: permitData.transactionCode,
      licensePlate: permitData.vehicleId,
      model: quickBuyForm.getValues("model"),
      startTime: permitData.startTime,
      endTime: permitData.endTime,
      zone: "Centro", // Valor padrão já que não temos essa informação
      amount: permitData.amount,
      durationHours: permitData.durationHours,
    };

    const blob = new Blob([JSON.stringify(receiptData, null, 2)], {
      type: "application/json",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `comprovante-${permitData.transactionCode}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (isLoadingPrices || (user && isLoadingVehicles)) {
    return <LoadingSpinner />;
  }

  if (showReceipt && permitData) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <i className="material-icons text-green-600 text-3xl">
                check_circle
              </i>
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              Permissão Adquirida!
            </h2>
            <p className="text-gray-600">
              Seu pagamento foi processado com sucesso.
            </p>
          </div>

          <div id="receipt-content" className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Código de Consulta:</span>
              <span className="font-semibold">
                {permitData.transactionCode}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Placa:</span>
              <span className="font-semibold">{permitData.vehicleId}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Validade:</span>
              <span className="font-semibold">
                {formatDateTime(permitData.startTime)} até{" "}
                {formatDateTime(permitData.endTime)}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Duração:</span>
              <span className="font-semibold">
                {permitData.durationHours}{" "}
                {permitData.durationHours === 1 ? "hora" : "horas"}
              </span>
            </div>
            <div className="flex justify-between text-lg border-t border-gray-300 pt-2 mt-2">
              <span className="font-semibold">Valor Pago:</span>
              <span className="text-secondary font-semibold">
                {formatMoney(permitData.amount)}
              </span>
            </div>
          </div>

          <div className="text-center mb-6">
            <p className="text-sm text-gray-600 mb-2">
              Guarde o código de consulta para verificar o status da sua
              permissão posteriormente.
            </p>
            <Button
              variant="outline"
              className="inline-flex items-center"
              onClick={handleDownloadReceipt}
            >
              <i className="material-icons mr-2 text-gray-600">download</i>
              Baixar Comprovante
            </Button>
          </div>

          <div className="flex justify-center">
            <Button
              className="bg-primary hover:bg-primary-light text-white"
              onClick={() => navigate("/")}
            >
              Concluir
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Helmet>
        <title>Comprar Permissão - EstacionaFácil</title>
        <meta
          name="description"
          content="Compre uma permissão de estacionamento de forma rápida e simples."
        />
      </Helmet>

      <Card className="max-w-2xl mx-auto">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-xl m-0">
            Compra Rápida de Permissão
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <i className="material-icons text-xl" style={{ lineHeight: 1 }}>
              close
            </i>
          </Button>
        </CardHeader>

        <CardContent className="p-6">
          <Form {...quickBuyForm}>
            <form onSubmit={quickBuyForm.handleSubmit(onSubmit)}>
              {/* Step 1: Vehicle Data */}
              <div className={currentStep === 1 ? "block" : "hidden"}>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mr-2">
                      1
                    </div>
                    <span className="font-semibold">Dados do Veículo</span>
                  </div>
                  {/* <Separator className="flex-grow ml-4" /> */}
                </div>

                {user ? (
                  <div className="mb-6">
                    <Label className="mb-2 block">Selecione um veículo</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {userVehicles && userVehicles.length > 0 ? (
                        <>
                          {userVehicles.map((vehicle) => (
                            <div
                              key={vehicle.id}
                              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                                selectedVehicle === vehicle.id.toString()
                                  ? "border-primary bg-primary/5"
                                  : "border-gray-300 hover:border-primary"
                              }`}
                              onClick={() =>
                                handleVehicleSelection(vehicle.id.toString())
                              }
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-semibold">
                                    {vehicle.placa}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {vehicle.modelo}
                                  </p>
                                </div>
                                {selectedVehicle === vehicle.id.toString() && (
                                  <i className="material-icons text-primary">
                                    check_circle
                                  </i>
                                )}
                              </div>
                            </div>
                          ))}
                          <div
                            className={`border rounded-lg p-4 cursor-pointer transition-all ${
                              selectedVehicle === "new"
                                ? "border-primary bg-primary/5"
                                : "border-gray-300 hover:border-primary"
                            }`}
                            onClick={() => handleVehicleSelection("new")}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold">Novo veículo</p>
                                <p className="text-sm text-gray-600">
                                  Adicionar um novo veículo
                                </p>
                              </div>
                              {selectedVehicle === "new" && (
                                <i className="material-icons text-primary">
                                  check_circle
                                </i>
                              )}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div
                          className="border rounded-lg p-4 cursor-pointer transition-all border-gray-300 hover:border-primary"
                          onClick={() => handleVehicleSelection("new")}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold">Novo veículo</p>
                              <p className="text-sm text-gray-600">
                                Adicionar um novo veículo
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <FormField
                        control={quickBuyForm.control}
                        name="licensePlate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Placa do Veículo</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="ABC1234 ou ABC1D23"
                                value={field.value}
                                onChange={field.onChange}
                                disabled={
                                  selectedVehicle !== null &&
                                  selectedVehicle !== "new"
                                }
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
                        control={quickBuyForm.control}
                        name="model"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Modelo do Veículo</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ex: POLO"
                                value={field.value}
                                onChange={(e) => {
                                  const capitalizedValue = capitalizeText(
                                    e.target.value
                                  );
                                  field.onChange(capitalizedValue);
                                }}
                                disabled={
                                  selectedVehicle !== null &&
                                  selectedVehicle !== "new"
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <FormField
                      control={quickBuyForm.control}
                      name="licensePlate"
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
                      control={quickBuyForm.control}
                      name="model"
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
                  </div>
                )}

                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-300 text-white flex items-center justify-center mr-2">
                      2
                    </div>
                    <span className="text-gray-500">Tempo Desejado</span>
                  </div>
                  {/* <Separator className="flex-grow ml-4" /> */}
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="default"
                    onClick={async () => {
                      if (selectedVehicle && selectedVehicle !== "new") {
                        setCurrentStep(2);
                        return;
                      }
                      const isValid = await quickBuyForm.trigger([
                        "licensePlate",
                        "model",
                      ]);
                      if (isValid) {
                        setCurrentStep(2);
                      }
                    }}
                  >
                    Próximo
                  </Button>
                </div>
              </div>

              {/* Step 2: Duration */}
              <div className={currentStep === 2 ? "block" : "hidden"}>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mr-2">
                      2
                    </div>
                    <span className="font-semibold">Tempo Desejado</span>
                  </div>
                  {/* <Separator className="flex-grow ml-4" /> */}
                </div>

                <div className="mb-6">
                  <Label className="block text-sm font-medium text-gray-700 mb-2">
                    Selecione a duração:
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                    {priceConfig && (
                      <>
                        <DurationOption
                          hours={1}
                          price={priceConfig.hour1Price}
                          selected={selectedDuration === 1}
                          onClick={() => setSelectedDuration(1)}
                        />
                        <DurationOption
                          hours={2}
                          price={priceConfig.hour2Price}
                          selected={selectedDuration === 2}
                          onClick={() => setSelectedDuration(2)}
                        />
                        <DurationOption
                          hours={3}
                          price={priceConfig.hour3Price}
                          selected={selectedDuration === 3}
                          onClick={() => setSelectedDuration(3)}
                        />
                        <DurationOption
                          hours={4}
                          price={priceConfig.hour4Price}
                          selected={selectedDuration === 4}
                          onClick={() => setSelectedDuration(4)}
                        />
                        <DurationOption
                          hours={5}
                          price={priceConfig.hour5Price}
                          selected={selectedDuration === 5}
                          onClick={() => setSelectedDuration(5)}
                        />
                        <DurationOption
                          hours={6}
                          price={priceConfig.hour6Price}
                          selected={selectedDuration === 6}
                          onClick={() => setSelectedDuration(6)}
                        />
                        <DurationOption
                          hours={12}
                          price={priceConfig.hour12Price}
                          selected={selectedDuration === 12}
                          onClick={() => setSelectedDuration(12)}
                        />
                      </>
                    )}
                  </div>
                  {quickBuyForm.formState.errors.durationHours && (
                    <p className="text-sm text-red-500 mt-1">
                      Selecione uma duração
                    </p>
                  )}
                </div>

                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-300 text-white flex items-center justify-center mr-2">
                      3
                    </div>
                    <span className="text-gray-500">Pagamento</span>
                  </div>
                  {/* <Separator className="flex-grow ml-4" /> */}
                </div>

                <div className="flex justify-between space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                  >
                    Voltar
                  </Button>
                  <Button
                    variant="default"
                    type="button"
                    onClick={() => {
                      if (selectedDuration) {
                        setCurrentStep(3);
                      } else {
                        quickBuyForm.setError("durationHours", {
                          type: "manual",
                          message: "Selecione uma duração",
                        });
                      }
                    }}
                  >
                    Próximo
                  </Button>
                </div>
              </div>

              {/* Step 3: Payment */}
              <div className={currentStep === 3 ? "block" : "hidden"}>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mr-2">
                      3
                    </div>
                    <span className="font-semibold">Pagamento</span>
                  </div>
                  {/* <Separator className="flex-grow ml-4" /> */}
                </div>

                <div className="mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Duração:</span>
                      <span className="font-semibold">
                        {selectedDuration}{" "}
                        {selectedDuration === 1 ? "hora" : "horas"}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Placa:</span>
                      <span className="font-semibold">
                        {quickBuyForm.getValues("licensePlate")}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Validade:</span>
                      <span className="font-semibold">
                        {formatDateTime(new Date())} até {getEndTime()}
                      </span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg border-t border-gray-300 pt-2 mt-2">
                      <span>Total:</span>
                      <span className="text-secondary">
                        {formatMoney(selectedHourPrice)}
                      </span>
                    </div>
                  </div>

                  <FormField
                    control={quickBuyForm.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel>Forma de pagamento:</FormLabel>
                        <FormControl>
                          <RadioGroup
                            value={field.value}
                            onValueChange={(value: any) =>
                              field.onChange(value)
                            }
                            className="space-y-2"
                          >
                            <div
                              className={`flex items-center bg-white border rounded-lg p-3 cursor-pointer transition-colors ${
                                field.value === PaymentMethod.CREDIT_CARD
                                  ? "border-primary"
                                  : "border-gray-300 hover:border-secondary"
                              }`}
                            >
                              <RadioGroupItem
                                value={PaymentMethod.CREDIT_CARD}
                                id="credit-card"
                                className="mr-3"
                              />
                              <Label
                                htmlFor="credit-card"
                                className="flex-grow cursor-pointer"
                              >
                                Cartão de Crédito
                              </Label>
                              <div className="flex space-x-1">
                                <span className="inline-block w-8 h-5 bg-blue-800 rounded"></span>
                                <span className="inline-block w-8 h-5 bg-yellow-500 rounded"></span>
                                <span className="inline-block w-8 h-5 bg-red-600 rounded"></span>
                              </div>
                            </div>
                            <div
                              className={`flex items-center bg-white border rounded-lg p-3 cursor-pointer transition-colors ${
                                field.value === PaymentMethod.PIX
                                  ? "border-primary"
                                  : "border-gray-300 hover:border-secondary"
                              }`}
                            >
                              <RadioGroupItem
                                value={PaymentMethod.PIX}
                                id="pix"
                                className="mr-3"
                              />
                              <Label
                                htmlFor="pix"
                                className="flex-grow cursor-pointer"
                              >
                                PIX
                              </Label>
                              <span className="inline-block w-8 h-5 bg-green-500 rounded flex items-center justify-center text-white text-xs font-bold">
                                PIX
                              </span>
                            </div>
                            <div
                              className={`flex items-center bg-white border rounded-lg p-3 cursor-pointer transition-colors ${
                                field.value === PaymentMethod.TESTE
                                  ? "border-primary"
                                  : "border-gray-300 hover:border-secondary"
                              }`}
                            >
                              <RadioGroupItem
                                value={PaymentMethod.TESTE}
                                id="teste"
                                className="mr-3"
                              />
                              <Label
                                htmlFor="teste"
                                className="flex-grow cursor-pointer"
                              >
                                Teste
                              </Label>
                              <span className="inline-block w-8 h-5 bg-yellow-500 rounded flex items-center justify-center text-white text-xs font-bold">
                                TESTE
                              </span>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {selectedPaymentMethod === PaymentMethod.CREDIT_CARD && (
                    <div className="border border-gray-300 rounded-lg p-4">
                      <Form {...creditCardForm}>
                        <div className="grid grid-cols-1 gap-4 mb-4">
                          <FormField
                            control={creditCardForm.control}
                            name="cardNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Número do Cartão</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="1234 5678 9012 3456"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={creditCardForm.control}
                              name="cardExpiry"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Validade</FormLabel>
                                  <FormControl>
                                    <Input placeholder="MM/AA" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={creditCardForm.control}
                              name="cardCvv"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>CVV</FormLabel>
                                  <FormControl>
                                    <Input placeholder="123" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={creditCardForm.control}
                            name="cardName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nome no Cartão</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="NOME COMO ESTÁ NO CARTÃO"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </Form>
                    </div>
                  )}

                  {selectedPaymentMethod === PaymentMethod.PIX && (
                    <div className="border border-gray-300 rounded-lg p-4 text-center">
                      <div className="mb-4">
                        <i className="material-icons text-5xl text-green-600 mb-2">
                          qr_code_2
                        </i>
                        <p className="text-gray-700 mb-2">
                          Utilize o QR Code ou código PIX abaixo para realizar o
                          pagamento
                        </p>
                        <div className="bg-gray-200 p-4 rounded text-xs font-mono break-all">
                          00020126360014BR.GOV.BCB.PIX0114+55279999999995204000053039865802BR5924PREFEITURA
                          MUNICIPAL DE XYZ6009SAO PAULO62070503***6304E2CA
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(2)}
                  >
                    Voltar
                  </Button>
                  <Button
                    type="submit"
                    variant="secondary"
                    disabled={isSubmitting || purchasePermitMutation.isPending}
                  >
                    {isSubmitting ? "Processando..." : "Confirmar e Pagar"}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}
