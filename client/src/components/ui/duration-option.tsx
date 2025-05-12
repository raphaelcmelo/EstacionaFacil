import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/utils";

interface DurationOptionProps {
  hours: number;
  price: string | number;
  selected?: boolean;
  onClick?: () => void;
}

export function DurationOption({ hours, price, selected, onClick }: DurationOptionProps) {
  return (
    <div
      className={cn(
        "border rounded-lg text-center py-3 cursor-pointer hover:border-primary transition-colors",
        selected && "border-primary bg-blue-50"
      )}
      onClick={onClick}
    >
      <p className="font-semibold">
        {hours} {hours === 1 ? "hora" : "horas"}
      </p>
      <p className="text-secondary font-medium">{formatMoney(price)}</p>
    </div>
  );
}
