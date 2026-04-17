import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { ExamResponse as Exam } from '../../../core/models/exam.model';

@Component({
  selector: 'app-student-exams',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="exams-container">
      <div class="header-section">
        <h1 class="main-title">Mes Examens</h1>
        <p class="subtitle">Consultez les dates et les résultats de vos examens</p>
      </div>

      <div *ngIf="isLoading" class="loading-state">
        <svg class="spinner" style="color: var(--color-accent)" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      </div>

      <!-- Official Exam Highlight -->
      <div *ngIf="nextOfficialExam && !isLoading" class="official-exam-card">
        <div class="exam-icon">⚠️</div>
        <div class="exam-content">
          <h2 class="exam-title">Examen Officiel Planifié</h2>
          <p class="exam-message">
            Vous êtes convoqué pour un examen <strong>{{ nextOfficialExam.type.toLowerCase() === 'driving' ? 'Pratique' : 'Théorique (Code)' }}</strong> 
            le <span class="font-bold">{{ nextOfficialExam.date | date:'dd/MM/yyyy' }}</span>.
            Préparez-vous bien !
          </p>
        </div>
        <div class="exam-action" *ngIf="nextOfficialExam.type.toLowerCase() !== 'driving'">
           <a routerLink="/student/theoretical-exam" class="exam-btn">
              📝 Passer l'examen
           </a>
        </div>
      </div>

      <div *ngIf="!isLoading && exams.length > 0" class="table-container">
        <table class="exams-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Date</th>
              <th>Statut</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let e of exams" class="exam-row">
              <td class="type-cell">
                <div class="type-content">
                  <span class="type-emoji">{{ e.type.toLowerCase() === 'driving' ? '🚗' : '📝' }}</span>
                  <span class="type-label">{{ e.type.toLowerCase() === 'driving' ? 'Pratique' : 'Théorique' }}</span>
                </div>
              </td>
              <td class="date-cell">{{ e.date | date:'dd/MM/yyyy' }}</td>
              <td class="status-cell">
                <span class="status-badge" [ngClass]="getStatusClass(e)">
                  {{ getStatusText(e) }}
                </span>
              </td>
              <td class="score-cell">{{ e.score != null ? e.score : '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="!isLoading && exams.length === 0" class="empty-state">
        <div class="empty-icon">🎓</div>
        <h3 class="empty-title">Aucun examen prévu</h3>
        <p class="empty-text">
          Vous n'avez pas encore d'examen planifié.
        </p>
      </div>
    </div>
  `,
  styles: [`
    .exams-container {
      padding: 2rem;
      animation: fadeIn 0.3s ease-in-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Header */
    .header-section {
      margin-bottom: 2.5rem;
      animation: slideDown 0.4s ease-out;
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .main-title {
      font-size: 2rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 0.5rem;
      letter-spacing: -0.01em;
    }

    .subtitle {
      font-size: 0.95rem;
      color: var(--color-text-muted);
      margin: 0;
      opacity: 0.9;
    }

    /* Loading State */
    .loading-state {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3rem;
    }

    .spinner {
      width: 2rem;
      height: 2rem;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Official Exam Card */
    .official-exam-card {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding: 1.5rem;
      border-radius: 1.25rem;
      margin-bottom: 2rem;
      background: linear-gradient(135deg, rgba(234, 179, 8, 0.12), rgba(234, 179, 8, 0.03));
      border: 1px solid rgba(234, 179, 8, 0.3);
      animation: slideDown 0.3s ease-out;
    }

    .exam-icon {
      font-size: 3rem;
      flex-shrink: 0;
    }

    .exam-content {
      flex: 1;
    }

    .exam-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: #facc15;
      margin: 0 0 0.5rem;
    }

    .exam-message {
      margin: 0;
      color: #ffffff;
      font-size: 0.95rem;
    }

    .exam-action {
      flex-shrink: 0;
      display: flex;
      align-items: center;
    }

    .exam-btn {
      padding: 0.65rem 1.25rem;
      border-radius: 0.75rem;
      background: #facc15;
      color: #1a1a1a;
      font-weight: 700;
      font-size: 0.9rem;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: inline-block;
      white-space: nowrap;
    }

    .exam-btn:hover {
      background: #eab308;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(250, 204, 21, 0.3);
    }

    /* Table Container */
    .table-container {
      border-radius: 1.25rem;
      overflow: hidden;
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.6) 100%);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      overflow-x: auto;
      animation: slideUp 0.4s ease-out;
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Table Styling */
    .exams-table {
      width: 100%;
      border-collapse: collapse;
      min-width: 600px;
      font-size: 0.9rem;
    }

    .exams-table thead {
      background: linear-gradient(135deg, rgba(51, 65, 85, 0.4) 0%, rgba(51, 65, 85, 0.2) 100%);
    }

    .exams-table th {
      padding: 1rem 1.5rem;
      text-align: left;
      color: var(--color-text-muted);
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .exam-row {
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      transition: background 0.2s ease;
    }

    .exam-row:hover {
      background: rgba(255, 255, 255, 0.03);
    }

    .exams-table td {
      padding: 1rem 1.5rem;
      color: var(--color-text);
    }

    .type-cell {
      min-width: 150px;
    }

    .type-content {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .type-emoji {
      font-size: 1.1rem;
    }

    .type-label {
      font-weight: 600;
      color: #ffffff;
    }

    .date-cell {
      color: #ffffff;
      font-weight: 500;
    }

    .status-cell {
      min-width: 160px;
    }

    .status-badge {
      display: inline-block;
      padding: 0.5rem 0.875rem;
      border-radius: 0.625rem;
      font-size: 0.75rem;
      font-weight: 600;
      white-space: nowrap;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .status-badge.scheduled {
      background: linear-gradient(135deg, rgba(234, 179, 8, 0.15), rgba(234, 179, 8, 0.05));
      color: #facc15;
      border-color: rgba(234, 179, 8, 0.2);
    }

    .status-badge.passed {
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05));
      color: #4ade80;
      border-color: rgba(34, 197, 94, 0.2);
    }

    .status-badge.failed {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05));
      color: #f87171;
      border-color: rgba(239, 68, 68, 0.2);
    }

    .score-cell {
      text-align: center;
      font-weight: 600;
      color: #ffffff;
    }

    /* Empty State */
    .empty-state {
      padding: 3rem;
      text-align: center;
      border-radius: 1.25rem;
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.6) 100%);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      animation: slideUp 0.4s ease-out;
    }

    .empty-icon {
      font-size: 3.5rem;
      margin-bottom: 1rem;
      display: block;
    }

    .empty-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 0.5rem;
    }

    .empty-text {
      color: var(--color-text-muted);
      margin: 0;
      font-size: 0.95rem;
    }

    @media (max-width: 768px) {
      .exams-container {
        padding: 1rem;
      }

      .main-title {
        font-size: 1.5rem;
      }

      .official-exam-card {
        flex-direction: column;
        text-align: center;
      }

      .exam-action {
        width: 100%;
        justify-content: center;
      }

      .exam-btn {
        width: 100%;
      }
    }
  `]
})
export class ExamsComponent implements OnInit {
  exams: Exam[] = [];
  isLoading = true;
  nextOfficialExam: Exam | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any>(`${environment.apiUrl}/profile/me`).subscribe({
      next: (profile) => {
        if (profile.studentId) {
          this.loadExams(profile.studentId);
        } else {
          this.isLoading = false;
        }
      },
      error: () => this.isLoading = false
    });
  }

  loadExams(studentId: string) {
    this.http.get<Exam[]>(`${environment.apiUrl}/exams/student/${studentId}`).subscribe({
      next: (data) => {
        this.exams = data.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        // Find the next scheduled exam
        this.nextOfficialExam = this.exams.find(e => e.status === 'SCHEDULED' && new Date(e.date) >= new Date()) || null;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  getStatusText(exam: Exam): string {
    if (exam.status === 'SCHEDULED') return 'Planifié';
    if (exam.status === 'COMPLETED') {
      return exam.result === 'PASS' ? 'Réussi' : 'Échoué';
    }
    return 'Annulé';
  }

  getStatusClass(exam: Exam): string {
    if (exam.status === 'SCHEDULED') return 'scheduled';
    if (exam.status === 'COMPLETED') {
      return exam.result === 'PASS' ? 'passed' : 'failed';
    }
    return 'scheduled';
  }
}
