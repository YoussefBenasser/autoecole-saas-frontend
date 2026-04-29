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
  styleUrls: ['../../tenant/dashboard/dashboard.component.css'],
  template: `
    <div class="dashboard-container relative min-h-[500px]">
      <!-- Header -->
      <div class="header">
        <div class="header-content">
          <div>
            <h1 class="header-title">Mon Planning</h1>
            <p class="header-subtitle">Vos séances de conduite assignées. Total : <strong>{{ sessions.length }}</strong></p>
          </div>
          <div class="header-actions">
            <button (click)="refreshSessions()" class="refresh-button" title="Actualiser">
              <span class="refresh-text">🔄 Actualiser</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="rounded-2xl p-4 mb-5 border flex flex-wrap gap-3 items-end"
           style="background: var(--color-surface); border-color: var(--color-border)">
        <!-- Date filter -->
        <div class="flex flex-col gap-1 flex-1 min-w-[160px]">
          <label class="text-xs font-semibold uppercase tracking-wide" style="color: var(--color-text-muted)">Date</label>
          <input type="date" [(ngModel)]="filterDate"
                 class="px-3 py-2 rounded-xl text-sm outline-none font-inherit"
                 style="background: rgba(255,255,255,0.06); border: 1px solid var(--color-border); color: white;" />
        </div>
        <!-- Status filter -->
        <div class="flex flex-col gap-1 flex-1 min-w-[160px]">
          <label class="text-xs font-semibold uppercase tracking-wide" style="color: var(--color-text-muted)">Statut</label>
          <select [(ngModel)]="filterStatus"
                  class="px-3 py-2 rounded-xl text-sm outline-none font-inherit cursor-pointer"
                  style="background: rgba(255,255,255,0.06); border: 1px solid var(--color-border); color: white;">
            <option value="">Tous les statuts</option>
            <option value="PLANNED">En attente</option>
            <option value="COMPLETED">Acceptée / Terminée</option>
            <option value="CANCELLED">Refusée / Annulée</option>
          </select>
        </div>
        <!-- Clear filters -->
        <button (click)="clearFilters()"
                class="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                style="background: rgba(255,255,255,0.06); border: 1px solid var(--color-border); color: rgba(255,255,255,0.6);">
          Effacer filtres
        </button>
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading" class="flex justify-center py-20">
        <svg class="w-8 h-8 animate-spin" style="color: var(--color-accent)" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      </div>

      <!-- Table -->
      <div *ngIf="!isLoading && filteredSessions.length > 0" class="recent-tenants" style="margin-top: 2rem;">
        <div class="section-header">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h2 class="section-title">Liste des séances</h2>
            <span class="status-badge approved">
              {{ filteredSessions.length }} résultat(s)
            </span>
          </div>
        </div>
        <div style="padding: 0;">
          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
              <tr>
                <th style="padding: 1rem 2rem; font-weight: 600; color: rgba(255, 255, 255, 0.9); background: rgba(255, 255, 255, 0.05); font-size: 0.9rem; text-transform: uppercase;">Date &amp; Heure</th>
                <th style="padding: 1rem 2rem; font-weight: 600; color: rgba(255, 255, 255, 0.9); background: rgba(255, 255, 255, 0.05); font-size: 0.9rem; text-transform: uppercase;">Type</th>
                <th style="padding: 1rem 2rem; font-weight: 600; color: rgba(255, 255, 255, 0.9); background: rgba(255, 255, 255, 0.05); font-size: 0.9rem; text-transform: uppercase;">Élève(s)</th>
                <th style="padding: 1rem 2rem; font-weight: 600; color: rgba(255, 255, 255, 0.9); background: rgba(255, 255, 255, 0.05); font-size: 0.9rem; text-transform: uppercase;">Statut</th>
                <th style="padding: 1rem 2rem; font-weight: 600; color: rgba(255, 255, 255, 0.9); background: rgba(255, 255, 255, 0.05); font-size: 0.9rem; text-transform: uppercase;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of filteredSessions" style="border-top: 1px solid rgba(255, 255, 255, 0.08); transition: all 0.2s ease;">
                <!-- Date & Time -->
                <td style="padding: 1rem 2rem;">
                  <div style="font-weight: 600; color: white;">{{ formatDate(s.sessionDate) }}</div>
                  <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-top: 0.25rem;">
                    {{ formatTime(s.startTime) }} – {{ formatTime(s.endTime) }}
                  </div>
                </td>
                <!-- Type -->
                <td style="padding: 1rem 2rem;">
                  <span class="status-badge"
                        [ngClass]="s.type === 'théorie' ? 'pending' : 'approved'">
                    {{ s.type === 'théorie' ? '📖 Théorie' : '🚗 Pratique' }}
                  </span>
                </td>
                <!-- Student IDs -->
                <td style="padding: 1rem 2rem; color: rgba(255, 255, 255, 0.9); font-size: 0.9rem;">
                  <span *ngIf="getStudentNamesList(s).length > 0">{{ getStudentNamesList(s).join(', ') }}</span>
                  <span *ngIf="getStudentNamesList(s).length === 0 && s.studentIds && s.studentIds.length > 0">{{ s.studentIds.length }} élève(s)</span>
                  <span *ngIf="!s.studentIds || s.studentIds.length === 0" style="opacity: 0.4;">—</span>
                </td>
                <!-- Status badge -->
                <td style="padding: 1rem 2rem;">
                  <span class="status-badge"
                        [ngStyle]="getStatusStyle(s.status)">
                    {{ getStatusLabel(s.status) }}
                  </span>
                </td>
                <!-- Actions -->
                <td style="padding: 1rem 2rem;">
                  <div *ngIf="s.status === 'PLANNED'" class="flex gap-2">
                    <button (click)="acceptSession(s)"
                            class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105"
                            style="background: rgba(34,197,94,0.15); color: #4ade80; border: 1px solid rgba(34,197,94,0.25);">
                      ✅ Accepter
                    </button>
                    <button (click)="rejectSession(s)"
                            class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105"
                            style="background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.25);">
                      ❌ Refuser
                    </button>
                  </div>
                  <span *ngIf="s.status !== 'PLANNED'" class="text-xs" style="color: var(--color-text-muted)">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Empty state — no sessions at all -->
      <div *ngIf="!isLoading && sessions.length === 0"
           class="rounded-2xl p-12 text-center border" style="background: var(--color-surface); border-color: var(--color-border)">
        <div class="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4" style="background: rgba(20,184,166,0.15)">🗓️</div>
        <h3 class="text-lg font-bold text-white mb-2">Aucun créneau prévu</h3>
        <p class="text-sm max-w-md mx-auto" style="color: var(--color-text-muted)">
          Vous n'avez pas de séance affectée pour le moment.
        </p>
      </div>

      <!-- Empty state — filters produce no results -->
      <div *ngIf="!isLoading && sessions.length > 0 && filteredSessions.length === 0"
           class="rounded-2xl p-10 text-center border" style="background: var(--color-surface); border-color: var(--color-border)">
        <div class="text-3xl mb-3">🔍</div>
        <h3 class="text-base font-bold text-white mb-1">Aucun résultat</h3>
        <p class="text-sm" style="color: var(--color-text-muted)">Aucune séance ne correspond aux filtres sélectionnés.</p>
        <button (click)="clearFilters()" class="mt-3 text-sm underline" style="color: #2dd4bf">Effacer les filtres</button>
      </div>

      <!-- Error message -->
      <div *ngIf="errorMsg" class="mt-4 px-4 py-3 rounded-xl text-sm"
           style="background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #f87171">
        ⚠️ {{ errorMsg }}
      </div>
    </div>
  `
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
        return { background: 'rgba(34,197,94,0.15)', color: '#4ade80' };
      case 'CANCELLED':
        return { background: 'rgba(239,68,68,0.15)', color: '#f87171' };
      default: // PLANNED
        return { background: 'rgba(20,184,166,0.15)', color: '#2dd4bf' };
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'COMPLETED': return '✅ Acceptée';
      case 'CANCELLED': return '❌ Refusée';
      default: return '⏳ En attente';
    }
  }

  getStudentNamesList(session: SessionItem): string[] {
    if (session.studentNames && session.studentNames.length > 0) {
      return session.studentNames.filter(n => n && n.trim().length > 0);
    }
    return [];
  }
}
