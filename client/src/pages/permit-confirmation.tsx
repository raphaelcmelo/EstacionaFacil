import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { formatDateTime, formatMoney } from "@/lib/utils";
import { LoadingSpinner } from "@/components/ui/spinner";

export default function PermitConfirmation() {
  const [location] = useLocation();
  const [permitId, setPermitId] = useState<string | null>(null);
  const [confirmationData, setConfirmationData] = useState<any>(null);

  // Extract permit ID from query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1]);
    const id = params.get("id");
    if (id) {
      setPermitId(id);
    }
  }, [location]);

  // Mock function to download receipt
  const handleDownloadReceipt = () => {
    const receiptData = {
      transactionCode: confirmationData?.transactionCode || "EF2023091501",
      licensePlate: confirmationData?.vehicle?.licensePlate || "ABC1234",
      model: confirmationData?.vehicle?.model || "Fiat Palio",
      startTime: confirmationData?.startTime,
      endTime: confirmationData?.endTime,
      zone: confirmationData?.zone?.name || "Centro",
      amount: confirmationData?.amount,
      durationHours: confirmationData?.durationHours,
    };

    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(receiptData, null, 2)], {
      type: "application/json",
    });
    element.href = URL.createObjectURL(file);
    element.download = `comprovante-${receiptData.transactionCode}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  useEffect(() => {
    // This is a workaround since we're not implementing the actual API endpoint
    // In a real scenario, we would fetch the permit data from the API

    const fetchData = async () => {
      try {
        // This would be the proper approach if we had a direct endpoint:
        // const response = await apiRequest("GET", `/v1/estaciona-facil/permits/${permitId}`);
        // const data = await response.json();

        // For now, we'll use mock data or the data stored in sessionStorage
        const storedData = sessionStorage.getItem("permitConfirmation");
        if (storedData) {
          setConfirmationData(JSON.parse(storedData));
        } else {
          // Mock data as fallback
          setConfirmationData({
            id: permitId || "1",
            transactionCode:
              "EF" +
              new Date().toISOString().substring(0, 10).replace(/-/g, "") +
              Math.floor(Math.random() * 1000),
            vehicle: {
              licensePlate: "ABC1234",
              model: "Fiat Palio",
            },
            startTime: new Date().toISOString(),
            endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
            zone: {
              name: "Centro",
            },
            amount: "5.00",
            durationHours: 2,
            paymentStatus: "COMPLETED",
          });
        }
      } catch (error) {
        console.error("Error fetching permit data:", error);
      }
    };

    if (permitId) {
      fetchData();
    }
  }, [permitId]);

  if (!confirmationData) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Helmet>
        <title>Confirmação de Permissão - EstacionaFácil</title>
        <meta
          name="description"
          content="Confirmação de compra de permissão de estacionamento."
        />
      </Helmet>

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

          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Código de Consulta:</span>
              <span className="font-semibold">
                {confirmationData.transactionCode}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Placa:</span>
              <span className="font-semibold">
                {confirmationData.vehicle.licensePlate}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Validade:</span>
              <span className="font-semibold">
                {formatDateTime(confirmationData.startTime)} até{" "}
                {formatDateTime(confirmationData.endTime)}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Zona:</span>
              <span className="font-semibold">
                {confirmationData.zone.name}
              </span>
            </div>
            <div className="flex justify-between text-lg border-t border-gray-300 pt-2 mt-2">
              <span className="font-semibold">Valor Pago:</span>
              <span className="text-secondary font-semibold">
                {formatMoney(confirmationData.amount)}
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
            <Link href="/">
              <Button className="bg-primary hover:bg-primary-light text-white">
                Concluir
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
