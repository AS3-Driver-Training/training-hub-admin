import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function InviteClientDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientName: "",
    email: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create client and generate invitation
      const { data, error } = await supabase.rpc('create_client_with_invitation', {
        client_name: formData.clientName,
        contact_email: formData.email,
      });

      if (error) throw error;

      // Send invitation email
      const emailResponse = await supabase.functions.invoke('send-invitation', {
        body: {
          clientName: formData.clientName,
          email: formData.email,
          token: data.token,
        },
      });

      if (!emailResponse.error) {
        toast.success("Client invited successfully!");
        setOpen(false);
        setFormData({ clientName: "", email: "" });
      } else {
        throw new Error("Failed to send invitation email");
      }
    } catch (error: any) {
      console.error("Error inviting client:", error);
      toast.error(error.message || "Failed to invite client");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite New Client
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Invite New Client</DialogTitle>
            <DialogDescription>
              Send an invitation to a new client organization.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="clientName">Organization Name</Label>
              <Input
                id="clientName"
                value={formData.clientName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    clientName: e.target.value,
                  }))
                }
                placeholder="Acme Corp"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Contact Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="contact@example.com"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Invitation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}