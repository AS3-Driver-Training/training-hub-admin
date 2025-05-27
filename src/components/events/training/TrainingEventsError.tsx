
interface TrainingEventsErrorProps {
  error: Error | unknown;
}

export function TrainingEventsError({ error }: TrainingEventsErrorProps) {
  return (
    <div className="rounded-md bg-red-50 p-4 my-4">
      <div className="flex">
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">Error loading events</h3>
          <div className="text-sm text-red-700 mt-2">
            {error instanceof Error ? error.message : "An unknown error occurred"}
          </div>
        </div>
      </div>
    </div>
  );
}
