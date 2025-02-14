
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings2, Shield, Database } from "lucide-react";

export function SystemSettingsTab() {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Settings2 className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Global Settings</h3>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="platform-name">Platform Name</Label>
            <Input id="platform-name" placeholder="Enter platform name" />
          </div>
          <div>
            <Label htmlFor="support-email">Support Email</Label>
            <Input id="support-email" type="email" placeholder="support@example.com" />
          </div>
          <Button>Save Changes</Button>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Security Settings</h3>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
            <Input id="session-timeout" type="number" placeholder="30" />
          </div>
          <div>
            <Label htmlFor="max-failed-attempts">Max Failed Login Attempts</Label>
            <Input id="max-failed-attempts" type="number" placeholder="5" />
          </div>
          <Button>Update Security Settings</Button>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Database className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Database Configuration</h3>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="backup-frequency">Backup Frequency (hours)</Label>
            <Input id="backup-frequency" type="number" placeholder="24" />
          </div>
          <div>
            <Label htmlFor="retention-period">Data Retention Period (days)</Label>
            <Input id="retention-period" type="number" placeholder="30" />
          </div>
          <Button>Save Database Settings</Button>
        </div>
      </Card>
    </div>
  );
}
