
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

interface EditTeamDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (teamId: string, name: string) => void;
  team: {
    id: string;
    name: string;
  } | null;
}

export function EditTeamDialog({ isOpen, onOpenChange, onSubmit, team }: EditTeamDialogProps) {
  const [teamName, setTeamName] = useState("");

  useEffect(() => {
    if (team) {
      setTeamName(team.name);
    }
  }, [team]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (team) {
      onSubmit(team.id, teamName);
      setTeamName("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Team</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="teamName">Team Name</Label>
            <Input
              id="teamName"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Enter team name"
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Save Changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
