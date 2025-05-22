import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LicensePlateInput } from "@/components/ui/license-plate-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
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

// Form schema
const checkPermitSchema = z.object({
  licensePlate: z
    .string()
    .min(7, "Placa deve ter no mínimo 7 caracteres")
    .max(8, "Placa deve ter no máximo 8 caracteres"),
});

type CheckPermitFormData = z.infer<typeof checkPermitSchema>;

export default function CheckPermit() {
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permitData, setPermitData] = useState<any>(null);
  const [permitFound, setPermitFound] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState("");

  const form = useForm<CheckPermitFormData>({
    resolver: zodResolver(checkPermitSchema),
    defaultValues: {
      licensePlate: "",
    },
  });

  // Update time remaining every second
  useEffect(() => {
    if (!permitData) return;

    const updateTimeRemaining = () => {
      setTimeRemaining(formatTimeRemaining(permitData.permit.endTime));
    };

    updateTimeRemaining();
    const intervalId = setInterval(updateTimeRemaining, 1000);

    return () => clearInterval(intervalId);
  }, [permitData]);

  const onSubmit = async (data: CheckPermitFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      setPermitData(null);
      setPermitFound(false);

      const response = await apiRequest("POST", "/api/permits/check", data);
      const result = await response.json();

      if (result.found) {
        setPermitData(result);
        setPermitFound(true);
      } else {
        setPermitFound(false);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao verificar permissão. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Consultar Tempo - EstacionaFácil</title>
        <meta
          name="description"
          content="Verifique o tempo restante da sua permissão de estacionamento."
        />
      </Helmet>

      <Card className="max-w-md mx-auto">
        <CardHeader className="p-6 flex justify-between items-center">
          <CardTitle className="text-xl">Consultar Tempo Restante</CardTitle>
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <i className="material-icons">close</i>
          </Button>
        </CardHeader>

        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mb-6">
              <FormField
                control={form.control}
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
                    <p className="text-xs text-gray-500 mt-1">
                      Formato: ABC1234 ou ABC1D23
                    </p>
                  </FormItem>
                )}
              />

              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary-light text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Consultando..." : "Consultar"}
                </Button>
              </div>
            </form>

            {permitData && permitFound && (
              <div className="py-4">
                <div className="bg-green-100 p-4 rounded-lg mb-4 text-center">
                  <i className="material-icons text-green-600 text-3xl mb-2">
                    check_circle
                  </i>
                  <h3 className="font-semibold text-lg mb-1">
                    Permissão Ativa
                  </h3>
                  <div className="flex justify-center items-center">
                    <span className="font-semibold text-2xl">
                      {timeRemaining}
                    </span>
                    <span className="text-gray-600 ml-2">restantes</span>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Placa:</span>
                    <span className="font-semibold">
                      {permitData.permit.vehicle.licensePlate}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Início:</span>
                    <span className="font-semibold">
                      {formatDateTime(permitData.permit.startTime)}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Término:</span>
                    <span className="font-semibold">
                      {formatDateTime(permitData.permit.endTime)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Link href="/quick-buy">
                    <Button className="bg-secondary hover:bg-secondary-light text-white">
                      Estender Tempo
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {!permitFound && form.formState.isSubmitSuccessful && (
              <div className="py-4 text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <i className="material-icons text-red-600 text-3xl">error</i>
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  Nenhuma permissão encontrada
                </h3>
                <p className="text-gray-600 mb-4">
                  Não há permissão ativa para a placa informada.
                </p>
                <Link href="/quick-buy">
                  <Button className="bg-secondary hover:bg-secondary-light text-white">
                    Comprar Permissão
                  </Button>
                </Link>
              </div>
            )}
          </Form>
        </CardContent>
      </Card>
    </>
  );
}
