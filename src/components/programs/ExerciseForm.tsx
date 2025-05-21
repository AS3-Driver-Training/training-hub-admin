
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
import { ProgramExercise, ExerciseParameter } from "@/types/programs";
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
  const [parameters, setParameters] = useState<ExerciseParameter[]>(
    exercise?.parameters || []
  );
  
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

  // Handle adding a new parameter
  const handleAddParameter = () => {
    setParameters([
      ...parameters,
      { id: `temp-${Date.now()}`, name: "", value: 0 },
    ]);
  };

  // Handle updating a parameter
  const handleParameterChange = (index: number, field: "name" | "value", value: string | number) => {
    const updatedParams = [...parameters];
    updatedParams[index] = {
      ...updatedParams[index],
      [field]: field === "value" ? Number(value) : value,
    };
    setParameters(updatedParams);
  };

  // Handle removing a parameter
  const handleRemoveParameter = (index: number) => {
    setParameters(parameters.filter((_, i) => i !== index));
  };

  // Handle form submission
  const onSubmit = (data: ExerciseFormValues) => {
    const newExercise: ProgramExercise = {
      id: exercise?.id || `temp-${Date.now()}`,
      name: data.name,
      isCore: data.isCore,
      isMeasured: data.isMeasured,
      measurementType: data.measurementType,
      order: exercise?.order || 0,
      parameters: parameters,
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
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium">Parameters</h4>
                  <Button
                    type="button"
                    onClick={handleAddParameter}
                    size="sm"
                    variant="outline"
                  >
                    Add Parameter
                  </Button>
                </div>

                <div className="space-y-2">
                  {parameters.map((param, index) => (
                    <div
                      key={param.id}
                      className="flex items-center gap-2 border p-2 rounded-md"
                    >
                      <Input
                        placeholder="Parameter name"
                        value={param.name}
                        onChange={(e) => handleParameterChange(index, "name", e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Value"
                        value={param.value}
                        onChange={(e) => handleParameterChange(index, "value", e.target.value)}
                        className="w-24"
                      />
                      <Button
                        type="button"
                        onClick={() => handleRemoveParameter(index)}
                        size="sm"
                        variant="destructive"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}

                  {/* Default parameter suggestions based on measurement type */}
                  {parameters.length === 0 && measurementType === "latacc" && (
                    <div className="text-sm text-gray-500">
                      Suggested parameters: chord, mo
                    </div>
                  )}
                  {parameters.length === 0 && measurementType === "time" && (
                    <div className="text-sm text-gray-500">
                      Suggested parameters: ideal_time_sec, cone_penalty_sec
                    </div>
                  )}
                </div>
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
