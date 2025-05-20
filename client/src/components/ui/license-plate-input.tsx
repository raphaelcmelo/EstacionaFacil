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
    // Limita a 7 caracteres
    return cleanValue.slice(0, 7);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatLicensePlate(e.target.value);
    setInputValue(formattedValue);

    if (onChange) {
      onChange(formattedValue);
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
      maxLength={7}
      value={inputValue}
      onChange={handleChange}
      {...props}
    />
  );
}
