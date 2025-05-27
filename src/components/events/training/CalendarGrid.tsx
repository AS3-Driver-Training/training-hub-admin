
import { useState } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths, isToday } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrainingEvent } from "@/types/events";
import { EventCard } from "./EventCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CalendarGridProps {
  events: TrainingEvent[];
  onEventDeleted?: () => void;
}

export function CalendarGrid({ events, onEventDeleted }: CalendarGridProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const previousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const getDayEvents = (day: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return isSameDay(eventDate, day);
    });
  };

  const renderCalendarDays = () => {
    const days = [];
    let day = startDate;

    while (day <= endDate) {
      const dayEvents = getDayEvents(day);
      const isCurrentMonth = isSameMonth(day, monthStart);
      const isCurrentDay = isToday(day);
      const currentDay = day;

      days.push(
        <div
          key={day.toString()}
          className={`
            min-h-[120px] border border-border/20 p-2 cursor-pointer transition-colors hover:bg-muted/50
            ${!isCurrentMonth ? 'bg-muted/20 text-muted-foreground' : 'bg-background'}
            ${isCurrentDay ? 'bg-primary/5 border-primary/30' : ''}
          `}
          onClick={() => setSelectedDay(currentDay)}
        >
          <div className={`
            text-sm font-medium mb-1
            ${isCurrentDay ? 'text-primary font-bold' : ''}
            ${!isCurrentMonth ? 'text-muted-foreground' : ''}
          `}>
            {format(day, 'd')}
          </div>
          
          <div className="space-y-1">
            {dayEvents.slice(0, 2).map(event => (
              <div
                key={event.id}
                className={`
                  text-xs p-1 rounded truncate cursor-pointer
                  ${event.status === 'scheduled' 
                    ? 'bg-blue-100 text-blue-800 border-l-2 border-blue-500' 
                    : 'bg-gray-100 text-gray-600 border-l-2 border-gray-400'
                  }
                  hover:bg-opacity-80
                `}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDay(currentDay);
                }}
              >
                {event.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-muted-foreground font-medium">
                +{dayEvents.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
      day = addDays(day, 1);
    }

    return days;
  };

  const selectedDayEvents = selectedDay ? getDayEvents(selectedDay) : [];

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={previousMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={nextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-card rounded-lg shadow border">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground border-r last:border-r-0">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {renderCalendarDays()}
        </div>
      </div>

      {/* Day Events Modal */}
      {selectedDay && (
        <Dialog open={!!selectedDay} onOpenChange={() => setSelectedDay(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Events for {format(selectedDay, 'EEEE, MMMM d, yyyy')}
              </DialogTitle>
            </DialogHeader>
            
            {selectedDayEvents.length > 0 ? (
              <ScrollArea className="max-h-[400px]">
                <div className="space-y-4">
                  {selectedDayEvents.map(event => (
                    <EventCard key={event.id} event={event} onDelete={onEventDeleted} />
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No events scheduled for this date
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
