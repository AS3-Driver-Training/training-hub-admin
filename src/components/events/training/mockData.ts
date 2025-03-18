
import { TrainingEvent } from "@/types/events";

export const MOCK_EVENTS: TrainingEvent[] = [
  {
    id: "1",
    title: "Accelerated [Counter-Ambush] Driving Course",
    location: "Weather Tech Laguna Seca International Raceway",
    startDate: "2025-09-20T09:00:00",
    endDate: "2025-09-21T17:00:00",
    status: "scheduled",
    capacity: 16,
    enrolledCount: 1
  },
  {
    id: "2",
    title: "Advanced [Counter-Ambush] Driving Course",
    location: "Weather Tech Laguna Seca International Raceway",
    startDate: "2025-02-26T09:00:00",
    endDate: "2025-02-27T17:00:00",
    status: "scheduled",
    capacity: 16,
    enrolledCount: 0
  },
  {
    id: "3",
    title: "Basic Emergency Response Training",
    location: "Regional Training Center",
    startDate: "2024-07-15T09:00:00",
    endDate: "2024-07-15T17:00:00",
    status: "scheduled",
    capacity: 24,
    enrolledCount: 12
  }
];
