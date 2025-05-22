import { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";
import { createWorker } from "tesseract.js";
import { Button } from "./button";
import { Alert, AlertDescription } from "./alert";
import { AlertCircle, Camera } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface PlateScannerProps {
  onPlateDetected: (plate: string) => void;
  onError: (error: string) => void;
}

export function PlateScanner({ onPlateDetected, onError }: PlateScannerProps) {
  const webcamRef = useRef<Webcam>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const capture = useCallback(async () => {
    if (!webcamRef.current) return;

    try {
      setIsCapturing(true);
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        throw new Error("Não foi possível capturar a imagem");
      }

      setIsProcessing(true);
      const worker = await createWorker("por");
      await worker.loadLanguage("por");
      await worker.initialize("por");

      const {
        data: { text },
      } = await worker.recognize(imageSrc);
      await worker.terminate();

      // Limpa o texto extraído para manter apenas caracteres alfanuméricos
      const cleanedText = text.replace(/[^A-Z0-9]/gi, "").toUpperCase();

      // Verifica se o texto extraído parece uma placa válida
      const plateRegex = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$|^[A-Z]{3}[0-9]{4}$/;
      if (!plateRegex.test(cleanedText)) {
        throw new Error(
          "Não foi possível identificar uma placa válida na imagem"
        );
      }

      // Faz a requisição para verificar a permissão
      const response = await apiRequest(
        "POST",
        "/v1/estaciona-facil/permissao/check",
        {
          placa: cleanedText,
          checkTime: new Date().toISOString(),
        }
      );

      const result = await response.json();
      onPlateDetected(cleanedText);
    } catch (error: any) {
      onError(error.message || "Erro ao processar a imagem");
    } finally {
      setIsCapturing(false);
      setIsProcessing(false);
    }
  }, [onPlateDetected, onError]);

  return (
    <div className="relative">
      <div className="relative w-full max-w-md mx-auto">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            facingMode: "environment",
            width: 1280,
            height: 720,
          }}
          className="w-full rounded-lg"
        />
        <div className="absolute inset-0 border-2 border-dashed border-primary rounded-lg pointer-events-none" />
      </div>

      <div className="mt-4 flex justify-center">
        <Button
          onClick={capture}
          disabled={isCapturing || isProcessing}
          className="w-full max-w-md"
        >
          {isProcessing ? (
            "Processando..."
          ) : isCapturing ? (
            "Capturando..."
          ) : (
            <>
              <Camera className="mr-2 h-4 w-4" />
              Capturar Placa
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
