
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { HexColorPicker } from "react-colorful";

interface ColorPickerProps {
  label: string;
  color: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ label, color, onChange }: ColorPickerProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={label}>{label}</Label>
      <div className="flex gap-2 items-center">
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="w-10 h-10 rounded border shadow-sm"
              style={{ backgroundColor: color }}
            />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3">
            <HexColorPicker
              color={color}
              onChange={onChange}
            />
          </PopoverContent>
        </Popover>
        <Input
          id={label}
          value={color}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="font-mono"
        />
      </div>
    </div>
  );
}
