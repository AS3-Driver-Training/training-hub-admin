
import React from "react";
import { Edit, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CourseVehicle } from "@/types/programs";

interface VehiclesTableProps {
  vehicles: CourseVehicle[];
  onJumpToStep: (step: 'basic' | 'vehicles' | 'exercises' | 'review') => void;
}

export function VehiclesTable({ vehicles, onJumpToStep }: VehiclesTableProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-3">
        <CardTitle className="text-base">Vehicles ({vehicles.length})</CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onJumpToStep('vehicles')}
        >
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
      </CardHeader>
      <CardContent>
        {vehicles.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Car #</TableHead>
                <TableHead>Make/Model</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>LatAcc</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((vehicle, i) => (
                <TableRow key={i}>
                  <TableCell>{vehicle.car}</TableCell>
                  <TableCell>{vehicle.make} {vehicle.model || ''}</TableCell>
                  <TableCell>{vehicle.year || "N/A"}</TableCell>
                  <TableCell>{vehicle.latAcc ? vehicle.latAcc.toFixed(2) : "N/A"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No vehicles have been added. Please add at least one vehicle.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
