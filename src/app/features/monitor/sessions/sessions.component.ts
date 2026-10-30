import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

@Component({
  selector: 'app-monitor-sessions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="monitor-dashboard">
      <!-- Header -->
      <div class="dashboard-header">
        <div class="header-content">
          <div class="header-text">
            <h1 class="title">Mon Planning</h1>
            <p class="subtitle">Gérez vos séances de conduite assignées.</p>
          </div>
          <div class="header-actions">
            <div class="stats-badge">
              <span class="stats-icon">📅</span>
              <span class="stats-value">{{ sessions.length }}</span>
              <span class="stats-label">Séance(s)</span>
            </div>
            <button (click)="refreshSessions()" class="btn-refresh" [class.spinning]="isLoading">
              <svg class="icon-refresh" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Actualiser</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Filters Panel -->
      <div class="filters-panel glass-panel">
        <div class="filter-group">
          <label class="filter-label">Filtrer par date</label>
          <div class="input-wrapper">
            <input type="date" [(ngModel)]="filterDate" class="filter-input" />
          </div>
        </div>
        <div class="filter-group">
          <label class="filter-label">Statut</label>
          <div class="input-wrapper">
            <select [(ngModel)]="filterStatus" class="filter-select">
              <option value="">Tous les statuts</option>
              <option value="PLANNED">En attente</option>
              <option value="COMPLETED">Acceptée / Terminée</option>
              <option value="CANCELLED">Refusée / Annulée</option>
            </select>
          </div>
        </div>
        <div class="filter-actions">
          <button (click)="clearFilters()" class="btn-clear" *ngIf="filterDate || filterStatus">
            Effacer les filtres
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-container">
        <div class="spinner-ring"></div>
        <p class="loading-text">Chargement de votre planning...</p>
      </div>

      <!-- Error Message -->
      <div *ngIf="errorMsg" class="alert alert-error">
        <div class="alert-icon">⚠️</div>
        <div class="alert-content">{{ errorMsg }}</div>
      </div>

      <!-- Content Area -->
      <div *ngIf="!isLoading">
        
        <!-- Results Info -->
        <div class="results-info" *ngIf="sessions.length > 0">
          <span class="results-count">{{ filteredSessions.length }} résultat(s) trouvé(s)</span>
        </div>

        <!-- Sessions Grid/List -->
        <div class="sessions-list" *ngIf="filteredSessions.length > 0">
          <div *ngFor="let s of filteredSessions" class="session-card glass-panel" [ngClass]="'status-' + s.status.toLowerCase()">
            <div class="session-card-indicator"></div>
            
            <div class="session-card-body">
              <div class="session-datetime">
                <div class="date-block">
                  <span class="date-day">{{ getDayNumber(s.sessionDate) }}</span>
                  <div class="date-details">
                    <span class="date-month">{{ getMonthName(s.sessionDate) }}</span>
                    <span class="date-year">{{ getYear(s.sessionDate) }}</span>
                  </div>
                </div>
                <div class="time-block">
                  <svg class="icon-time" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{{ formatTime(s.startTime) }} - {{ formatTime(s.endTime) }}</span>
                </div>
              </div>

              <div class="session-details">
                <div class="detail-row">
                  <span class="badge-type" [ngClass]="s.type === 'théorie' ? 'type-theory' : 'type-practice'">
                    {{ s.type === 'théorie' ? '📖 Théorie' : '🚗 Pratique' }}
                  </span>
                  <span class="badge-status" [ngStyle]="getStatusStyle(s.status)">
                    {{ getStatusLabel(s.status) }}
                  </span>
                </div>
                
                <div class="students-list">
                  <div class="student-avatar-group">
                    <div class="student-avatar" *ngFor="let name of getStudentNamesList(s).slice(0,3)">
                      {{ name.charAt(0).toUpperCase() }}
                    </div>
                    <div class="student-avatar more" *ngIf="getStudentNamesList(s).length > 3">
                      +{{ getStudentNamesList(s).length - 3 }}
                    </div>
                  </div>
                  <div class="student-names">
                    <span *ngIf="getStudentNamesList(s).length > 0">{{ getStudentNamesList(s).join(', ') }}</span>
                    <span *ngIf="getStudentNamesList(s).length === 0 && s.studentIds && s.studentIds.length > 0">{{ s.studentIds.length }} élève(s)</span>
                    <span *ngIf="!s.studentIds || s.studentIds.length === 0" class="text-muted">Aucun élève assigné</span>
                  </div>
                </div>
              </div>

              <div class="session-actions" *ngIf="s.status === 'PLANNED'">
                <button (click)="acceptSession(s)" class="btn-action btn-accept" title="Accepter la séance">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                  <span>Accepter</span>
                </button>
                <button (click)="rejectSession(s)" class="btn-action btn-reject" title="Refuser la séance">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  <span>Refuser</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty States -->
        <div *ngIf="sessions.length === 0" class="empty-state glass-panel">
          <div class="empty-icon-wrapper">
            <span class="empty-icon">🗓️</span>
          </div>
          <h3 class="empty-title">Aucune séance prévue</h3>
          <p class="empty-text">Vous n'avez pas de séance affectée pour le moment. Profitez de votre temps libre !</p>
        </div>

        <div *ngIf="sessions.length > 0 && filteredSessions.length === 0" class="empty-state glass-panel">
          <div class="empty-icon-wrapper">
            <span class="empty-icon">🔍</span>
          </div>
          <h3 class="empty-title">Aucun résultat</h3>
          <p class="empty-text">Aucune séance ne correspond à vos critères de recherche.</p>
          <button (click)="clearFilters()" class="btn-primary mt-4">Effacer les filtres</button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: #0f172a;
      background-image: 
        radial-gradient(at 0% 0%, rgba(14, 165, 233, 0.1) 0px, transparent 50%),
        radial-gradient(at 100% 100%, rgba(139, 92, 246, 0.1) 0px, transparent 50%);
      color: #f8fafc;
      font-family: 'Inter', system-ui, sans-serif;
    }

    .monitor-dashboard {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    /* Glassmorphism Utilities */
    .glass-panel {
      background: rgba(30, 41, 59, 0.7);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 1.25rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    }

    /* Header */
    .dashboard-header {
      margin-bottom: 2rem;
      animation: fadeInDown 0.5s ease-out;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      flex-wrap: wrap;
      gap: 1.5rem;
    }

    .title {
      font-size: 2.25rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin: 0 0 0.5rem 0;
      background: linear-gradient(135deg, #f8fafc, #cbd5e1);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .subtitle {
      color: #94a3b8;
      font-size: 1.05rem;
      margin: 0;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }

    .stats-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: rgba(14, 165, 233, 0.1);
      border: 1px solid rgba(14, 165, 233, 0.2);
      border-radius: 999px;
    }

    .stats-icon { font-size: 1.1rem; }
    .stats-value { font-weight: 700; color: #38bdf8; font-size: 1.1rem; }
    .stats-label { color: #94a3b8; font-size: 0.85rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }

    .btn-refresh {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 1.25rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 999px;
      color: #f8fafc;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-refresh:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: translateY(-1px);
    }

    .icon-refresh {
      width: 1.2rem;
      height: 1.2rem;
      transition: transform 0.5s ease;
    }

    .btn-refresh.spinning .icon-refresh {
      animation: spin 1s linear infinite;
    }

    @keyframes spin { 100% { transform: rotate(360deg); } }

    /* Filters */
    .filters-panel {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      gap: 1.5rem;
      padding: 1.5rem;
      margin-bottom: 2rem;
      animation: fadeIn 0.5s ease-out 0.1s both;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      flex: 1;
      min-width: 200px;
    }

    .filter-label {
      font-size: 0.8rem;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .input-wrapper {
      position: relative;
    }

    .filter-input, .filter-select {
      width: 100%;
      background: rgba(15, 23, 42, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #f8fafc;
      padding: 0.75rem 1rem;
      border-radius: 0.75rem;
      font-family: inherit;
      font-size: 0.95rem;
      transition: all 0.2s ease;
      appearance: none;
    }

    .filter-input::-webkit-calendar-picker-indicator {
      filter: invert(1);
      opacity: 0.5;
      cursor: pointer;
    }

    .filter-select {
      cursor: pointer;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 1rem center;
      background-size: 1.2em;
      padding-right: 2.5rem;
    }

    .filter-input:focus, .filter-select:focus {
      outline: none;
      border-color: #38bdf8;
      box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.2);
    }

    .filter-select option {
      background: #1e293b;
      color: #f8fafc;
    }

    .btn-clear {
      background: transparent;
      border: 1px solid rgba(248, 113, 113, 0.3);
      color: #f87171;
      padding: 0.75rem 1.25rem;
      border-radius: 0.75rem;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s ease;
      height: 42px;
    }

    .btn-clear:hover {
      background: rgba(248, 113, 113, 0.1);
    }

    /* Results Info */
    .results-info {
      margin-bottom: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      animation: fadeIn 0.5s ease-out 0.2s both;
    }

    .results-count {
      color: #94a3b8;
      font-size: 0.9rem;
      font-weight: 500;
    }

    /* Sessions List */
    .sessions-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      animation: fadeInUp 0.5s ease-out 0.3s both;
    }

    .session-card {
      display: flex;
      position: relative;
      overflow: hidden;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .session-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
      border-color: rgba(255, 255, 255, 0.15);
    }

    .session-card-indicator {
      width: 6px;
      flex-shrink: 0;
    }

    .status-planned .session-card-indicator { background: linear-gradient(180deg, #38bdf8, #0284c7); }
    .status-completed .session-card-indicator { background: linear-gradient(180deg, #4ade80, #16a34a); }
    .status-cancelled .session-card-indicator { background: linear-gradient(180deg, #f87171, #dc2626); }

    .session-card-body {
      padding: 1.5rem;
      display: flex;
      flex-wrap: wrap;
      gap: 2rem;
      align-items: center;
      width: 100%;
    }

    /* Date & Time Block */
    .session-datetime {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      min-width: 150px;
    }

    .date-block {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .date-day {
      font-size: 2.5rem;
      font-weight: 800;
      line-height: 1;
      color: #f8fafc;
    }

    .date-details {
      display: flex;
      flex-direction: column;
    }

    .date-month {
      font-size: 0.9rem;
      font-weight: 700;
      color: #38bdf8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .date-year {
      font-size: 0.8rem;
      color: #94a3b8;
    }

    .time-block {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #cbd5e1;
      font-size: 0.95rem;
      font-weight: 500;
      background: rgba(255, 255, 255, 0.05);
      padding: 0.4rem 0.75rem;
      border-radius: 0.5rem;
      width: fit-content;
    }

    .icon-time {
      width: 1.1rem;
      height: 1.1rem;
      color: #94a3b8;
    }

    /* Details Block */
    .session-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      min-width: 250px;
    }

    .detail-row {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .badge-type {
      padding: 0.4rem 0.8rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .type-theory {
      background: rgba(168, 85, 247, 0.15);
      color: #c084fc;
      border: 1px solid rgba(168, 85, 247, 0.3);
    }

    .type-practice {
      background: rgba(34, 197, 94, 0.15);
      color: #4ade80;
      border: 1px solid rgba(34, 197, 94, 0.3);
    }

    .badge-status {
      padding: 0.4rem 0.8rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 700;
      border: 1px solid transparent;
    }

    /* Students List */
    .students-list {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: rgba(15, 23, 42, 0.3);
      padding: 0.75rem 1rem;
      border-radius: 0.75rem;
    }

    .student-avatar-group {
      display: flex;
    }

    .student-avatar {
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      background: linear-gradient(135deg, #38bdf8, #3b82f6);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: 700;
      border: 2px solid #1e293b;
      margin-left: -0.5rem;
    }

    .student-avatar:first-child { margin-left: 0; }
    .student-avatar.more { background: #475569; color: #cbd5e1; }

    .student-names {
      font-size: 0.95rem;
      color: #e2e8f0;
      font-weight: 500;
    }

    .text-muted { color: #64748b; font-style: italic; }

    /* Actions */
    .session-actions {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-left: auto;
    }

    .btn-action {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.6rem 1.25rem;
      border-radius: 0.75rem;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 1px solid transparent;
      width: 140px;
    }

    .btn-action svg { width: 1.1rem; height: 1.1rem; }

    .btn-accept {
      background: rgba(34, 197, 94, 0.1);
      color: #4ade80;
      border-color: rgba(34, 197, 94, 0.2);
    }

    .btn-accept:hover {
      background: rgba(34, 197, 94, 0.2);
      transform: scale(1.02);
    }

    .btn-reject {
      background: rgba(239, 68, 68, 0.1);
      color: #f87171;
      border-color: rgba(239, 68, 68, 0.2);
    }

    .btn-reject:hover {
      background: rgba(239, 68, 68, 0.2);
      transform: scale(1.02);
    }

    /* Empty States */
    .empty-state {
      padding: 4rem 2rem;
      text-align: center;
      animation: fadeIn 0.5s ease-out;
    }

    .empty-icon-wrapper {
      width: 5rem;
      height: 5rem;
      border-radius: 50%;
      background: rgba(56, 189, 248, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
    }

    .empty-icon { font-size: 2.5rem; }
    
    .empty-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #f8fafc;
      margin: 0 0 0.75rem;
    }

    .empty-text {
      color: #94a3b8;
      font-size: 1rem;
      max-width: 400px;
      margin: 0 auto;
      line-height: 1.5;
    }

    .btn-primary {
      background: linear-gradient(135deg, #38bdf8, #3b82f6);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 0.75rem;
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 4px 12px rgba(56, 189, 248, 0.3);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(56, 189, 248, 0.4);
    }

    /* Loading */
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 5rem 0;
    }

    .spinner-ring {
      width: 3rem;
      height: 3rem;
      border: 3px solid rgba(56, 189, 248, 0.2);
      border-top-color: #38bdf8;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    .loading-text {
      color: #94a3b8;
      font-weight: 500;
      letter-spacing: 0.02em;
    }

    /* Alerts */
    .alert {
      display: flex;
      gap: 1rem;
      padding: 1rem 1.5rem;
      border-radius: 1rem;
      margin-bottom: 1.5rem;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      color: #fca5a5;
    }

    .alert-icon { font-size: 1.25rem; }
    .alert-content { font-size: 0.95rem; font-weight: 500; align-self: center; }

    /* Animations */
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

    /* Responsive */
    @media (max-width: 768px) {
      .monitor-dashboard { padding: 1rem; }
      .session-card-body { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
      .session-actions { width: 100%; flex-direction: row; margin-left: 0; }
      .btn-action { flex: 1; }
      .detail-row { flex-wrap: wrap; }
      .filter-group { min-width: 100%; }
    }
  `]
})
export class SessionsComponent implements OnInit {
  sessions: SessionItem[] = [];
  isLoading = true;
  errorMsg = '';

  // Filters
  filterDate = '';
  filterStatus = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any>(`${environment.apiUrl}/profile/me`).subscribe({
      next: (profile) => {
        if (profile.monitorId) {
          this.loadSessions(profile.monitorId);
        } else {
          this.errorMsg = 'Profil moniteur introuvable. Vérifiez votre compte.';
          this.isLoading = false;
        }
      },
      error: () => {
        this.errorMsg = 'Impossible de récupérer le profil. Vérifiez votre connexion.';
        this.isLoading = false;
      }
    });
  }

  loadSessions(monitorId: string): void {
    this.isLoading = true;
    this.errorMsg = '';
    this.http.get<SessionItem[]>(`${environment.apiUrl}/monitor/sessions?monitorId=${monitorId}`).subscribe({
      next: (data) => {
        // Sort ascending by date then start time
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

  refreshSessions(): void {
    this.http.get<any>(`${environment.apiUrl}/profile/me`).subscribe({
      next: (profile) => { if (profile.monitorId) this.loadSessions(profile.monitorId); },
      error: () => {}
    });
  }

  get filteredSessions(): SessionItem[] {
    return this.sessions.filter(s => {
      if (this.filterDate && s.sessionDate !== this.filterDate) return false;
      if (this.filterStatus && s.status !== this.filterStatus) return false;
      return true;
    });
  }

  clearFilters(): void {
    this.filterDate = '';
    this.filterStatus = '';
  }

  acceptSession(session: SessionItem): void {
    if (!confirm('Accepter et marquer comme terminée cette séance ?')) return;
    this.http.put(`${environment.apiUrl}/sessions/${session.id}/complete`, {}).subscribe({
      next: () => { session.status = 'COMPLETED'; },
      error: (err) => {
        this.errorMsg = "Erreur lors de l'acceptation: " + (err.error?.message || err.message);
      }
    });
  }

  rejectSession(session: SessionItem): void {
    if (!confirm('Refuser / annuler cette séance ?')) return;
    this.http.put(`${environment.apiUrl}/sessions/${session.id}/cancel`, {}).subscribe({
      next: () => { session.status = 'CANCELLED'; },
      error: (err) => {
        this.errorMsg = 'Erreur lors du refus: ' + (err.error?.message || err.message);
      }
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
    // timeStr may be "HH:mm:ss" or "HH:mm"
    const parts = timeStr.split(':');
    return `${parts[0]}:${parts[1]}`;
  }

  getStatusStyle(status: string): Record<string, string> {
    switch (status) {
      case 'COMPLETED':
        return { background: 'rgba(34,197,94,0.15)', color: '#4ade80', borderColor: 'rgba(34,197,94,0.3)' };
      case 'CANCELLED':
        return { background: 'rgba(239,68,68,0.15)', color: '#f87171', borderColor: 'rgba(239,68,68,0.3)' };
      default: // PLANNED
        return { background: 'rgba(56,189,248,0.15)', color: '#38bdf8', borderColor: 'rgba(56,189,248,0.3)' };
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'COMPLETED': return '✓ Acceptée';
      case 'CANCELLED': return '✗ Refusée';
      default: return '⏳ En attente';
    }
  }

  getStudentNamesList(session: SessionItem): string[] {
    if (session.studentNames && session.studentNames.length > 0) {
      return session.studentNames.filter(n => n && n.trim().length > 0);
    }
    return [];
  }

  getDayNumber(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.getDate().toString().padStart(2, '0');
    } catch { return ''; }
  }

  getMonthName(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('fr-FR', { month: 'short' });
    } catch { return ''; }
  }

  getYear(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.getFullYear().toString();
    } catch { return ''; }
  }
}
