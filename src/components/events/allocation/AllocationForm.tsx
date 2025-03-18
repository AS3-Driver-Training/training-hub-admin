
import { UseFormReturn } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus } from "lucide-react";

interface AllocationFormProps {
  form: UseFormReturn<{
    clientId: string;
    seatsAllocated: number;
  }>;
  onSubmit: (values: { clientId: string; seatsAllocated: number }) => void;
  onCancel: () => void;
  availableClients: any[] | undefined;
  remainingSeats: number;
}

export function AllocationForm({ 
  form, 
  onSubmit, 
  onCancel, 
  availableClients, 
  remainingSeats 
}: AllocationFormProps) {
  return (
    <Card className="border shadow-sm mb-6">
      <CardHeader className="py-3 px-4 border-b bg-slate-50">
        <CardTitle className="text-base flex items-center">
          <UserPlus className="h-4 w-4 mr-2" />
          Assign Seats to Client
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 py-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a client" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableClients?.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="seatsAllocated"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max={remainingSeats.toString()}
                        placeholder={`Seats (max: ${remainingSeats})`}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                size="sm" 
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                Assign
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
