import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ExtendedSessionResponse as Session } from '../../../core/models/session.model';

@Component({
  selector: 'app-student-sessions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative min-h-[500px]">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-white">Mes Séances</h1>
          <p class="text-sm mt-1" style="color: var(--color-text-muted)">Consultez votre planning de conduite</p>
        </div>
      </div>

      <div *ngIf="isLoading" class="flex justify-center py-20">
        <svg class="w-8 h-8 animate-spin" style="color: var(--color-accent)" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      </div>

      <div *ngIf="!isLoading && sessions.length > 0" class="rounded-2xl overflow-hidden border" style="background: var(--color-surface); border-color: var(--color-border)">
        <table class="w-full text-sm">
          <thead>
            <tr style="background: var(--color-surface-2)">
              <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">Date & Heure</th>
              <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">Moniteur</th>
              <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">Statut</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let s of sessions" class="border-t hover:bg-white/5 transition-colors" style="border-color: var(--color-border)">
              <td class="px-5 py-4">
                <div class="font-medium text-white">{{ s.sessionDate | date:'dd/MM/yyyy' }}</div>
                <div class="text-xs" style="color: var(--color-text-muted)">{{ s.startTime }} - {{ s.endTime }}</div>
              </td>
              <td class="px-5 py-4">
                <div class="flex items-center gap-2">
                  <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-inner"
                       style="background: linear-gradient(135deg, #f59e0b, #ef4444)">
                     {{ s.monitorName?.charAt(0) || s.monitorId.charAt(0) || 'M' }}
                  </div>
                  <span class="font-medium text-white">
                    {{ s.monitorName || (s.monitorId ? ('Moniteur ' + s.monitorId.substring(0, 8)) : 'Moniteur') }}
                  </span>
                </div>
              </td>
              <td class="px-5 py-4">
                <span class="px-2 py-1.5 rounded-full text-xs font-medium"
                      [ngStyle]="{'background': s.status === 'COMPLETED' ? 'rgba(34,197,94,0.15)' : 'rgba(56,189,248,0.15)', 'color': s.status === 'COMPLETED' ? '#4ade80' : '#38bdf8'}">
                  {{ s.status === 'COMPLETED' ? 'Terminée' : 'Planifiée' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty state -->
      <div *ngIf="!isLoading && sessions.length === 0" class="rounded-2xl p-12 text-center border" style="background: var(--color-surface); border-color: var(--color-border)">
        <div class="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4" style="background: rgba(79,70,229,0.15)">📅</div>
        <h3 class="text-lg font-bold text-white mb-2">Aucune séance à venir</h3>
        <p class="text-sm max-w-md mx-auto" style="color: var(--color-text-muted)">
          Vous n'avez pas encore de séance planifiée.
        </p>
      </div>
    </div>
  `
})
export class SessionsComponent implements OnInit {
  sessions: Session[] = [];
  isLoading = true;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any>(`${environment.apiUrl}/profile/me`).subscribe({
      next: (profile) => {
        if (profile.studentId) {
          this.loadSessions(profile.studentId);
        } else {
          this.isLoading = false;
        }
      },
      error: () => this.isLoading = false
    });
  }

  loadSessions(studentId: string) {
    this.http.get<Session[]>(`${environment.apiUrl}/student/sessions?studentId=${studentId}`).subscribe({
      next: (data) => {
        this.sessions = data.sort((a,b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime());
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }
}
