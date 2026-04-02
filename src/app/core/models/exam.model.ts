export interface ExamResponse {
  id: string;
  studentId: string;
  type: string;
  date: string;
  status?: string;
  result?: string;
  score?: number;
  notes?: string;
}

export interface ExtendedExamResponse extends ExamResponse {
  studentName?: string;
}
