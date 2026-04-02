import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ExamResponse as Exam } from '../../../core/models/exam.model';

@Component({
  selector: 'app-student-exams',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative min-h-[500px]">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-white">Mes Examens</h1>
          <p class="text-sm mt-1" style="color: var(--color-text-muted)">Consultez les dates et les résultats de vos examens</p>
        </div>
      </div>

      <div *ngIf="isLoading" class="flex justify-center py-20">
        <svg class="w-8 h-8 animate-spin" style="color: var(--color-accent)" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      </div>

      <div *ngIf="!isLoading && exams.length > 0" class="rounded-2xl overflow-hidden border" style="background: var(--color-surface); border-color: var(--color-border)">
        <table class="w-full text-sm">
          <thead>
            <tr style="background: var(--color-surface-2)">
              <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">Type</th>
              <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">Date</th>
              <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">Statut</th>
              <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">Score</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let e of exams" class="border-t hover:bg-white/5 transition-colors" style="border-color: var(--color-border)">
              <td class="px-5 py-4">
                <div class="flex items-center gap-2">
                  <span class="text-lg">{{ e.type.toLowerCase() === 'driving' ? '🚗' : '📝' }}</span>
                  <span class="font-medium text-white">{{ e.type.toLowerCase() === 'driving' ? 'Pratique' : 'Théorique' }}</span>
                </div>
              </td>
              <td class="px-5 py-4 text-white">{{ e.date | date:'dd/MM/yyyy' }}</td>
              <td class="px-5 py-4">
                <span class="px-2 py-1.5 rounded-full text-xs font-medium"
                      [ngStyle]="{
                        'background': e.status === 'SCHEDULED' ? 'rgba(234,179,8,0.15)' : (e.result === 'PASS' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'),
                        'color': e.status === 'SCHEDULED' ? '#facc15' : (e.result === 'PASS' ? '#4ade80' : '#f87171')
                      }">
                  {{ getStatusText(e) }}
                </span>
              </td>
              <td class="px-5 py-4 text-white font-medium">{{ e.score != null ? e.score : '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="!isLoading && exams.length === 0" class="rounded-2xl p-12 text-center border" style="background: var(--color-surface); border-color: var(--color-border)">
        <div class="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4" style="background: rgba(168,85,247,0.15)">🎓</div>
        <h3 class="text-lg font-bold text-white mb-2">Aucun examen prévu</h3>
        <p class="text-sm max-w-md mx-auto" style="color: var(--color-text-muted)">
          Vous n'avez pas encore d'examen planifié.
        </p>
      </div>
    </div>
  `
})
export class ExamsComponent implements OnInit {
  exams: Exam[] = [];
  isLoading = true;

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
}
