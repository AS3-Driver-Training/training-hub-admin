
import React from "react";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface InfoTooltipProps {
  text: string;
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}

export function InfoTooltip({ text, className, side = "top", align = "center" }: InfoTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <div className={cn("inline-flex items-center justify-center", className)}>
            <Info className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors cursor-help" />
          </div>
        </TooltipTrigger>
        <TooltipContent 
          side={side} 
          align={align}
          className="bg-popover text-popover-foreground max-w-xs text-sm p-3"
        >
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
