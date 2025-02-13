
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AddUserDialogProps {
  clientId: string;
}

export function AddUserDialog({ clientId }: AddUserDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("employee");
  const queryClient = useQueryClient();

  const addUserMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      const { data: userData, error: userError } = await supabase.functions.invoke(
        'get-user-by-email',
        { body: { email } }
      );

      if (userError || !userData?.user) {
        throw new Error('User not found');
      }

      const { error: insertError } = await supabase
        .from('client_users')
        .insert({
          client_id: clientId,
          user_id: userData.user.id,
          role: role,
          status: 'pending'
        });

      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client_users', clientId] });
      setIsDialogOpen(false);
      setEmail("");
      setRole("employee");
      toast.success("User added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    addUserMutation.mutate({ email, role });
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAddUser} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full">
            Add User
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
