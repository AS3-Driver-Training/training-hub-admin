
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CourseInfo as CourseInfoType } from "@/types/programs";

interface CourseInfoProps {
  info: CourseInfoType;
  onChange: (info: Partial<CourseInfoType>) => void;
}

export function CourseInfo({ info, onChange }: CourseInfoProps) {
  return (
    <div className="grid gap-6">
      <h3 className="text-lg font-semibold">Course Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="units">Units</Label>
          <Select 
            value={info.units}
            onValueChange={(value) => onChange({ units: value })}
          >
            <SelectTrigger id="units">
              <SelectValue placeholder="Select units" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MPH">MPH</SelectItem>
              <SelectItem value="KPH">KPH</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="country">Country</Label>
          <Input 
            id="country" 
            value={info.country} 
            onChange={(e) => onChange({ country: e.target.value })} 
          />
        </div>
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="program">Program</Label>
        <Input 
          id="program" 
          value={info.program} 
          onChange={(e) => onChange({ program: e.target.value })} 
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="date">Date</Label>
          <Input 
            id="date" 
            type="date" 
            value={info.date} 
            onChange={(e) => onChange({ date: e.target.value })} 
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="client">Client</Label>
          <Input 
            id="client" 
            value={info.client} 
            onChange={(e) => onChange({ client: e.target.value })} 
          />
        </div>
      </div>
    </div>
  );
}
