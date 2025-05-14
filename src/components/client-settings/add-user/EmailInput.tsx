
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export interface EmailInputProps {
  email: string;
  onEmailChange: (email: string) => void;
  description?: string;
  disabled?: boolean;
}

export function EmailInput({ email, onEmailChange, description, disabled }: EmailInputProps) {
  return (
    <div className="space-y-1">
      <Label htmlFor="email">Email</Label>
      <Input
        id="email"
        type="email"
        placeholder="user@example.com"
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
        disabled={disabled}
        required
      />
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
    </div>
  );
}
