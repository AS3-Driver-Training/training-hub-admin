
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface EmailInputProps {
  email: string;
  onEmailChange: (value: string) => void;
}

export function EmailInput({ email, onEmailChange }: EmailInputProps) {
  console.log("EmailInput rendered with email:", email);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Email changed to:", e.target.value);
    onEmailChange(e.target.value);
  };
  
  return (
    <div>
      <Label htmlFor="email">Email</Label>
      <Input
        id="email"
        type="email"
        value={email}
        onChange={handleChange}
        placeholder="user@example.com"
      />
    </div>
  );
}
