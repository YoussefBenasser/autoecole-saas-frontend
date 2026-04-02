import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-student-dashboard',
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
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-white">Bienvenue !</h1>
          <p class="text-sm mt-1" style="color: var(--color-text-muted)">Voici un aperçu de votre progression et de vos prochaines échéances.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <!-- Next Session Card -->
          <div class="rounded-2xl p-6 border hover:border-indigo-500/30 transition-all" style="background: var(--color-surface); border-color: var(--color-border)">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style="background: rgba(79,70,229,0.15)">🚗</div>
              <h3 class="font-semibold text-white">Prochaine séance</h3>
            </div>
            <div *ngIf="nextSession">
              <p class="text-xl font-bold text-white mb-1">{{ nextSession.sessionDate }}</p>
              <p class="text-sm" style="color: var(--color-text-muted)">{{ nextSession.startTime }} - {{ nextSession.endTime }}</p>
            </div>
            <p *ngIf="!nextSession" class="text-sm italic" style="color: var(--color-text-muted)">Aucune séance planifiée.</p>
            <div class="mt-4 pt-4 border-t" style="border-color: var(--color-border)">
              <a routerLink="/student/sessions" class="text-sm font-medium flex items-center gap-1 hover:opacity-80 transition-opacity" style="color: #818cf8">
                Voir le planning <span>→</span>
              </a>
            </div>
          </div>

          <!-- Next Exam Card -->
          <div class="rounded-2xl p-6 border hover:border-purple-500/30 transition-all" style="background: var(--color-surface); border-color: var(--color-border)">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style="background: rgba(168,85,247,0.15)">📝</div>
              <h3 class="font-semibold text-white">Examen</h3>
            </div>
            <p class="text-sm" style="color: var(--color-text-muted)">Pas d'examen prévu pour le moment.</p>
            <div class="mt-4 pt-4 border-t" style="border-color: var(--color-border)">
              <a routerLink="/student/exams" class="text-sm font-medium flex items-center gap-1 hover:opacity-80 transition-opacity" style="color: #c084fc">
                Voir les détails <span>→</span>
              </a>
            </div>
          </div>

          <!-- Progress Card -->
          <div class="rounded-2xl p-6 border hover:border-emerald-500/30 transition-all" style="background: var(--color-surface); border-color: var(--color-border)">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style="background: rgba(34,197,94,0.15)">📈</div>
              <h3 class="font-semibold text-white">Progression</h3>
            </div>
            <p class="text-xl font-bold text-white mb-2">{{ sessionsCount }} séance(s)</p>
            <div class="w-full rounded-full h-2 mb-2" style="background: rgba(255,255,255,0.1)">
              <div class="h-2 rounded-full transition-all" style="background: linear-gradient(135deg, #22c55e, #14b8a6)" [style.width]="(sessionsCount * 5) + '%'"></div>
            </div>
            <p class="text-xs" style="color: var(--color-text-muted)">Basé sur une estimation de 20 séances</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  profile: any = null;
  nextSession: any = null;
  sessionsCount = 0;
  isLoading = true;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/profile/me`).subscribe({
      next: (profile) => {
        this.profile = profile;
        if (profile.studentId) {
          this.loadSessions(profile.studentId);
        } else {
          this.isLoading = false;
        }
      },
      error: () => this.isLoading = false
    });
  }

  loadSessions(studentId: string) {
    this.http.get<any[]>(`${environment.apiUrl}/student/sessions?studentId=${studentId}`).subscribe({
      next: (sessions) => {
        this.sessionsCount = sessions.length;
        const upcoming = sessions.filter(s => new Date(s.sessionDate) >= new Date()).sort((a,b) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime());
        if (upcoming.length > 0) {
          this.nextSession = upcoming[0];
        }
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }
}
