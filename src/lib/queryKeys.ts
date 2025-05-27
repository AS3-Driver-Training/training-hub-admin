
// Standardized query key factory to prevent cache invalidation issues
export const queryKeys = {
  // Training Events
  trainingEvents: () => ['training-events'],
  
  // Course Instances
  courseInstance: (id: string) => ['courseInstance', id],
  courseAllocations: (id: string) => ['courseAllocations', id],
  
  // Client Events
  clientEvents: (clientId: string) => ['client-events', clientId],
  
  // Clients
  clients: () => ['clients'],
  
  // Venues
  venues: () => ['venues'],
  
  // Programs
  programs: () => ['programs'],
  
  // Students
  students: () => ['students'],
  clientStudents: (clientId: string) => ['client-students', clientId],
  
  // Course Closure
  eventCardClosure: (courseInstanceId: number) => ['event-card-closure', courseInstanceId],
  
  // General invalidation patterns
  all: () => ['*'],
  invalidateTrainingData: () => [
    'training-events',
    'courseInstance',
    'courseAllocations',
    'client-events'
  ]
} as const;
