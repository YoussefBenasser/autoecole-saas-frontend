import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
}

@Component({
  selector: 'app-monitor-sessions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative min-h-[500px]">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-white">Mon Planning</h1>
          <p class="text-sm mt-1" style="color: var(--color-text-muted)">
            Vos séances de conduite assignées. Total : <strong class="text-white">{{ sessions.length }}</strong>
          </p>
        </div>
        <button (click)="refreshSessions()" title="Actualiser"
                class="px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all"
                style="background: rgba(20,184,166,0.12); color: #2dd4bf; border: 1px solid rgba(20,184,166,0.2);">
          🔄 Actualiser
        </button>
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
      <div *ngIf="!isLoading && filteredSessions.length > 0"
           class="rounded-2xl overflow-hidden border" style="background: var(--color-surface); border-color: var(--color-border)">
        <table class="w-full text-sm">
          <thead>
            <tr style="background: var(--color-surface-2)">
              <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">Date &amp; Heure</th>
              <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">Type</th>
              <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">Élève(s)</th>
              <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">Statut</th>
              <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let s of filteredSessions"
                class="border-t hover:bg-white/5 transition-colors"
                style="border-color: var(--color-border)">
              <!-- Date & Time -->
              <td class="px-5 py-4">
                <div class="font-medium text-white">{{ formatDate(s.sessionDate) }}</div>
                <div class="text-xs mt-0.5" style="color: var(--color-text-muted)">
                  {{ formatTime(s.startTime) }} – {{ formatTime(s.endTime) }}
                </div>
              </td>
              <!-- Type -->
              <td class="px-5 py-4">
                <span class="px-2 py-1 rounded-full text-xs font-medium"
                      [ngStyle]="s.type === 'théorie'
                        ? {'background':'rgba(168,85,247,0.15)','color':'#c084fc'}
                        : {'background':'rgba(20,184,166,0.15)','color':'#2dd4bf'}">
                  {{ s.type === 'théorie' ? '📖 Théorie' : '🚗 Pratique' }}
                </span>
              </td>
              <!-- Student IDs -->
              <td class="px-5 py-4" style="color: var(--color-text-muted)">
                <div *ngIf="s.studentIds && s.studentIds.length > 0" class="flex flex-wrap gap-1">
                  <span *ngFor="let id of s.studentIds"
                        class="px-2 py-0.5 rounded text-xs font-mono"
                        style="background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.7)">
                    {{ id.substring(0, 8) }}…
                  </span>
                </div>
                <span *ngIf="!s.studentIds || s.studentIds.length === 0" class="text-white/30">—</span>
              </td>
              <!-- Status badge -->
              <td class="px-5 py-4">
                <span class="px-2 py-1.5 rounded-full text-xs font-medium"
                      [ngStyle]="getStatusStyle(s.status)">
                  {{ getStatusLabel(s.status) }}
                </span>
              </td>
              <!-- Actions -->
              <td class="px-5 py-4">
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
}
