import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface LicensePlateInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  onChange?: (value: string) => void;
  value?: string;
}

export function LicensePlateInput({
  className,
  onChange,
  value = "",
  ...props
}: LicensePlateInputProps) {
  const [inputValue, setInputValue] = useState(value);

  const formatLicensePlate = (value: string): string => {
    // Remove todos os caracteres não alfanuméricos
    const cleanValue = value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();

    // Se tiver mais de 7 caracteres, limita a 7
    const limitedValue = cleanValue.slice(0, 7);

    // Verifica se é uma placa no padrão Mercosul (ABC1D23)
    const isMercosul = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(limitedValue);

    // Verifica se é uma placa no padrão antigo (ABC1234)
    const isOldPattern = /^[A-Z]{3}[0-9]{4}$/.test(limitedValue);

    // Se não for nenhum dos padrões, retorna apenas os caracteres limpos
    if (!isMercosul && !isOldPattern) {
      return limitedValue;
    }

    // Formata a placa com hífen
    if (isMercosul) {
      return `${limitedValue.slice(0, 3)}-${limitedValue.slice(3)}`;
    }

    return `${limitedValue.slice(0, 3)}-${limitedValue.slice(3)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatLicensePlate(e.target.value);
    setInputValue(formattedValue);

    if (onChange) {
      // Remove o hífen ao passar o valor para o onChange
      onChange(formattedValue.replace(/-/g, ""));
    }
  };

  // Atualiza o valor interno quando o prop value mudar
  useEffect(() => {
    if (value !== undefined) {
      setInputValue(formatLicensePlate(value));
    }
  }, [value]);

  return (
    <Input
      className={cn("uppercase", className)}
      maxLength={8} // 7 caracteres + hífen
      value={inputValue}
      onChange={handleChange}
      {...props}
    />
  );
}
