
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface EmailInputProps {
  email: string;
  onEmailChange: (value: string) => void;
}

export function EmailInput({ email, onEmailChange }: EmailInputProps) {
  return (
    <div>
      <Label htmlFor="email">Email</Label>
      <Input
        id="email"
        type="email"
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
        required
      />
    </div>
  );
}
