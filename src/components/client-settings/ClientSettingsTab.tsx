import { Card } from "@/components/ui/card";

export function ClientSettingsTab() {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Client Settings</h3>
        <p className="text-sm text-muted-foreground">
          Manage client preferences and settings
        </p>
      </div>
      {/* Add settings form here */}
    </Card>
  );
}