import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Exam {
  id: number;
  type: string;
  date: string;
  studentName?: string;
  result?: string;
  status?: string;
}

@Component({
  selector: 'app-exams',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-white">Examens</h1>
        <p class="text-sm mt-1" style="color: var(--color-text-muted)">Planification et résultats des examens</p>
      </div>

      <div *ngIf="isLoading" class="flex justify-center py-20">
        <svg class="w-8 h-8 animate-spin" style="color: var(--color-warning)" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      </div>

      <div *ngIf="!isLoading" class="rounded-2xl overflow-hidden border" style="background: var(--color-surface); border-color: var(--color-border)">
        <table class="w-full text-sm">
          <thead>
            <tr style="background: var(--color-surface-2)">
              <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">Type</th>
              <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">Élève</th>
              <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">Date</th>
              <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">Résultat</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let e of exams" class="border-t hover:bg-white/5 transition-colors" style="border-color: var(--color-border)">
              <td class="px-5 py-4">
                <span class="px-2 py-1 rounded-full text-xs font-medium" style="background: rgba(245,158,11,0.15); color: var(--color-warning)">
                  {{ e.type }}
                </span>
              </td>
              <td class="px-5 py-4 font-medium text-white">{{ e.studentName || '—' }}</td>
              <td class="px-5 py-4" style="color: var(--color-text-muted)">{{ e.date | date:'dd/MM/yyyy' }}</td>
              <td class="px-5 py-4">
                <span *ngIf="e.result" class="px-2 py-1 rounded-full text-xs font-semibold"
                      [style.background]="e.result === 'PASSED' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'"
                      [style.color]="e.result === 'PASSED' ? 'var(--color-success)' : 'var(--color-danger)'">
                  {{ e.result === 'PASSED' ? 'Reçu' : 'Échoué' }}
                </span>
                <span *ngIf="!e.result" class="text-xs" style="color: var(--color-text-muted)">En attente</span>
              </td>
            </tr>
            <tr *ngIf="exams.length === 0">
              <td colspan="4" class="px-5 py-12 text-center text-sm" style="color: var(--color-text-muted)">Aucun examen planifié.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class ExamsComponent implements OnInit {
  exams: Exam[] = [];
  isLoading = true;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<Exam[]>(`${environment.apiUrl}/exams`).subscribe({
      next: (data) => { this.exams = data; this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }
}
