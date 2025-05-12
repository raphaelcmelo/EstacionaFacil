import { useState } from "react";
import { Input, InputProps } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface LicensePlateInputProps extends Omit<InputProps, 'onChange'> {
  onChange?: (value: string) => void;
}

export function LicensePlateInput({ 
  className, 
  onChange, 
  value, 
  ...props 
}: LicensePlateInputProps) {
  const [inputValue, setInputValue] = useState(value ?? "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Convert to uppercase
    const newValue = e.target.value.toUpperCase();
    
    // Update internal state
    setInputValue(newValue);
    
    // Call external onChange if provided
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <Input
      className={cn("uppercase", className)}
      maxLength={8}
      value={inputValue}
      onChange={handleChange}
      {...props}
    />
  );
}
