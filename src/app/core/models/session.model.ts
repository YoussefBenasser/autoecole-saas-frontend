export interface SessionResponse {
  id: string;
  monitorId: string;
  studentIds: string[];
  sessionDate: string;   // ISO date string e.g. "2026-01-12"
  startTime: string;     // Time string e.g. "14:00:00"
  endTime: string;       // Time string e.g. "15:00:00"
  status: string;        // "PLANNED" | "COMPLETED" | "CANCELLED"
  type?: string;         // optional: "pratique" | "théorie"
  notes?: string;
}

export interface ExtendedSessionResponse extends SessionResponse {
  monitorName?: string;
  studentNames?: string[];
}
