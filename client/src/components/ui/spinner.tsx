import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  fullPage?: boolean;
}

export function LoadingSpinner({ 
  size = "md", 
  className,
  fullPage = false
}: LoadingSpinnerProps) {
  const sizeMap = {
    xs: "h-3 w-3",
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  if (fullPage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className={cn(
          "animate-spin text-primary", 
          sizeMap[size], 
          className
        )} />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4">
      <Loader2 className={cn(
        "animate-spin text-primary", 
        sizeMap[size], 
        className
      )} />
    </div>
  );
}