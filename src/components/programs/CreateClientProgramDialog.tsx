
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, MapPin, Users, Clock } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useProfile } from "@/hooks/useProfile";
import { useGooglePlaces } from "@/hooks/useGooglePlaces";

const clientProgramSchema = z.object({
  name: z.string().min(1, "Program name is required"),
  description: z.string().optional(),
  duration_days: z.coerce.number().min(1, "Duration must be at least 1 day"),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  location_type: z.enum(["physical", "virtual", "hybrid"]),
  location_name: z.string().optional(),
  location_address: z.string().optional(),
  enrollment_type: z.enum(["open", "invitation", "team_specific"]),
  max_participants: z.coerce.number().optional(),
});

type ClientProgramForm = z.infer<typeof clientProgramSchema>;

export function CreateClientProgramDialog() {
  const [open, setOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    name: string;
    address: string;
    googleLocation: string;
    placeId: string;
  } | null>(null);
  
  const { profile } = useProfile();
  const queryClient = useQueryClient();

  const form = useForm<ClientProgramForm>({
    resolver: zodResolver(clientProgramSchema),
    defaultValues: {
      duration_days: 1,
      location_type: "physical",
      enrollment_type: "open",
    },
  });

  const { inputRef, isLoadingScript, scriptError } = useGooglePlaces({
    onPlaceSelect: (placeData) => {
      setSelectedLocation({
        name: placeData.placeName,
        address: placeData.address,
        googleLocation: placeData.googleLocation,
        placeId: placeData.googlePlaceId || "",
      });
      form.setValue("location_name", placeData.placeName);
      form.setValue("location_address", placeData.address);
    },
  });

  const createProgramMutation = useMutation({
    mutationFn: async (data: ClientProgramForm) => {
      if (!profile?.clientUsers?.[0]?.client_id) {
        throw new Error("No client found");
      }

      if (!profile.id) {
        throw new Error("No user ID found");
      }

      const programData = {
        client_id: profile.clientUsers[0].client_id,
        created_by: profile.id,
        name: data.name,
        description: data.description,
        duration_days: data.duration_days,
        start_time: data.start_time,
        end_time: data.end_time,
        location_type: data.location_type,
        location_name: data.location_name,
        location_address: data.location_address,
        enrollment_type: data.enrollment_type,
        max_participants: data.max_participants,
        google_place_id: selectedLocation?.placeId,
        google_location: selectedLocation?.googleLocation,
      };

      const { data: program, error } = await supabase
        .from("client_programs")
        .insert(programData)
        .select()
        .single();

      if (error) throw error;
      return program;
    },
    onSuccess: () => {
      toast.success("Program created successfully");
      queryClient.invalidateQueries({ queryKey: ["client-programs"] });
      setOpen(false);
      form.reset();
      setSelectedLocation(null);
    },
    onError: (error) => {
      console.error("Error creating program:", error);
      toast.error("Failed to create program");
    },
  });

  const onSubmit = (data: ClientProgramForm) => {
    createProgramMutation.mutate(data);
  };

  const locationType = form.watch("location_type");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Program
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Program
          </DialogTitle>
          <DialogDescription>
            Create a custom program for your organization. You can schedule specific instances of this program later.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Program Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., First Aid Training, Ballet Fundamentals" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Brief description of the program content and objectives..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="duration_days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Duration (Days)
                      </FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="start_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time (Optional)</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time (Optional)</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location
              </h3>

              <FormField
                control={form.control}
                name="location_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="physical">Physical Location</SelectItem>
                        <SelectItem value="virtual">Virtual/Online</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {locationType === "physical" || locationType === "hybrid" ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="location-search">Search Location</Label>
                    <Input
                      ref={inputRef}
                      id="location-search"
                      placeholder="Search for a location..."
                      className="mt-1"
                      disabled={isLoadingScript}
                    />
                    {scriptError && (
                      <p className="text-sm text-red-600 mt-1">{scriptError}</p>
                    )}
                  </div>

                  {selectedLocation && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                      <h4 className="font-medium text-green-800">{selectedLocation.name}</h4>
                      <p className="text-sm text-green-600">{selectedLocation.address}</p>
                    </div>
                  )}
                </div>
              ) : locationType === "virtual" ? (
                <FormField
                  control={form.control}
                  name="location_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Platform/Link Info</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Zoom, Teams, or meeting details" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}
            </div>

            {/* Enrollment */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Users className="h-5 w-5" />
                Enrollment
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="enrollment_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Enrollment Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select enrollment type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="open">Open Enrollment</SelectItem>
                          <SelectItem value="invitation">Invitation Only</SelectItem>
                          <SelectItem value="team_specific">Team Specific</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="max_participants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Participants (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" placeholder="No limit" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createProgramMutation.isPending}>
                {createProgramMutation.isPending ? "Creating..." : "Create Program"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
