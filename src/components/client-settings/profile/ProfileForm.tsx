
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileFormData {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  contactEmail: string;
}

interface ProfileFormProps {
  data: ProfileFormData;
  onChange: (field: keyof ProfileFormData, value: string) => void;
}

export function ProfileForm({ data, onChange }: ProfileFormProps) {
  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <Label htmlFor="name">Organization Name</Label>
        <Input
          id="name"
          value={data.name}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="Enter organization name"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="address">Street Address</Label>
        <Input
          id="address"
          value={data.address}
          onChange={(e) => onChange('address', e.target.value)}
          placeholder="Enter street address"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={data.city}
            onChange={(e) => onChange('city', e.target.value)}
            placeholder="Enter city"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            value={data.state}
            onChange={(e) => onChange('state', e.target.value)}
            placeholder="Enter state"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="zipCode">ZIP Code</Label>
          <Input
            id="zipCode"
            value={data.zipCode}
            onChange={(e) => onChange('zipCode', e.target.value)}
            placeholder="Enter ZIP code"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={data.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            placeholder="Enter phone number"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="contactEmail">Contact Email</Label>
        <Input
          id="contactEmail"
          type="email"
          value={data.contactEmail}
          onChange={(e) => onChange('contactEmail', e.target.value)}
          placeholder="Enter contact email"
        />
      </div>
    </div>
  );
}
