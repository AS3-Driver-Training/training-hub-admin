
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  // Handle password reset flow
  useEffect(() => {
    const handlePasswordReset = async () => {
      const token = searchParams.get('token');
      if (token) {
        try {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'recovery'
          });
          if (error) throw error;
          toast({
            title: "Success!",
            description: "Your password has been reset. Please sign in with your new password.",
          });
        } catch (error: any) {
          toast({
            variant: "destructive",
            title: "Error",
            description: error.message,
          });
        }
      }
    };

    handlePasswordReset();
  }, [searchParams, toast]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isForgotPassword) {
        // Get the current origin (domain) of the application
        const origin = window.location.origin;
        const redirectTo = `${origin}/auth`;

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo,
        });
        if (error) throw error;
        
        toast({
          title: "Success!",
          description: "Check your email for password reset instructions.",
        });
        setIsForgotPassword(false);
      } else if (isSignUp) {
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
            },
          },
        });

        if (signUpError) throw signUpError;

        if (authData.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: authData.user.id,
                first_name: firstName,
                last_name: lastName,
                role: 'employee'
              }
            ]);

          if (profileError) throw profileError;
        }

        toast({
          title: "Success!",
          description: "Please check your email to verify your account.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate("/");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderForgotPassword = () => (
    <form className="mt-8 space-y-6" onSubmit={handleAuth}>
      <div>
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <Button
          type="submit"
          className="w-full bg-[#C10230] hover:bg-[#C10230]/90"
          disabled={isLoading}
        >
          {isLoading ? "Sending..." : "Send Reset Instructions"}
        </Button>
      </div>
      <div className="text-center">
        <button
          type="button"
          onClick={() => setIsForgotPassword(false)}
          className="text-sm text-[#119DA4] hover:underline"
        >
          Back to Sign In
        </button>
      </div>
    </form>
  );

  const renderAuthForm = () => (
    <form className="mt-8 space-y-6" onSubmit={handleAuth}>
      {isSignUp && (
        <div className="grid gap-4 grid-cols-2">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
        </div>
      )}
      <div>
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {!isSignUp && (
        <div className="text-right">
          <button
            type="button"
            onClick={() => setIsForgotPassword(true)}
            className="text-sm text-[#119DA4] hover:underline"
          >
            Forgot your password?
          </button>
        </div>
      )}
      <div>
        <Button
          type="submit"
          className="w-full bg-[#C10230] hover:bg-[#C10230]/90"
          disabled={isLoading}
        >
          {isLoading
            ? "Loading..."
            : isSignUp
            ? "Create Account"
            : "Sign In"}
        </Button>
      </div>
      <div className="text-center">
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-sm text-[#119DA4] hover:underline"
        >
          {isSignUp
            ? "Already have an account? Sign in"
            : "Don't have an account? Sign up"}
        </button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md space-y-8 p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            {isForgotPassword
              ? "Reset your password"
              : isSignUp
              ? "Create your account"
              : "Sign in to your account"}
          </h2>
        </div>
        {isForgotPassword ? renderForgotPassword() : renderAuthForm()}
      </Card>
    </div>
  );
};

export default Auth;
