import { Crown } from "lucide-react";

interface ChirpPlusBadgeProps {
  show?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export default function ChirpPlusBadge({ show = true, size = "sm", className = "" }: ChirpPlusBadgeProps) {
  if (!show) return null;

  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <Crown 
      className={`text-purple-500 ${iconSize} ${className}`}
      title="Chirp+ Member"
    />
  );
}