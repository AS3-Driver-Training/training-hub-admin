
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface ClientUpdateFormProps {
  clientId: string;
  initialName: string;
  onSuccess: () => void;
}

export function ClientUpdateForm({ clientId, initialName, onSuccess }: ClientUpdateFormProps) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientName: initialName,
    email: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error: updateError } = await supabase
        .from('clients')
        .update({ name: formData.clientName })
        .eq('id', clientId);

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
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      onSuccess();
    } catch (error: any) {
      console.error("Error updating client:", error);
      toast.error(error.message || "Failed to update client");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
      <Button type="submit" disabled={isLoading} className="w-full">
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
    </form>
  );
}
