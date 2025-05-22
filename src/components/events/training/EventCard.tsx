import { TrainingEvent } from "@/types/events";
import { format } from "date-fns";
import { MapPin, Clock, Users, ArrowRight, MoreVertical, Edit, Trash2, Globe, Building2, Eye, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useState } from "react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface EventCardProps {
  event: TrainingEvent;
  onDelete?: () => void;
}

export function EventCard({ event, onDelete }: EventCardProps) {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const startDate = new Date(event.startDate);
  const endDate = event.endDate ? new Date(event.endDate) : new Date(startDate);
  
  const dayName = format(startDate, "EEE");
  
  const isSameDay = format(startDate, "yyyy-MM-dd") === format(endDate, "yyyy-MM-dd");
  
  const dateRangeText = isSameDay
    ? format(startDate, "MMM d, yyyy")
    : `${format(startDate, "MMM d")} - ${format(endDate, "MMM d, yyyy")}`;
  
  const monthDay = format(startDate, "MMM d");
  const dateRangeForBox = isSameDay 
    ? monthDay 
    : `${format(startDate, "MMM d")} - ${format(endDate, "d")}`;
  
  // Check if the course has been formally closed - with type conversion
  const { data: closureStatus } = useQuery({
    queryKey: ["event-card-closure", parseInt(event.id)],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_closures")
        .select("id")
        .eq("course_instance_id", parseInt(event.id))
        .limit(1);
        
      if (error) throw error;
      return data && data.length > 0;
    },
    // Enabled when the event might be completed by date
    enabled: event.status === "completed",
  });
  
  // Enhanced status handling - if event is completed by date and has a closure record
  const enhancedStatus = closureStatus ? "closed" : event.status;
  
  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/events/${event.id}`);
  };
  
  const handleViewAllocations = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/events/${event.id}/allocations`);
  };
  
  const handleEditEvent = () => {
    navigate(`/events/${event.id}/edit`);
  };
  
  const handleDeleteEvent = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteDialogOpen(true);
  };

  const performDelete = async () => {
    try {
      setIsDeleting(true);
      
      // Delete the event from the database - with type conversion
      const { error } = await supabase
        .from('course_instances')
        .delete()
        .eq('id', parseInt(event.id));

      if (error) {
        throw error;
      }

      // Show success message
      toast.success("Event deleted successfully");
      
      // Close the dialog first
      setDeleteDialogOpen(false);
      
      // Call the onDelete callback if provided
      if (onDelete) {
        onDelete();
      } else {
        // Navigate back to the events list if no callback provided
        navigate('/events', { replace: true });
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event. Please try again.");
      // Ensure dialog is closed even on error
      setDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <>
      <Card className="overflow-hidden hover:shadow-md transition-shadow" onClick={handleViewDetails}>
        <div className="flex flex-col sm:flex-row">
          <div className="bg-muted p-4 text-center sm:w-32 flex flex-col justify-center">
            <div className="font-medium">{dayName}</div>
            <div className="font-bold">{dateRangeForBox}</div>
          </div>
          
          <div className="flex-1 p-4">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold">{event.title}</h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={
                  enhancedStatus === "scheduled" ? "bg-primary/10 text-primary" : 
                  enhancedStatus === "closed" ? "bg-blue-100 text-blue-800 border border-blue-200" : 
                  ""
                }>
                  {enhancedStatus === "scheduled" ? "Scheduled" : 
                   enhancedStatus === "closed" ? "Closed" :
                   enhancedStatus === "completed" ? "Completed" : "Cancelled"}
                </Badge>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">More options</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleViewDetails}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    
                    {enhancedStatus === "scheduled" && (
                      <DropdownMenuItem onClick={handleEditEvent}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    
                    {(enhancedStatus === "completed" || enhancedStatus === "closed") && (
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/events/${event.id}/close`);
                      }}>
                        <FileText className="mr-2 h-4 w-4" />
                        {enhancedStatus === "closed" ? "View Closure" : "Finalize Course"}
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuItem onClick={handleDeleteEvent} className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Event
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <div className="mt-2 space-y-1">
              <div className="flex items-center text-muted-foreground text-sm">
                <MapPin className="h-4 w-4 mr-2 shrink-0" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center text-muted-foreground text-sm">
                <Clock className="h-4 w-4 mr-2 shrink-0" />
                <span>{dateRangeText}</span>
              </div>
            </div>
            
            <div className="mt-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="flex items-center text-sm">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{event.enrolledCount || 0}/{event.capacity || 0}</span>
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground">
                  {event.isOpenEnrollment ? (
                    <>
                      <Globe className="h-4 w-4 mr-2" />
                      <span>Open Enrollment</span>
                    </>
                  ) : event.clientName ? (
                    <>
                      <Building2 className="h-4 w-4 mr-2" />
                      <span>{event.clientName}</span>
                    </>
                  ) : null}
                </div>
              </div>
              
              <div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleViewAllocations}
                  className="flex items-center"
                >
                  Allocations
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this event?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the event
              "{event.title}" scheduled for {dateRangeText}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={performDelete} 
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Event"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
