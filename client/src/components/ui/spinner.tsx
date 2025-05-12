import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

export function LoadingSpinner({ size = 24, className }: LoadingSpinnerProps) {
  return (
    <div className="w-full h-full flex items-center justify-center py-8">
      <Loader2 className={cn("animate-spin text-primary", className)} size={size} />
    </div>
  );
}
