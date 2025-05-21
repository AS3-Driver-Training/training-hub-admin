
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { ProgramExercise } from "@/types/programs";
import { Switch } from "@/components/ui/switch";

const exerciseSchema = z.object({
  name: z.string().min(1, "Exercise name is required"),
  isCore: z.boolean(),
  isMeasured: z.boolean(),
  measurementType: z.enum(["latacc", "time"]),
});

type ExerciseFormValues = z.infer<typeof exerciseSchema>;

interface ExerciseFormProps {
  exercise?: ProgramExercise;
  isCore?: boolean;
  onSave: (exercise: ProgramExercise) => void;
  onCancel: () => void;
}

export function ExerciseForm({ 
  exercise, 
  isCore = false, 
  onSave, 
  onCancel 
}: ExerciseFormProps) {
  // Create form with default values
  const form = useForm<ExerciseFormValues>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      name: exercise?.name || "",
      isCore: isCore || exercise?.isCore || false,
      isMeasured: exercise?.isMeasured ?? true,
      measurementType: exercise?.measurementType || "latacc",
    },
  });

  const measurementType = form.watch("measurementType");
  const isMeasured = form.watch("isMeasured");

  // Handle form submission - we no longer manage parameters at program level
  const onSubmit = (data: ExerciseFormValues) => {
    const newExercise: ProgramExercise = {
      id: exercise?.id || `temp-${Date.now()}`,
      name: data.name,
      isCore: data.isCore,
      isMeasured: data.isMeasured,
      measurementType: data.measurementType,
      order: exercise?.order || 0,
      parameters: [], // Parameters will be empty at program level, filled during course closure
    };
    onSave(newExercise);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{exercise ? "Edit Exercise" : "Add Exercise"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exercise Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Exercise name"
                      {...field}
                      disabled={isCore}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="isCore"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Core Exercise</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isCore}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isMeasured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Measured Exercise</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isCore}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {isMeasured && (
              <FormField
                control={form.control}
                name="measurementType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Measurement Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select measurement type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="latacc">Lateral Acceleration</SelectItem>
                        <SelectItem value="time">Time</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {isMeasured && (
              <div className="p-4 bg-gray-50 rounded-md border">
                <h4 className="text-sm font-medium mb-2">Parameter Information</h4>
                <p className="text-sm text-muted-foreground">
                  Parameters for this exercise will be set during course closure by the instructor.
                </p>
                
                {measurementType === "latacc" && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    <p>Typically includes parameters like:</p>
                    <ul className="list-disc list-inside pl-2 mt-1">
                      <li>chord</li>
                      <li>mo</li>
                    </ul>
                  </div>
                )}
                
                {measurementType === "time" && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    <p>Typically includes parameters like:</p>
                    <ul className="list-disc list-inside pl-2 mt-1">
                      <li>ideal_time_sec</li>
                      <li>cone_penalty_sec</li>
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">Save Exercise</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
