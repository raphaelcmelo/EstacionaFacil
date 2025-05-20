import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";

interface Permissao {
  id: string;
  vehicleId: string;
  startTime: string;
  endTime: string;
  amount: number;
  paymentStatus: string;
}

export function PermissoesAtivas() {
  const {
    data: permissoes = [],
    isLoading,
    error,
  } = useQuery<Permissao[]>({
    queryKey: ["/permits/ativas"],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Permissões Ativas</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Permissões Ativas</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Erro ao carregar permissões. Por favor, tente novamente mais tarde.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Permissões Ativas</h1>

      {permissoes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">
            Você não possui permissões ativas no momento.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {permissoes.map((permissao) => (
            <Card
              key={permissao.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <CardTitle className="text-xl">
                  Placa: {permissao.vehicleId}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Compra:</span>{" "}
                    {format(
                      new Date(permissao.startTime),
                      "dd/MM/yyyy 'às' HH:mm",
                      {
                        locale: ptBR,
                      }
                    )}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Válido até:</span>{" "}
                    {format(
                      new Date(permissao.endTime),
                      "dd/MM/yyyy 'às' HH:mm",
                      {
                        locale: ptBR,
                      }
                    )}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Valor pago:</span>{" "}
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(permissao.amount)}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Status:</span>{" "}
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        permissao.paymentStatus === "COMPLETED"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {permissao.paymentStatus === "COMPLETED"
                        ? "Pago"
                        : "Pendente"}
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
