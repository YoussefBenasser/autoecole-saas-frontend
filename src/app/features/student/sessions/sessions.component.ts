import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface SessionItem {
  id: string;
  monitorId: string;
  studentIds: string[];
  sessionDate: string;
  startTime: string;
  endTime: string;
  status: string;
  type?: string;
  notes?: string;
  // enriched
  monitorName?: string;
}

@Component({
  selector: 'app-student-sessions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative min-h-[500px]">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-white">Mes Séances</h1>
          <p class="text-sm mt-1" style="color: var(--color-text-muted)">Consultez votre planning de conduite</p>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading" class="flex justify-center py-20">
        <svg class="w-8 h-8 animate-spin" style="color: var(--color-accent)" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      </div>

      <ng-container *ngIf="!isLoading">
        <!-- Error -->
        <div *ngIf="errorMsg" class="mb-4 px-4 py-3 rounded-xl text-sm"
             style="background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #f87171">
          ⚠️ {{ errorMsg }}
        </div>

        <!-- ===== UPCOMING SESSIONS ===== -->
        <div *ngIf="upcomingSessions.length > 0" class="mb-8">
          <div class="flex items-center gap-2 mb-3">
            <span class="text-sm font-semibold uppercase tracking-wider" style="color: #38bdf8">🚀 À venir</span>
            <span class="px-2 py-0.5 rounded-full text-xs font-bold"
                  style="background: rgba(56,189,248,0.15); color: #38bdf8">{{ upcomingSessions.length }}</span>
          </div>
          <div class="rounded-2xl overflow-hidden border" style="background: var(--color-surface); border-color: var(--color-border)">
            <table class="w-full text-sm">
              <thead>
                <tr style="background: var(--color-surface-2)">
                  <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">Date &amp; Heure</th>
                  <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">Type</th>
                  <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">Moniteur</th>
                  <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">Statut</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let s of upcomingSessions"
                    class="border-t hover:bg-white/5 transition-colors"
                    style="border-color: var(--color-border)">
                  <td class="px-5 py-4">
                    <div class="font-medium text-white">{{ formatDate(s.sessionDate) }}</div>
                    <div class="text-xs mt-0.5" style="color: var(--color-text-muted)">{{ formatTime(s.startTime) }} – {{ formatTime(s.endTime) }}</div>
                  </td>
                  <td class="px-5 py-4">
                    <span class="px-2 py-1 rounded-full text-xs font-medium"
                          [ngStyle]="s.type === 'théorie'
                            ? {'background':'rgba(168,85,247,0.15)','color':'#c084fc'}
                            : {'background':'rgba(20,184,166,0.15)','color':'#2dd4bf'}">
                      {{ s.type === 'théorie' ? '📖 Théorie' : '🚗 Pratique' }}
                    </span>
                  </td>
                  <td class="px-5 py-4">
                    <div class="flex items-center gap-2">
                      <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                           style="background: linear-gradient(135deg, #f59e0b, #ef4444)">
                        {{ getMonitorInitial(s) }}
                      </div>
                      <span class="font-medium text-white">{{ getMonitorLabel(s) }}</span>
                    </div>
                  </td>
                  <td class="px-5 py-4">
                    <span class="px-2 py-1.5 rounded-full text-xs font-medium"
                          style="background: rgba(56,189,248,0.15); color: #38bdf8">
                      ⏳ Planifiée
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ===== PAST SESSIONS ===== -->
        <div *ngIf="pastSessions.length > 0">
          <div class="flex items-center gap-2 mb-3">
            <span class="text-sm font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">📋 Passées</span>
            <span class="px-2 py-0.5 rounded-full text-xs font-bold"
                  style="background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.55)">{{ pastSessions.length }}</span>
          </div>
          <div class="rounded-2xl overflow-hidden border" style="background: var(--color-surface); border-color: var(--color-border)">
            <table class="w-full text-sm">
              <thead>
                <tr style="background: var(--color-surface-2)">
                  <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">Date &amp; Heure</th>
                  <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">Type</th>
                  <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">Moniteur</th>
                  <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">Statut</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let s of pastSessions"
                    class="border-t hover:bg-white/5 transition-colors"
                    style="border-color: var(--color-border)">
                  <td class="px-5 py-4">
                    <div class="font-medium" style="color: rgba(255,255,255,0.7)">{{ formatDate(s.sessionDate) }}</div>
                    <div class="text-xs mt-0.5" style="color: var(--color-text-muted)">{{ formatTime(s.startTime) }} – {{ formatTime(s.endTime) }}</div>
                  </td>
                  <td class="px-5 py-4">
                    <span class="px-2 py-1 rounded-full text-xs font-medium"
                          style="background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.45)">
                      {{ s.type === 'théorie' ? '📖 Théorie' : '🚗 Pratique' }}
                    </span>
                  </td>
                  <td class="px-5 py-4">
                    <div class="flex items-center gap-2">
                      <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                           style="background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.5)">
                        {{ getMonitorInitial(s) }}
                      </div>
                      <span style="color: rgba(255,255,255,0.6)">{{ getMonitorLabel(s) }}</span>
                    </div>
                  </td>
                  <td class="px-5 py-4">
                    <span class="px-2 py-1.5 rounded-full text-xs font-medium"
                          [ngStyle]="s.status === 'COMPLETED'
                            ? {'background':'rgba(34,197,94,0.15)','color':'#4ade80'}
                            : {'background':'rgba(239,68,68,0.15)','color':'#f87171'}">
                      {{ s.status === 'COMPLETED' ? '✅ Terminée' : '❌ Annulée' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Empty state -->
        <div *ngIf="sessions.length === 0"
             class="rounded-2xl p-12 text-center border" style="background: var(--color-surface); border-color: var(--color-border)">
          <div class="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4" style="background: rgba(79,70,229,0.15)">📅</div>
          <h3 class="text-lg font-bold text-white mb-2">Aucune séance à venir</h3>
          <p class="text-sm max-w-md mx-auto" style="color: var(--color-text-muted)">
            Vous n'avez pas encore de séance planifiée. Votre moniteur planifiera bientôt vos premiers cours.
          </p>
        </div>
      </ng-container>
    </div>
  `
})
export class SessionsComponent implements OnInit {
  sessions: SessionItem[] = [];
  isLoading = true;
  errorMsg = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any>(`${environment.apiUrl}/profile/me`).subscribe({
      next: (profile) => {
        if (profile.studentId) {
          this.loadSessions(profile.studentId);
        } else {
          this.errorMsg = 'Profil élève introuvable. Vérifiez votre compte.';
          this.isLoading = false;
        }
      },
      error: () => {
        this.errorMsg = 'Impossible de récupérer le profil. Vérifiez votre connexion.';
        this.isLoading = false;
      }
    });
  }

  loadSessions(studentId: string): void {
    this.http.get<SessionItem[]>(`${environment.apiUrl}/student/sessions?studentId=${studentId}`).subscribe({
      next: (data) => {
        // Sort ascending by date, then time
        this.sessions = data.sort((a, b) => {
          const dateCompare = new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime();
          if (dateCompare !== 0) return dateCompare;
          return (a.startTime || '').localeCompare(b.startTime || '');
        });
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMsg = 'Erreur lors du chargement des séances: ' + (err.error?.message || err.message || 'Erreur inconnue');
        this.isLoading = false;
      }
    });
  }

  get upcomingSessions(): SessionItem[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.sessions.filter(s => {
      const d = new Date(s.sessionDate + 'T00:00:00');
      return d >= today && s.status === 'PLANNED';
    });
  }

  get pastSessions(): SessionItem[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.sessions.filter(s => {
      const d = new Date(s.sessionDate + 'T00:00:00');
      return d < today || s.status !== 'PLANNED';
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return dateStr; }
  }

  formatTime(timeStr: string): string {
    if (!timeStr) return '—';
    const parts = timeStr.split(':');
    return `${parts[0]}:${parts[1]}`;
  }

  getMonitorInitial(s: SessionItem): string {
    if (s.monitorName) return s.monitorName.charAt(0).toUpperCase();
    if (s.monitorId) return s.monitorId.charAt(0).toUpperCase();
    return 'M';
  }

  getMonitorLabel(s: SessionItem): string {
    if (s.monitorName) return s.monitorName;
    if (s.monitorId) return 'Moniteur ' + s.monitorId.substring(0, 8) + '…';
    return 'Moniteur';
  }
}
