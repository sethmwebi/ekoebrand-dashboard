import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "./ui/card";

// Type definitions
interface SummaryCardsProps {
  Icon: LucideIcon;
  subtitle: string;
  value: number;
  className?: string;
}

// SummaryCards component
export default function SummaryCards({
  Icon,
  subtitle,
  value,
  className,
}: SummaryCardsProps) {
  return (
    <Card className={`${className} bg-background w-full py-2 md:py-4 lg:py-6`}>
      <CardContent className="px-2 md:px-4 lg:px-6">
        <div className="flex gap-2 items-center">
          <div className="dark:bg-brand-orange-dark/90 bg-brand-orange/90 p-2 rounded-full">
            <Icon size={14} color={"#f5f5f5"} />
          </div>
          <div className="flex flex-col">
            <h4 className="whitespace-nowrap text-nowrap">{subtitle}</h4>
            <h4 className="font-bold">{value}</h4>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
