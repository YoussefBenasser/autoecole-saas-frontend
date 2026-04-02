import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { SessionResponse as Session } from '../../../core/models/session.model';

@Component({
  selector: 'app-monitor-sessions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative min-h-[500px]">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-white">Mon Planning</h1>
          <p class="text-sm mt-1" style="color: var(--color-text-muted)">Vos séances de conduite assignées.</p>
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
              <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">Élève(s)</th>
              <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">Statut</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let s of sessions" class="border-t hover:bg-white/5 transition-colors" style="border-color: var(--color-border)">
              <td class="px-5 py-4">
                <div class="font-medium text-white">{{ s.sessionDate | date:'dd/MM/yyyy' }}</div>
                <div class="text-xs" style="color: var(--color-text-muted)">{{ s.startTime }} - {{ s.endTime }}</div>
              </td>
              <td class="px-5 py-4" style="color: var(--color-text-muted)">
                <span *ngFor="let id of s.studentIds; let last = last">
                  <span class="text-white font-medium">{{ id.substring(0, 8) }}</span>{{ !last ? ', ' : '' }}
                </span>
                <span *ngIf="!s.studentIds || s.studentIds.length === 0">—</span>
              </td>
              <td class="px-5 py-4">
                <span class="px-2 py-1.5 rounded-full text-xs font-medium"
                      [ngStyle]="{'background': s.status === 'COMPLETED' ? 'rgba(34,197,94,0.15)' : s.status === 'CANCELLED' ? 'rgba(239,68,68,0.15)' : 'rgba(20,184,166,0.15)', 'color': s.status === 'COMPLETED' ? '#4ade80' : s.status === 'CANCELLED' ? '#f87171' : '#2dd4bf'}">
                  {{ s.status === 'COMPLETED' ? 'Terminée' : s.status === 'CANCELLED' ? 'Annulée' : 'Planifiée' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty state -->
      <div *ngIf="!isLoading && sessions.length === 0" class="rounded-2xl p-12 text-center border" style="background: var(--color-surface); border-color: var(--color-border)">
        <div class="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4" style="background: rgba(20,184,166,0.15)">🗓️</div>
        <h3 class="text-lg font-bold text-white mb-2">Aucun créneau prévu</h3>
        <p class="text-sm max-w-md mx-auto" style="color: var(--color-text-muted)">
          Vous n'avez pas de séance affectée pour le moment.
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
        if (profile.monitorId) {
          this.loadSessions(profile.monitorId);
        } else {
          this.isLoading = false;
        }
      },
      error: () => this.isLoading = false
    });
  }

  loadSessions(monitorId: string) {
    this.http.get<Session[]>(`${environment.apiUrl}/monitor/sessions?monitorId=${monitorId}`).subscribe({
      next: (data) => {
        this.sessions = data.sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime());
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }
}
