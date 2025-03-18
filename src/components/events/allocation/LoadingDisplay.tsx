
export function LoadingDisplay() {
  return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-muted-foreground">Loading course details...</p>
      </div>
    </div>
  );
}
