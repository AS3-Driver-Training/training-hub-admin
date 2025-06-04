
import { AS3ProgramCard } from "./AS3ProgramCard";
import { ProgramWithInstances, CourseInstance } from "./hooks/useAS3Programs";

interface AS3ProgramsGridProps {
  programs: ProgramWithInstances[] | undefined;
  onInquiry: (program: ProgramWithInstances) => void;
  onEnrollment: (program: ProgramWithInstances, instance: CourseInstance) => void;
}

export function AS3ProgramsGrid({ programs, onInquiry, onEnrollment }: AS3ProgramsGridProps) {
  if (!programs || programs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No AS3 programs available at this time.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {programs.map((program) => (
        <AS3ProgramCard
          key={program.id}
          program={program}
          onInquiry={onInquiry}
          onEnrollment={onEnrollment}
        />
      ))}
    </div>
  );
}
