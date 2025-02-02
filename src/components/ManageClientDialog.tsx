import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Trash2, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface Client {
  id: string;
  name: string;
  status: string;
  created_at: string;
}

interface ManageClientDialogProps {
  client: Client;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageClientDialog({ client, open, onOpenChange }: ManageClientDialogProps) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientName: client.name,
    email: "",
  });

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this client?")) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', client.id);

      if (error) throw error;

      toast.success("Client deleted successfully");
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    } catch (error: any) {
      console.error("Error deleting client:", error);
      toast.error(error.message || "Failed to delete client");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error: updateError } = await supabase
        .from('clients')
        .update({ name: formData.clientName })
        .eq('id', client.id);

      if (updateError) throw updateError;

      if (formData.email) {
        // Create new invitation
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

        if (emailResponse.error) throw new Error("Failed to send invitation email");
      }

      toast.success("Client updated successfully");
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    } catch (error: any) {
      console.error("Error updating client:", error);
      toast.error(error.message || "Failed to update client");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleUpdate}>
          <DialogHeader>
            <DialogTitle>Manage Client</DialogTitle>
            <DialogDescription>
              Update client information or send new invitations.
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
              <Label htmlFor="email">New Invitation Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="contact@example.com"
              />
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Client
            </Button>
            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading}>
                {formData.email ? (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Update & Send Invitation
                  </>
                ) : (
                  <>
                    <Edit className="mr-2 h-4 w-4" />
                    Update Client
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}