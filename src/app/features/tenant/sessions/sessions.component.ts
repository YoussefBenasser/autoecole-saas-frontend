import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ExtendedSessionResponse as Session } from '../../../core/models/session.model';

interface Monitor {
  id: string;
  user?: {
    firstName: string;
    lastName: string;
  };
}

interface Student {
  id: string;
  user?: {
    firstName: string;
    lastName: string;
  };
}

@Component({
  selector: 'app-tenant-sessions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative min-h-[500px] animate-fade-in">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-white">Séances de Conduite</h1>
          <p class="text-sm mt-1" style="color: var(--color-text-muted)">Gérez le planning des moniteurs et des élèves</p>
        </div>
        <button (click)="openModal()" class="px-4 py-2 rounded-lg font-medium text-white shadow-sm transition-transform hover:scale-105"
                style="background: linear-gradient(135deg, #4f46e5, #06b6d4)">
          + Ajouter une séance
        </button>
      </div>

      <div *ngIf="isLoading" class="flex justify-center py-20">
        <svg class="w-8 h-8 animate-spin" style="color: var(--color-accent)" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      </div>

      <div *ngIf="!isLoading" class="rounded-2xl overflow-hidden border" style="background: var(--color-surface); border-color: var(--color-border)">
        <table class="w-full text-sm">
          <thead>
            <tr style="background: var(--color-surface-2)">
              <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">Date & Heure</th>
              <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">Moniteur</th>
              <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">Élève(s)</th>
              <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">Statut</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let s of sessions" class="border-t hover:bg-white/5 transition-colors" style="border-color: var(--color-border)">
              <td class="px-5 py-4">
                <div class="font-medium text-white">{{ s.sessionDate }}</div>
                <div class="text-xs" style="color: var(--color-text-muted)">{{ s.startTime }} - {{ s.endTime }}</div>
              </td>
              <td class="px-5 py-4">
                <div class="flex items-center gap-2">
                  <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-inner"
                       style="background: linear-gradient(135deg, #f59e0b, #ef4444)">
                     {{ s.monitorName?.charAt(0) || s.monitorId.charAt(0) || 'M' }}
                  </div>
                  <span class="font-medium text-white">{{ s.monitorName || (s.monitorId ? ('Moniteur ' + s.monitorId.substring(0, 8)) : 'Moniteur') }}</span>
                </div>
              </td>
              <td class="px-5 py-4" style="color: var(--color-text-muted)">
                <span *ngFor="let student of s.studentNames; let last = last">
                  {{ student || 'Élève' }}{{ !last ? ', ' : '' }}
                </span>
                <span *ngIf="!s.studentNames || s.studentNames.length === 0">—</span>
              </td>
              <td class="px-5 py-4">
                <span class="px-2 py-1.5 rounded-full text-xs font-medium" 
                      [ngStyle]="{'background': s.status === 'COMPLETED' ? 'rgba(34,197,94,0.15)' : 'rgba(56,189,248,0.15)', 'color': s.status === 'COMPLETED' ? '#4ade80' : '#38bdf8'}">
                  {{ s.status === 'COMPLETED' ? 'Terminée' : 'Planifiée' }}
                </span>
              </td>
            </tr>
            <tr *ngIf="sessions.length === 0">
              <td colspan="4" class="px-5 py-12 text-center text-sm" style="color: var(--color-text-muted)">Aucune séance planifiée pour le moment.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Create Session Modal -->
      <div *ngIf="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
        <div class="w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border animate-slide-up" style="background: var(--color-surface); border-color: var(--color-border)">
          <div class="px-6 py-4 border-b flex justify-between items-center" style="border-color: var(--color-border); background: var(--color-surface-2)">
            <h3 class="text-lg font-bold text-white">Ajouter une séance</h3>
            <button (click)="closeModal()" class="text-gray-400 hover:text-white transition-colors">
              <span class="text-xl">&times;</span>
            </button>
          </div>
          <form (ngSubmit)="onSubmit()" #sessionForm="ngForm" class="p-6">
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium mb-1" style="color: var(--color-text-muted)">Date</label>
                  <input type="date" name="sessionDate" [(ngModel)]="newSession.sessionDate" required
                         class="w-full px-4 py-2 rounded-lg border text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                         style="background: rgba(0,0,0,0.2); border-color: var(--color-border)" [min]="today" />
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <label class="block text-sm font-medium mb-1" style="color: var(--color-text-muted)">Début</label>
                    <input type="time" name="startTime" [(ngModel)]="newSession.startTime" required
                           class="w-full px-4 py-2 rounded-lg border text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                           style="background: rgba(0,0,0,0.2); border-color: var(--color-border)" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-1" style="color: var(--color-text-muted)">Fin</label>
                    <input type="time" name="endTime" [(ngModel)]="newSession.endTime" required
                           class="w-full px-4 py-2 rounded-lg border text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                           style="background: rgba(0,0,0,0.2); border-color: var(--color-border)" />
                  </div>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium mb-1" style="color: var(--color-text-muted)">Moniteur</label>
                <select name="monitorId" [(ngModel)]="newSession.monitorId" required
                        class="w-full px-4 py-2 rounded-lg border text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        style="background: rgba(0,0,0,0.2); border-color: var(--color-border)">
                  <option value="" disabled>Sélectionner un moniteur</option>
                  <option *ngFor="let m of monitors" [value]="m.id">
                    {{ m.user?.firstName || 'Moniteur' }} {{ m.user?.lastName || '' }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium mb-1" style="color: var(--color-text-muted)">Élève</label>
                <select name="studentId" [(ngModel)]="newSession.studentId" required
                        class="w-full px-4 py-2 rounded-lg border text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        style="background: rgba(0,0,0,0.2); border-color: var(--color-border)">
                  <option value="" disabled>Sélectionner un élève</option>
                  <option *ngFor="let s of students" [value]="s.id">
                    {{ s.user?.firstName || 'Élève' }} {{ s.user?.lastName || 'Nouveau' }}
                  </option>
                </select>
              </div>
            </div>
            
            <div class="mt-8 flex gap-3 justify-end">
              <button type="button" (click)="closeModal()" class="px-4 py-2 rounded-lg text-sm font-medium transition-colors border hover:bg-white/5" style="border-color: var(--color-border); color: var(--color-text-muted)">
                Annuler
              </button>
              <button type="submit" [disabled]="!sessionForm.form.valid || isSubmitting"
                      class="px-5 py-2 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-50"
                      style="background: linear-gradient(135deg, #4f46e5, #06b6d4)">
                <span *ngIf="!isSubmitting">Créer la séance</span>
                <span *ngIf="isSubmitting" class="flex items-center gap-2">
                  <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                  ...
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class SessionsComponent implements OnInit {
  sessions: Session[] = [];
  students: Student[] = [];
  monitors: Monitor[] = [];
  isLoading = true;
  
  isModalOpen = false;
  isSubmitting = false;
  today = new Date().toISOString().split('T')[0];

  newSession = {
    monitorId: '',
    studentId: '',
    sessionDate: '',
    startTime: '08:00',
    endTime: '10:00'
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;

    forkJoin({
      sessions: this.http.get<Session[]>(`${environment.apiUrl}/sessions`),
      students: this.http.get<Student[]>(`${environment.apiUrl}/admin/students`),
      monitors: this.http.get<Monitor[]>(`${environment.apiUrl}/admin/monitors`)
    }).subscribe({
      next: ({ sessions, students, monitors }) => {
        this.students = students;
        this.monitors = monitors;
        this.sessions = sessions
          .map((session) => this.enrichSession(session))
          .sort((a,b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime());
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load tenant session data', err);
        this.isLoading = false;
      }
    });
  }

  private enrichSession(session: Session): Session {
    const monitor = this.monitors.find((m) => m.id === session.monitorId);
    const studentNames = (session.studentIds || []).map((id) => {
      const student = this.students.find((s) => s.id === id);
      return student ? `${student.user?.firstName || ''} ${student.user?.lastName || ''}`.trim() : id.substring(0, 8);
    });

    return {
      ...session,
      monitorName: monitor ? `${monitor.user?.firstName || ''} ${monitor.user?.lastName || ''}`.trim() : undefined,
      studentNames: studentNames.filter(Boolean)
    };
  }

  openModal() {
    this.newSession = {
      monitorId: '',
      studentId: '',
      sessionDate: this.today,
      startTime: '08:00',
      endTime: '10:00'
    };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  onSubmit() {
    if (!this.newSession.monitorId || !this.newSession.studentId || !this.newSession.sessionDate) return;
    this.isSubmitting = true;

    // Map to CreateSessionRequest DTO
    const payload = {
      monitorId: this.newSession.monitorId,
      sessionDate: this.newSession.sessionDate,
      startTime: this.newSession.startTime + ':00', // required format HH:mm:ss in java LocalTime usually handles HH:mm though
      endTime: this.newSession.endTime + ':00',
      studentIds: [this.newSession.studentId]
    };

    if (payload.startTime.length === 5) {
      payload.startTime += ':00';
    } else if (payload.startTime.length > 8) {
        payload.startTime = payload.startTime.substring(0,8);
    }
    
    if (payload.endTime.length === 5) {
      payload.endTime += ':00';
    } else if (payload.endTime.length > 8) {
        payload.endTime = payload.endTime.substring(0,8);
    }

    this.http.post(`${environment.apiUrl}/sessions`, payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.closeModal();
        this.loadData(); // refresh
      },
      error: (err) => {
        console.error('Error creating session', err);
        this.isSubmitting = false;
      }
    });
  }
}
