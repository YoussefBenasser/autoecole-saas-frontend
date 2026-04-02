export interface SessionResponse {
  id: string;
  monitorId: string;
  studentIds: string[];
  sessionDate: string;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string;
}

export interface ExtendedSessionResponse extends SessionResponse {
  monitorName?: string;
  studentNames?: string[];
}
