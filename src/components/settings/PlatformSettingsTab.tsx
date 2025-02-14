
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function PlatformSettingsTab() {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Platform Settings</h3>
        <p className="text-sm text-muted-foreground">
          Configure global platform settings and defaults
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium mb-4">Default Client Settings</h4>
          <div className="space-y-4">
            <div>
              <Label htmlFor="default-group-name">Default Group Name</Label>
              <Input id="default-group-name" placeholder="Default Group" />
            </div>
            <div>
              <Label htmlFor="default-role">Default User Role</Label>
              <Input id="default-role" placeholder="supervisor" />
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="text-sm font-medium mb-4">Client Portal Customization</h4>
          <div className="space-y-4">
            <div>
              <Label htmlFor="login-message">Default Login Message</Label>
              <Input id="login-message" placeholder="Welcome to the platform" />
            </div>
            <div>
              <Label htmlFor="support-contact">Support Contact Information</Label>
              <Input id="support-contact" placeholder="support@example.com" />
            </div>
          </div>
        </div>

        <Button className="w-full">Save Platform Settings</Button>
      </div>
    </Card>
  );
}
