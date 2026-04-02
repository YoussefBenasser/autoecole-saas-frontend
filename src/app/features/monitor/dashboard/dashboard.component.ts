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
  template: `
    <div class="relative">
      <div *ngIf="isLoading" class="flex justify-center py-20">
        <svg class="w-8 h-8 animate-spin" style="color: var(--color-accent)" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      </div>

      <div *ngIf="!isLoading">
        <div class="mb-6 flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-white">Bonjour !</h1>
            <p class="text-sm mt-1" style="color: var(--color-text-muted)">Aperçu de votre planning de conduite.</p>
          </div>
          <div class="hidden sm:block">
            <p class="text-xs font-medium uppercase tracking-wide px-3 py-1.5 rounded-full" style="background: rgba(79,70,229,0.15); color: #818cf8">Moniteur</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <!-- Next Session Card -->
          <div class="rounded-2xl p-6 border hover:border-teal-500/30 transition-all" style="background: var(--color-surface); border-color: var(--color-border)">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style="background: rgba(20,184,166,0.15)">🕒</div>
              <h3 class="font-semibold text-white">Prochaine séance</h3>
            </div>
            <div *ngIf="nextSession">
              <p class="text-xl font-bold text-white mb-1">{{ nextSession.sessionDate | date:'dd/MM/yyyy' }}</p>
              <p class="text-sm" style="color: var(--color-text-muted)">{{ nextSession.startTime }} - {{ nextSession.endTime }}</p>
              <p class="text-sm mt-1" style="color: var(--color-text-muted)" *ngIf="nextSession.studentIds.length">
                Avec élève {{ nextSession.studentIds[0]?.substring(0, 8) }}...
              </p>
            </div>
            <p *ngIf="!nextSession" class="text-sm italic" style="color: var(--color-text-muted)">Aucune séance planifiée.</p>
            <div class="mt-4 pt-4 border-t" style="border-color: var(--color-border)">
              <a routerLink="/monitor/sessions" class="text-sm font-medium flex items-center gap-1 hover:opacity-80 transition-opacity" style="color: #2dd4bf">
                Voir le planning <span>→</span>
              </a>
            </div>
          </div>

          <!-- Stats Card -->
          <div class="rounded-2xl p-6 border hover:border-orange-500/30 transition-all" style="background: var(--color-surface); border-color: var(--color-border)">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style="background: rgba(249,115,22,0.15)">🚗</div>
              <h3 class="font-semibold text-white">Mes Séances</h3>
            </div>
            <p class="text-xl font-bold text-white mb-1">{{ totalSessions }} séance(s)</p>
            <p class="text-sm" style="color: var(--color-text-muted)">{{ upcomingSessions }} à venir · {{ completedSessions }} terminée(s)</p>
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
  isLoading = true;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/profile/me`).subscribe({
      next: (profile) => {
        this.profile = profile;
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
      next: (sessions) => {
        this.totalSessions = sessions.length;
        const now = new Date();
        const upcoming = sessions.filter(s => new Date(s.sessionDate) >= now && s.status !== 'COMPLETED');
        this.upcomingSessions = upcoming.length;
        this.completedSessions = sessions.filter(s => s.status === 'COMPLETED').length;
        const sorted = upcoming.sort((a, b) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime());
        if (sorted.length > 0) {
          this.nextSession = sorted[0];
        }
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }
}
