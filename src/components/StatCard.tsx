import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  variant?: "default" | "primary" | "accent" | "success";
}

export const StatCard = ({ title, value, icon: Icon, description, variant = "default" }: StatCardProps) => {
  const variantStyles = {
    default: "bg-card border-border",
    primary: "bg-primary/5 border-primary/20",
    accent: "bg-accent/5 border-accent/20",
    success: "bg-success/5 border-success/20",
  };

  const iconVariantStyles = {
    default: "bg-muted text-muted-foreground",
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/10 text-accent",
    success: "bg-success/10 text-success",
  };

  return (
    <Card className={`p-6 border-2 transition-all hover:shadow-lg ${variantStyles[variant]}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1 min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className={`font-bold text-foreground ${typeof value === 'string' && value.length > 10 ? 'text-xl' : 'text-3xl'}`}>
            {value}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${iconVariantStyles[variant]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
};
