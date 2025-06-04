
interface PoweredByAS3Props {
  className?: string;
}

export function PoweredByAS3({ className = "" }: PoweredByAS3Props) {
  return (
    <div className={`flex items-center gap-2 text-xs text-muted-foreground ${className}`}>
      <span>Powered by</span>
      <img
        src="http://as3.mx/wp-content/uploads/2025/06/AS3-Driver-Training-Logo-No-Disk.png"
        alt="AS3 Driver Training"
        className="h-4 w-auto opacity-60"
      />
    </div>
  );
}
