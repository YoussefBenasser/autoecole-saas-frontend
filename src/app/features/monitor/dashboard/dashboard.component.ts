import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { SessionResponse as Session } from '../../../core/models/session.model';

interface StudentInfo {
  id: string;
  user?: { firstName?: string; lastName?: string; };
  firstName?: string;
  lastName?: string;
}

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
              <p class="text-sm mt-2" style="color: var(--color-text-muted)" *ngIf="getStudentNames(nextSession).length > 0">
                Avec : <span class="text-white font-medium">{{ getStudentNames(nextSession).join(', ') }}</span>
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

            <!-- Mini stats grid -->
            <div class="mt-4 grid grid-cols-3 gap-2">
              <div class="rounded-xl p-2 text-center" style="background: rgba(56,189,248,0.08)">
                <p class="text-lg font-bold text-white">{{ upcomingSessions }}</p>
                <p class="text-xs" style="color: var(--color-text-muted)">À venir</p>
              </div>
              <div class="rounded-xl p-2 text-center" style="background: rgba(34,197,94,0.08)">
                <p class="text-lg font-bold text-white">{{ completedSessions }}</p>
                <p class="text-xs" style="color: var(--color-text-muted)">Terminées</p>
              </div>
              <div class="rounded-xl p-2 text-center" style="background: rgba(239,68,68,0.08)">
                <p class="text-lg font-bold text-white">{{ cancelledSessions }}</p>
                <p class="text-xs" style="color: var(--color-text-muted)">Annulées</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Upcoming Sessions List -->
        <div *ngIf="upcomingSessionsList.length > 0" class="rounded-2xl overflow-hidden border" style="background: var(--color-surface); border-color: var(--color-border)">
          <div class="px-6 py-4 border-b flex items-center justify-between" style="border-color: var(--color-border); background: var(--color-surface-2)">
            <h2 class="font-bold text-white">Séances à venir</h2>
            <a routerLink="/monitor/sessions" class="text-xs font-medium hover:opacity-80" style="color: #2dd4bf">Voir tout →</a>
          </div>
          <table class="w-full text-sm">
            <thead>
              <tr style="background: var(--color-surface-2)">
                <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">Date & Heure</th>
                <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">Élève(s)</th>
                <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">Statut</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of upcomingSessionsList.slice(0, 5)" class="border-t hover:bg-white/5 transition-colors" style="border-color: var(--color-border)">
                <td class="px-5 py-4">
                  <div class="font-medium text-white">{{ s.sessionDate | date:'dd/MM/yyyy' }}</div>
                  <div class="text-xs mt-0.5" style="color: var(--color-text-muted)">{{ formatTime(s.startTime) }} – {{ formatTime(s.endTime) }}</div>
                </td>
                <td class="px-5 py-4" style="color: var(--color-text-muted)">
                  <span *ngIf="getStudentNames(s).length > 0" class="text-white">{{ getStudentNames(s).join(', ') }}</span>
                <span *ngIf="getStudentNames(s).length === 0 && (s.studentIds || []).length > 0">{{ (s.studentIds || []).length }} élève(s)</span>
                  <span *ngIf="!s.studentIds || s.studentIds.length === 0" class="opacity-40">—</span>
                </td>
                <td class="px-5 py-4">
                  <span class="px-2 py-1 rounded-full text-xs font-medium" style="background: rgba(56,189,248,0.15); color: #38bdf8">
                    ⏳ Planifiée
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
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
  studentMap: Map<string, string> = new Map();
  isLoading = true;

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

        // Load student info for name display
        const studentIds = new Set<string>();
        sessions.forEach(s => (s.studentIds || []).forEach(id => studentIds.add(id)));
        if (studentIds.size > 0) {
          this.loadStudentNames(Array.from(studentIds));
        }
      },
      error: () => this.isLoading = false
    });
  }

  loadStudentNames(ids: string[]) {
    this.http.get<StudentInfo[]>(`${environment.apiUrl}/admin/students`).subscribe({
      next: (students) => {
        students.forEach(s => {
          const first = s.user?.firstName || s.firstName || '';
          const last = s.user?.lastName || s.lastName || '';
          const name = `${first} ${last}`.trim();
          this.studentMap.set(s.id, name || s.id.substring(0, 8));
        });
      },
      error: () => {}
    });
  }

  getStudentNames(session: Session): string[] {
    if (!session.studentIds || session.studentIds.length === 0) return [];
    return session.studentIds.map(id => this.studentMap.get(id) || id.substring(0, 8) + '…');
  }

  formatTime(timeStr: string): string {
    if (!timeStr) return '—';
    const parts = timeStr.split(':');
    return `${parts[0]}:${parts[1]}`;
  }
}
