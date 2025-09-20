import { LucideIcon } from "lucide-react";
import { cn } from "../lib/utils.ts";

interface BrandIconProps {
  icon: LucideIcon;
  variant?: "primary" | "secondary" | "accent";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function BrandIcon({ 
  icon: Icon, 
  variant = "primary", 
  size = "md", 
  className 
}: BrandIconProps) {
  const variantColors = {
    primary: "text-purple-600 dark:text-purple-400",
    secondary: "text-pink-600 dark:text-pink-400", 
    accent: "text-blue-600 dark:text-blue-400"
  };

  const sizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  };

  return (
    <Icon 
      className={cn(
        variantColors[variant],
        sizes[size],
        className
      )}
    />
  );
}
