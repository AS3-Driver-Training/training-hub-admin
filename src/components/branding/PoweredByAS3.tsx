
import { Link } from "react-router-dom";

interface PoweredByAS3Props {
  className?: string;
}

export function PoweredByAS3({ className = "" }: PoweredByAS3Props) {
  return (
    <a 
      href="https://as3driving.com" 
      target="_blank" 
      rel="noopener noreferrer"
      className={`flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors ${className}`}
    >
      <span>Powered by</span>
      <img
        src="http://as3.mx/wp-content/uploads/2025/06/AS3-Driver-Training-Logo-No-Disk.png"
        alt="AS3 Driver Training"
        className="h-4 w-auto opacity-60 hover:opacity-80 transition-opacity"
      />
    </a>
  );
}
