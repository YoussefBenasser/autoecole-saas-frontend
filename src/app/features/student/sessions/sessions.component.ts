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
    <div class="sessions-container">
      <!-- Header -->
      <div class="header-section">
        <h1 class="main-title">Mes Séances</h1>
        <p class="subtitle">Consultez votre planning de conduite</p>
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading" class="loading-state">
        <svg class="spinner" style="color: var(--color-accent)" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      </div>

      <ng-container *ngIf="!isLoading">
        <!-- Error -->
        <div *ngIf="errorMsg" class="error-card">
          <span class="error-icon">⚠️</span>
          <p class="error-text">{{ errorMsg }}</p>
        </div>

        <!-- ===== UPCOMING SESSIONS ===== -->
        <div *ngIf="upcomingSessions.length > 0" class="sessions-section">
          <div class="section-header">
            <span class="section-label upcoming">🚀 À venir</span>
            <span class="section-badge">{{ upcomingSessions.length }}</span>
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
                <tr *ngFor="let s of upcomingSessions" class="session-row">
                  <td class="date-time-cell">
                    <div class="date">{{ formatDate(s.sessionDate) }}</div>
                    <div class="time">{{ formatTime(s.startTime) }} – {{ formatTime(s.endTime) }}</div>
                  </td>
                  <td class="type-cell">
                    <span class="type-badge" [ngClass]="s.type === 'théorie' ? 'theory' : 'practical'">
                      {{ s.type === 'théorie' ? '📖 Théorie' : '🚗 Pratique' }}
                    </span>
                  </td>
                  <td class="monitor-cell">
                    <div class="monitor-info">
                      <div class="monitor-avatar">{{ getMonitorInitial(s) }}</div>
                      <span class="monitor-name">{{ getMonitorLabel(s) }}</span>
                    </div>
                  </td>
                  <td class="status-cell">
                    <span class="status-badge scheduled">⏳ Planifiée</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ===== PAST SESSIONS ===== -->
        <div *ngIf="pastSessions.length > 0" class="sessions-section">
          <div class="section-header">
            <span class="section-label past">📋 Passées</span>
            <span class="section-badge">{{ pastSessions.length }}</span>
          </div>
          <div class="table-container">
            <table class="sessions-table">
              <thead>
                <tr>
                  <th>Date &amp; Heure</th>
                  <th>Type</th>
                  <th>Moniteur</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let s of pastSessions" class="session-row">
                  <td class="date-time-cell">
                    <div class="date">{{ formatDate(s.sessionDate) }}</div>
                    <div class="time">{{ formatTime(s.startTime) }} – {{ formatTime(s.endTime) }}</div>
                  </td>
                  <td class="type-cell">
                    <span class="type-badge muted">{{ s.type === 'théorie' ? '📖 Théorie' : '🚗 Pratique' }}</span>
                  </td>
                  <td class="monitor-cell">
                    <div class="monitor-info">
                      <div class="monitor-avatar muted">{{ getMonitorInitial(s) }}</div>
                      <span class="monitor-name muted">{{ getMonitorLabel(s) }}</span>
                    </div>
                  </td>
                  <td class="status-cell">
                    <span class="status-badge" [ngClass]="s.status === 'COMPLETED' ? 'completed' : 'cancelled'">
                      {{ s.status === 'COMPLETED' ? '✅ Terminée' : '❌ Annulée' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Empty state -->
        <div *ngIf="sessions.length === 0" class="empty-state">
          <div class="empty-icon">📅</div>
          <h3 class="empty-title">Aucune séance à venir</h3>
          <p class="empty-text">
            Vous n'avez pas encore de séance planifiée. Votre moniteur planifiera bientôt vos premiers cours.
          </p>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .sessions-container {
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

    /* Error Card */
    .error-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
      border-radius: 1rem;
      margin-bottom: 1.5rem;
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05));
      border: 1px solid rgba(239, 68, 68, 0.2);
      animation: slideDown 0.3s ease-out;
    }

    .error-icon {
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .error-text {
      margin: 0;
      color: #f87171;
      font-size: 0.95rem;
    }

    /* Sessions Sections */
    .sessions-section {
      margin-bottom: 2rem;
      animation: slideUp 0.4s ease-out;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .section-label {
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .section-label.upcoming {
      color: #38bdf8;
    }

    .section-label.past {
      color: var(--color-text-muted);
    }

    .section-badge {
      padding: 0.375rem 0.75rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 700;
      background: rgba(56, 189, 248, 0.15);
      color: #38bdf8;
    }

    .section-label.past ~ .section-badge {
      background: rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 255, 0.55);
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
    }

    /* Table Styling */
    .sessions-table {
      width: 100%;
      border-collapse: collapse;
      min-width: 600px;
      font-size: 0.9rem;
    }

    .sessions-table thead {
      background: linear-gradient(135deg, rgba(51, 65, 85, 0.4) 0%, rgba(51, 65, 85, 0.2) 100%);
    }

    .sessions-table th {
      padding: 1rem 1.5rem;
      text-align: left;
      color: var(--color-text-muted);
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .session-row {
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      transition: background 0.2s ease;
    }

    .session-row:hover {
      background: rgba(255, 255, 255, 0.03);
    }

    .sessions-table td {
      padding: 1rem 1.5rem;
      color: var(--color-text);
    }

    .date-time-cell {
      min-width: 200px;
    }

    .date {
      font-weight: 600;
      color: #ffffff;
    }

    .time {
      font-size: 0.85rem;
      color: var(--color-text-muted);
      margin-top: 0.25rem;
    }

    .type-cell {
      width: 140px;
    }

    .type-badge {
      display: inline-block;
      padding: 0.5rem 0.875rem;
      border-radius: 0.625rem;
      font-size: 0.75rem;
      font-weight: 600;
      white-space: nowrap;
    }

    .type-badge.theory {
      background: linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(168, 85, 247, 0.05));
      color: #c084fc;
      border: 1px solid rgba(168, 85, 247, 0.2);
    }

    .type-badge.practical {
      background: linear-gradient(135deg, rgba(20, 184, 166, 0.15), rgba(20, 184, 166, 0.05));
      color: #2dd4bf;
      border: 1px solid rgba(20, 184, 166, 0.2);
    }

    .type-badge.muted {
      background: rgba(255, 255, 255, 0.06);
      color: rgba(255, 255, 255, 0.45);
      border: none;
    }

    .monitor-cell {
      min-width: 200px;
    }

    .monitor-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .monitor-avatar {
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 700;
      color: #ffffff;
      background: linear-gradient(135deg, #f59e0b, #ef4444);
      flex-shrink: 0;
    }

    .monitor-avatar.muted {
      background: rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 255, 0.5);
    }

    .monitor-name {
      font-weight: 500;
      color: #ffffff;
    }

    .monitor-name.muted {
      color: rgba(255, 255, 255, 0.6);
    }

    .status-cell {
      min-width: 140px;
    }

    .status-badge {
      display: inline-block;
      padding: 0.5rem 0.875rem;
      border-radius: 0.625rem;
      font-size: 0.75rem;
      font-weight: 600;
      white-space: nowrap;
    }

    .status-badge.scheduled {
      background: linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(56, 189, 248, 0.05));
      color: #38bdf8;
      border: 1px solid rgba(56, 189, 248, 0.2);
    }

    .status-badge.completed {
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05));
      color: #4ade80;
      border: 1px solid rgba(34, 197, 94, 0.2);
    }

    .status-badge.cancelled {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05));
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.2);
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
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
    }

    @media (max-width: 768px) {
      .sessions-container {
        padding: 1rem;
      }

      .main-title {
        font-size: 1.5rem;
      }

      .sessions-table {
        min-width: 100%;
      }
    }
  `]
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
