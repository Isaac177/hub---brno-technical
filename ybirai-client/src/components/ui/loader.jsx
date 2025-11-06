import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

export const Loader = ({ className, size = 24 }) => {
  return (
    <div className="w-full flex justify-center items-center">
      <Loader2 
        className={cn("animate-spin text-primary", className)} 
        size={size}
      />
    </div>
  );
};
