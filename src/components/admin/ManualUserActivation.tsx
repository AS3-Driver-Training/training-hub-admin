
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function ManualUserActivation() {
  const [email, setEmail] = useState("pmonasterio@yahoo.com");
  const [password, setPassword] = useState("AS3Driving");
  const [isLoading, setIsLoading] = useState(false);

  const handleActivation = async () => {
    if (!email || !password) {
      toast.error("Please provide both email and password");
      return;
    }

    setIsLoading(true);
    try {
      console.log(`Attempting manual activation for: ${email}`);
      
      const { data, error } = await supabase.functions.invoke('manual-user-activation', {
        body: {
          email: email,
          password: password
        }
      });

      if (error) {
        console.error('Error calling activation function:', error);
        throw error;
      }

      console.log('Activation response:', data);

      if (data.success) {
        toast.success(`User ${email} has been successfully activated! Accepted ${data.acceptedInvitations} invitation(s).`);
        console.log('Invitations processed:', data.invitations);
      } else {
        throw new Error(data.error || 'Activation failed');
      }

    } catch (error: any) {
      console.error('Activation error:', error);
      toast.error(`Failed to activate user: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Manual User Activation</CardTitle>
        <CardDescription>
          Manually activate a user and accept their pending invitations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
          />
        </div>
        <div>
          <Label htmlFor="password">Temporary Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter temporary password"
          />
        </div>
        <Button 
          onClick={handleActivation} 
          disabled={isLoading || !email || !password}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Activating...
            </>
          ) : (
            'Activate User'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
