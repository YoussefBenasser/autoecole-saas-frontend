import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface SessionItem {
  id: string;
  monitorId: string;
  monitorName?: string;
  studentIds: string[];
  studentNames?: string[];
  sessionDate: string;
  startTime: string;
  endTime: string;
  status: string;
  type?: string;
  notes?: string;
}

interface MonitorProfile {
  id?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  fullName?: string;
}

@Component({
  selector: 'app-student-sessions',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['../../tenant/dashboard/dashboard.component.css'],
  template: `
    <div class="dashboard-container">
      <!-- Header -->
      <div class="header">
        <div class="header-content">
          <div>
            <h1 class="header-title">Mes Séances</h1>
            <p class="header-subtitle">Consultez votre planning de conduite</p>
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

      <!-- Loading -->
      <div *ngIf="isLoading" class="flex justify-center py-20">
        <svg class="w-8 h-8 animate-spin" style="color: var(--color-accent)" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      </div>

      <ng-container *ngIf="!isLoading">
        <!-- Error -->
        <div *ngIf="errorMsg" style="color: #fca5a5; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); padding: 1rem; border-radius: 12px; margin-bottom: 2rem;">
          ⚠️ {{ errorMsg }}
        </div>

        <!-- Stats Overview -->
        <div class="stats-overview" *ngIf="sessions.length > 0">
          <div class="stat-card" style="cursor: default;">
            <div class="stat-header">
              <div class="stat-icon" style="background: rgba(56,189,248,0.15)">🚀</div>
              <h3 class="stat-title">À venir</h3>
            </div>
            <p class="stat-value">{{ upcomingSessions.length }}</p>
            <p style="color: rgba(255,255,255,0.7); font-size: 0.9rem; margin-top: 0.5rem;">séance(s) planifiée(s)</p>
          </div>

          <div class="stat-card" style="cursor: default;">
            <div class="stat-header">
              <div class="stat-icon" style="background: rgba(34,197,94,0.15)">✅</div>
              <h3 class="stat-title">Terminées</h3>
            </div>
            <p class="stat-value">{{ completedCount }}</p>
            <p style="color: rgba(255,255,255,0.7); font-size: 0.9rem; margin-top: 0.5rem;">séance(s) effectuée(s)</p>
          </div>

          <div class="stat-card" style="cursor: default;">
            <div class="stat-header">
              <div class="stat-icon" style="background: rgba(249,115,22,0.15)">📊</div>
              <h3 class="stat-title">Total</h3>
            </div>
            <p class="stat-value">{{ sessions.length }}</p>
            <p style="color: rgba(255,255,255,0.7); font-size: 0.9rem; margin-top: 0.5rem;">séance(s) au total</p>
          </div>
        </div>

        <!-- ===== UPCOMING SESSIONS ===== -->
        <div *ngIf="upcomingSessions.length > 0" class="recent-tenants" style="margin-bottom: 2rem;">
          <div class="section-header">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <h2 class="section-title">🚀 Séances à venir</h2>
              <span class="status-badge" style="background: rgba(56,189,248,0.2); color: #38bdf8; border: 1px solid rgba(56,189,248,0.3);">
                {{ upcomingSessions.length }} séance(s)
              </span>
            </div>
          </div>
          <div style="padding: 0;">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
              <thead>
                <tr>
                  <th style="padding: 1rem 2rem; font-weight: 600; color: rgba(255, 255, 255, 0.9); background: rgba(255, 255, 255, 0.05); font-size: 0.9rem; text-transform: uppercase;">Date & Heure</th>
                  <th style="padding: 1rem 2rem; font-weight: 600; color: rgba(255, 255, 255, 0.9); background: rgba(255, 255, 255, 0.05); font-size: 0.9rem; text-transform: uppercase;">Type</th>
                  <th style="padding: 1rem 2rem; font-weight: 600; color: rgba(255, 255, 255, 0.9); background: rgba(255, 255, 255, 0.05); font-size: 0.9rem; text-transform: uppercase;">Moniteur</th>
                  <th style="padding: 1rem 2rem; font-weight: 600; color: rgba(255, 255, 255, 0.9); background: rgba(255, 255, 255, 0.05); font-size: 0.9rem; text-transform: uppercase;">Statut</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let s of upcomingSessions" style="border-top: 1px solid rgba(255, 255, 255, 0.08); transition: all 0.2s ease;">
                  <td style="padding: 1rem 2rem;">
                    <div style="font-weight: 600; color: white;">{{ formatDate(s.sessionDate) }}</div>
                    <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-top: 0.25rem;">{{ formatTime(s.startTime) }} – {{ formatTime(s.endTime) }}</div>
                  </td>
                  <td style="padding: 1rem 2rem;">
                    <span class="status-badge" [ngClass]="s.type === 'théorie' ? 'pending' : 'approved'">
                      {{ s.type === 'théorie' ? '📖 Théorie' : '🚗 Pratique' }}
                    </span>
                  </td>
                  <td style="padding: 1rem 2rem;">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                      <div style="width: 2rem; height: 2rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; color: #fff; background: linear-gradient(135deg, #f59e0b, #ef4444); flex-shrink: 0;">
                        {{ getMonitorInitial(s) }}
                      </div>
                      <span style="font-weight: 500; color: #ffffff;">{{ getMonitorLabel(s) }}</span>
                    </div>
                  </td>
                  <td style="padding: 1rem 2rem;">
                    <span class="status-badge" style="background: rgba(56,189,248,0.2); color: #38bdf8; border: 1px solid rgba(56,189,248,0.3);">⏳ Planifiée</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ===== PAST SESSIONS ===== -->
        <div *ngIf="pastSessions.length > 0" class="recent-tenants">
          <div class="section-header">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <h2 class="section-title">📋 Séances passées</h2>
              <span class="status-badge" style="background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.55); border: 1px solid rgba(255,255,255,0.15);">
                {{ pastSessions.length }} séance(s)
              </span>
            </div>
          </div>
          <div style="padding: 0;">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
              <thead>
                <tr>
                  <th style="padding: 1rem 2rem; font-weight: 600; color: rgba(255, 255, 255, 0.9); background: rgba(255, 255, 255, 0.05); font-size: 0.9rem; text-transform: uppercase;">Date & Heure</th>
                  <th style="padding: 1rem 2rem; font-weight: 600; color: rgba(255, 255, 255, 0.9); background: rgba(255, 255, 255, 0.05); font-size: 0.9rem; text-transform: uppercase;">Type</th>
                  <th style="padding: 1rem 2rem; font-weight: 600; color: rgba(255, 255, 255, 0.9); background: rgba(255, 255, 255, 0.05); font-size: 0.9rem; text-transform: uppercase;">Moniteur</th>
                  <th style="padding: 1rem 2rem; font-weight: 600; color: rgba(255, 255, 255, 0.9); background: rgba(255, 255, 255, 0.05); font-size: 0.9rem; text-transform: uppercase;">Statut</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let s of pastSessions" style="border-top: 1px solid rgba(255, 255, 255, 0.08); transition: all 0.2s ease;">
                  <td style="padding: 1rem 2rem;">
                    <div style="font-weight: 600; color: rgba(255,255,255,0.7);">{{ formatDate(s.sessionDate) }}</div>
                    <div style="font-size: 0.85rem; color: rgba(255,255,255,0.5); margin-top: 0.25rem;">{{ formatTime(s.startTime) }} – {{ formatTime(s.endTime) }}</div>
                  </td>
                  <td style="padding: 1rem 2rem;">
                    <span class="status-badge" style="background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.45); border: none;">
                      {{ s.type === 'théorie' ? '📖 Théorie' : '🚗 Pratique' }}
                    </span>
                  </td>
                  <td style="padding: 1rem 2rem;">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                      <div style="width: 2rem; height: 2rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; color: rgba(255,255,255,0.5); background: rgba(255,255,255,0.08); flex-shrink: 0;">
                        {{ getMonitorInitial(s) }}
                      </div>
                      <span style="font-weight: 500; color: rgba(255,255,255,0.6);">{{ getMonitorLabel(s) }}</span>
                    </div>
                  </td>
                  <td style="padding: 1rem 2rem;">
                    <span class="status-badge" [ngClass]="s.status === 'COMPLETED' ? 'approved' : 'pending'"
                          [style.background]="s.status === 'COMPLETED' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'"
                          [style.color]="s.status === 'COMPLETED' ? '#4ade80' : '#f87171'"
                          [style.borderColor]="s.status === 'COMPLETED' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'"
                          style="border: 1px solid;">
                      {{ s.status === 'COMPLETED' ? '✅ Terminée' : '❌ Annulée' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Empty state -->
        <div *ngIf="sessions.length === 0" class="stat-card" style="text-align: center; padding: 3rem; cursor: default;">
          <div style="font-size: 3.5rem; margin-bottom: 1rem; display: block;">📅</div>
          <h3 style="font-size: 1.25rem; font-weight: 700; color: #ffffff; margin: 0 0 0.5rem;">Aucune séance à venir</h3>
          <p style="color: rgba(255,255,255,0.7); margin: 0; font-size: 0.95rem; max-width: 400px; margin-left: auto; margin-right: auto;">
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
  today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

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
        // Fetch monitor names for sessions that only have monitorId
        this.resolveMonitorNames();
      },
      error: (err) => {
        this.errorMsg = 'Erreur lors du chargement des séances: ' + (err.error?.message || err.message || 'Erreur inconnue');
        this.isLoading = false;
      }
    });
  }

  resolveMonitorNames(): void {
    // Collect unique monitorIds that don't yet have a name
    const missingIds = [...new Set(
      this.sessions
        .filter(s => s.monitorId && (!s.monitorName || !s.monitorName.trim()))
        .map(s => s.monitorId)
    )];

    if (missingIds.length === 0) return;

    missingIds.forEach(monitorId => {
      // Try to fetch monitor info via the admin endpoint
      this.http.get<any>(`${environment.apiUrl}/admin/monitors`).subscribe({
        next: (monitors: any[]) => {
          const monitor = monitors.find((m: any) => m.id === monitorId || m.monitorId === monitorId);
          if (monitor) {
            const fullName = monitor.fullName || monitor.name ||
              ((monitor.firstName || '') + ' ' + (monitor.lastName || '')).trim() ||
              monitor.email || 'Moniteur';
            this.sessions = this.sessions.map(s =>
              s.monitorId === monitorId ? { ...s, monitorName: fullName } : s
            );
          }
        },
        error: () => {
          // Silently fail — will show 'Moniteur' fallback
        }
      });
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

  get completedCount(): number {
    return this.sessions.filter(s => s.status === 'COMPLETED').length;
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
    if (s.monitorName && s.monitorName.trim()) return s.monitorName;
    return 'Moniteur';
  }
}
