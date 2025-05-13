
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { VerifyInvitationResponse, AcceptInvitationResponse } from "@/types/invitation";

export default function Invitation() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [invitationData, setInvitationData] = useState<{
    clientName: string;
    invitationType: string;
    clientId: string;
    email?: string;
  } | null>(null);
  
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  
  // Verify the token and get invitation data
  useEffect(() => {
    async function verifyInvitation() {
      if (!token) {
        toast.error("Invalid invitation link");
        navigate("/");
        return;
      }

      try {
        // Verify invitation token
        const { data, error } = await supabase.rpc<VerifyInvitationResponse>(
          'verify_invitation_token',
          { p_token: token }
        );

        if (error || !data || !data.valid) {
          console.error("Error verifying invitation:", error || data?.error || "No data returned");
          toast.error("This invitation link is invalid or has expired");
          setTimeout(() => navigate("/"), 3000);
          return;
        }

        console.log("Invitation data:", data);
        
        // Get client name
        const { data: clientData } = await supabase
          .from('clients')
          .select('name')
          .eq('id', data.client_id)
          .single();
          
        if (!clientData) {
          toast.error("Client not found");
          navigate("/");
          return;
        }

        setInvitationData({
          clientName: clientData.name,
          invitationType: data.invitation_type || 'shareable',
          clientId: data.client_id!,
          email: data.email
        });
        
        if (data.email) {
          setFormData(prev => ({...prev, email: data.email!}));
        }

        // Check if the email is already registered
        if (data.email) {
          const { data: userData } = await supabase.auth.signInWithOtp({
            email: data.email,
            options: {
              shouldCreateUser: false,
            }
          });
          
          setIsExistingUser(!!userData);
        }
      } catch (error) {
        console.error("Error in invitation verification:", error);
        toast.error("Failed to process invitation");
      } finally {
        setIsLoading(false);
      }
    }

    verifyInvitation();
  }, [token, navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Create a new user account
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
          }
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Update the profile with additional info
        await supabase
          .from('profiles')
          .update({
            first_name: formData.firstName,
            last_name: formData.lastName
          })
          .eq('id', data.user.id);
          
        // Accept invitation and add user to client
        const { data: acceptData, error: acceptError } = await supabase.rpc<AcceptInvitationResponse>(
          'accept_invitation',
          {
            p_token: token,
            p_user_id: data.user.id
          }
        );
        
        if (acceptError || !acceptData?.success) {
          throw acceptError || new Error(acceptData?.error || "Failed to accept invitation");
        }
        
        toast.success(`Welcome to ${invitationData?.clientName}!`);
        navigate("/clients");
      }
    } catch (error: any) {
      console.error("Error in signup:", error);
      toast.error(error.message || "Failed to sign up");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!formData.email) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/reset-password?token=${token}`,
      });
      
      if (error) throw error;
      
      toast.success("Password reset link sent to your email");
    } catch (error: any) {
      console.error("Error sending reset email:", error);
      toast.error(error.message || "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Verifying invitation...</p>
        </div>
      </div>
    );
  }

  if (!invitationData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>
              This invitation link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate("/")} className="w-full">
              Return Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Join {invitationData.clientName}</CardTitle>
          <CardDescription>
            {isExistingUser
              ? "You already have an account. Reset your password to continue."
              : "Create an account to accept this invitation."}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {isExistingUser ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  readOnly
                  className="bg-gray-100"
                />
              </div>
              <Button 
                onClick={handlePasswordReset} 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Reset Link...
                  </>
                ) : (
                  'Send Password Reset Link'
                )}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  required
                  readOnly={!!invitationData.email}
                  className={invitationData.email ? "bg-gray-100" : ""}
                />
              </div>
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={e => setFormData({...formData, firstName: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={e => setFormData({...formData, lastName: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  required
                  minLength={6}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account & Join'
                )}
              </Button>
            </form>
          )}
        </CardContent>
        
        <CardFooter className="justify-center">
          <Button variant="link" onClick={() => navigate("/")}>
            Return to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
