
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { countries } from "@/utils/countries";

interface CountryFilterProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function CountryFilter({ value, onValueChange }: CountryFilterProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-40">
        <SelectValue placeholder="All Countries" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Countries</SelectItem>
        {countries.map((country) => (
          <SelectItem key={country.code} value={country.code}>
            <div className="flex items-center gap-2">
              <span>{country.flag}</span>
              <span>{country.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
