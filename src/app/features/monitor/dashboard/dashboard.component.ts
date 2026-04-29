import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { SessionResponse as Session } from '../../../core/models/session.model';

@Component({
  selector: 'app-monitor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  styleUrls: ['../../tenant/dashboard/dashboard.component.css'],
  template: `
    <div class="dashboard-container relative">
      <div class="header">
        <div class="header-content">
          <div>
            <h1 class="header-title">Bonjour !</h1>
            <p class="header-subtitle">Aperçu de votre planning de conduite.</p>
          </div>
          <div class="header-actions">
            <div class="date-display">
              <svg class="calendar-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span class="current-date">{{ today }}</span>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="isLoading" class="flex justify-center py-20">
        <svg class="w-8 h-8 animate-spin" style="color: var(--color-accent)" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      </div>

      <div *ngIf="!isLoading">
        <div class="stats-overview">
          <!-- Next Session Card -->
          <div class="stat-card" style="cursor: default;">
            <div class="stat-header">
              <div class="stat-icon" style="background: rgba(20,184,166,0.15)">🕒</div>
              <h3 class="stat-title">Prochaine séance</h3>
            </div>
            <div *ngIf="nextSession">
              <p class="stat-value" style="font-size: 2rem;">{{ nextSession.sessionDate | date:'dd/MM/yyyy' }}</p>
              <p style="color: rgba(255,255,255,0.8); font-size: 0.9rem; margin-top: 0.5rem;">{{ nextSession.startTime }} - {{ nextSession.endTime }}</p>
              <p style="color: rgba(255,255,255,0.8); font-size: 0.9rem; margin-top: 0.25rem;" *ngIf="getStudentNames(nextSession).length > 0">
                Avec : <span style="color: white; font-weight: 500;">{{ getStudentNames(nextSession).join(', ') }}</span>
              </p>
            </div>
            <p *ngIf="!nextSession" style="color: rgba(255,255,255,0.6); font-size: 0.9rem; font-style: italic;">Aucune séance planifiée.</p>
            <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.1);">
              <a routerLink="/monitor/sessions" style="color: #2dd4bf; font-size: 0.9rem; font-weight: 500; text-decoration: none; display: flex; align-items: center; gap: 0.25rem;">
                Voir le planning <span>→</span>
              </a>
            </div>
          </div>

          <!-- Stats Card -->
          <div class="stat-card" style="cursor: default;">
            <div class="stat-header">
              <div class="stat-icon" style="background: rgba(249,115,22,0.15)">🚗</div>
              <h3 class="stat-title">Mes Séances</h3>
            </div>
            <p class="stat-value" style="font-size: 2.5rem;">{{ totalSessions }}</p>
            <p style="color: rgba(255,255,255,0.8); font-size: 0.9rem; margin-top: 0.5rem;">{{ upcomingSessions }} à venir · {{ completedSessions }} terminée(s)</p>

            <!-- Mini stats grid -->
            <div style="margin-top: 1rem; display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem;">
              <div style="border-radius: 0.75rem; padding: 0.5rem; text-align: center; background: rgba(56,189,248,0.08);">
                <p style="font-size: 1.125rem; font-weight: 700; color: white; margin: 0;">{{ upcomingSessions }}</p>
                <p style="font-size: 0.75rem; color: rgba(255,255,255,0.6); margin: 0;">À venir</p>
              </div>
              <div style="border-radius: 0.75rem; padding: 0.5rem; text-align: center; background: rgba(34,197,94,0.08);">
                <p style="font-size: 1.125rem; font-weight: 700; color: white; margin: 0;">{{ completedSessions }}</p>
                <p style="font-size: 0.75rem; color: rgba(255,255,255,0.6); margin: 0;">Terminées</p>
              </div>
              <div style="border-radius: 0.75rem; padding: 0.5rem; text-align: center; background: rgba(239,68,68,0.08);">
                <p style="font-size: 1.125rem; font-weight: 700; color: white; margin: 0;">{{ cancelledSessions }}</p>
                <p style="font-size: 0.75rem; color: rgba(255,255,255,0.6); margin: 0;">Annulées</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Upcoming Sessions List -->
        <div *ngIf="upcomingSessionsList.length > 0" class="recent-tenants">
          <div class="section-header">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <h2 class="section-title">Séances à venir</h2>
              <a routerLink="/monitor/sessions" style="color:#2dd4bf; text-decoration:none; font-size:0.95rem; font-weight:600;">Voir tout →</a>
            </div>
          </div>
          <div style="padding: 0;">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
              <thead>
                <tr>
                  <th style="padding: 1rem 2rem; font-weight: 600; color: rgba(255, 255, 255, 0.9); background: rgba(255, 255, 255, 0.05); font-size: 0.9rem; text-transform: uppercase;">Date & Heure</th>
                  <th style="padding: 1rem 2rem; font-weight: 600; color: rgba(255, 255, 255, 0.9); background: rgba(255, 255, 255, 0.05); font-size: 0.9rem; text-transform: uppercase;">Élève(s)</th>
                  <th style="padding: 1rem 2rem; font-weight: 600; color: rgba(255, 255, 255, 0.9); background: rgba(255, 255, 255, 0.05); font-size: 0.9rem; text-transform: uppercase;">Statut</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let s of upcomingSessionsList.slice(0, 5)" style="border-top: 1px solid rgba(255, 255, 255, 0.08); transition: all 0.2s ease;">
                  <td style="padding: 1rem 2rem;">
                    <div style="font-weight: 600; color: white;">{{ s.sessionDate | date:'dd/MM/yyyy' }}</div>
                    <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-top: 0.25rem;">{{ formatTime(s.startTime) }} – {{ formatTime(s.endTime) }}</div>
                  </td>
                  <td style="padding: 1rem 2rem; color: rgba(255, 255, 255, 0.9); font-size: 0.9rem;">
                    <span *ngIf="getStudentNames(s).length > 0">{{ getStudentNames(s).join(', ') }}</span>
                    <span *ngIf="getStudentNames(s).length === 0 && (s.studentIds || []).length > 0">{{ (s.studentIds || []).length }} élève(s)</span>
                    <span *ngIf="!s.studentIds || s.studentIds.length === 0" style="opacity: 0.5">—</span>
                  </td>
                  <td style="padding: 1rem 2rem;">
                    <span class="status-badge" style="background: rgba(56,189,248,0.2); color: #38bdf8; border: 1px solid rgba(56,189,248,0.3);">
                      ⏳ Planifiée
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  profile: any = null;
  nextSession: Session | null = null;
  totalSessions = 0;
  upcomingSessions = 0;
  completedSessions = 0;
  cancelledSessions = 0;
  upcomingSessionsList: Session[] = [];
  isLoading = true;
  today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/profile/me`).subscribe({
      next: (profile) => {
        this.profile = profile;
        if (profile.monitorId) {
          this.loadData(profile.monitorId);
        } else {
          this.isLoading = false;
        }
      },
      error: () => this.isLoading = false
    });
  }

  loadData(monitorId: string) {
    // Load sessions
    this.http.get<Session[]>(`${environment.apiUrl}/monitor/sessions?monitorId=${monitorId}`).subscribe({
      next: (sessions) => {
        this.totalSessions = sessions.length;
        // Compare calendar days in local time — ISO date-only strings parse as UTC midnight, so
        // `new Date(sessionDate) >= new Date()` wrongly hides same-day sessions after morning hours.
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const upcoming = sessions.filter((s) => {
          if (s.status === 'COMPLETED' || s.status === 'CANCELLED') return false;
          const sessionDay = new Date(s.sessionDate + 'T00:00:00');
          return sessionDay >= today;
        });
        this.upcomingSessions = upcoming.length;
        this.completedSessions = sessions.filter(s => s.status === 'COMPLETED').length;
        this.cancelledSessions = sessions.filter(s => s.status === 'CANCELLED').length;
        const sorted = [...upcoming].sort((a, b) => {
          const da = new Date(a.sessionDate + 'T00:00:00').getTime() - new Date(b.sessionDate + 'T00:00:00').getTime();
          if (da !== 0) return da;
          return (a.startTime || '').localeCompare(b.startTime || '');
        });
        this.nextSession = sorted[0] || null;
        this.upcomingSessionsList = sorted;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  getStudentNames(session: Session): string[] {
    // Use studentNames returned directly from the backend API
    if (session.studentNames && session.studentNames.length > 0) {
      return session.studentNames.filter(n => n && n.trim().length > 0);
    }
    return [];
  }

  formatTime(timeStr: string): string {
    if (!timeStr) return '—';
    const parts = timeStr.split(':');
    return `${parts[0]}:${parts[1]}`;
  }
}
