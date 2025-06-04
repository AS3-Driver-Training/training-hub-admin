
// Standardized query key factory to prevent cache invalidation issues
export const queryKeys = {
  // Training Events
  trainingEvents: () => ['training-events'],
  
  // Course Instances
  courseInstance: (id: string) => ['courseInstance', id],
  courseAllocations: (id: string) => ['courseAllocations', id],
  
  // Client Events
  clientEvents: (clientId: string) => ['client-events', clientId],
  
  // Clients - standardized key pattern
  clients: () => ['clients'],
  client: (clientId: string) => ['client', clientId],
  
  // User Client Data - for getting client ID from user
  userClientData: () => ['user_client_data'],
  userClientDataGroups: () => ['user_client_data_groups'],
  
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
  ],
  invalidateClientData: (clientId: string) => [
    ['client', clientId],
    ['user_client_data'],
    ['user_client_data_groups']
  ]
} as const;
