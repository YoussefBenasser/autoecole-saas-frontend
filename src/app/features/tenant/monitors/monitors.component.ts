import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';

interface Monitor {
  id: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
}

@Component({
  selector: 'app-monitors',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative min-h-[500px]">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-white">Moniteurs</h1>
          <p class="text-sm mt-1" style="color: var(--color-text-muted)">Gérez les moniteurs de l'auto-école et ajoutez-en de nouveaux</p>
        </div>
        <button (click)="openModal()" class="px-4 py-2 rounded-lg font-medium text-white shadow-sm transition-transform hover:scale-105"
                style="background: linear-gradient(135deg, #06b6d4, #4f46e5)">
          + Ajouter un moniteur
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
              <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">Moniteur</th>
              <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">Email</th>
              <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">Téléphone</th>
              <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">Spécialité</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let m of monitors" class="border-t hover:bg-white/5 transition-colors" style="border-color: var(--color-border)">
              <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-inner"
                       style="background: linear-gradient(135deg, #06b6d4, #4f46e5)">
                    {{ m.user?.firstName?.charAt(0) || '' }}{{ m.user?.lastName?.charAt(0) || '' }}
                  </div>
                  <span class="font-medium text-white">{{ m.user?.firstName || 'Nouveau' }} {{ m.user?.lastName || 'Moniteur' }}</span>
                </div>
              </td>
              <td class="px-5 py-4" style="color: var(--color-text-muted)">{{ m.user?.email || '—' }}</td>
              <td class="px-5 py-4" style="color: var(--color-text-muted)">{{ m.user?.phone || '—' }}</td>
              <td class="px-5 py-4">
                <span class="px-2 py-1.5 rounded-full text-xs font-medium" style="background: rgba(6,182,212,0.15); color: #22d3ee">
                  Conduite
                </span>
              </td>
            </tr>
            <tr *ngIf="monitors.length === 0">
              <td colspan="4" class="px-5 py-12 text-center text-sm" style="color: var(--color-text-muted)">Aucun moniteur enregistré pour le moment.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Create Monitor Modal Overlay -->
      <div *ngIf="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
        <div class="w-full max-w-md rounded-2xl shadow-xl overflow-hidden border animate-slide-up" style="background: var(--color-surface); border-color: var(--color-border)">
          <div class="px-6 py-4 border-b flex justify-between items-center" style="border-color: var(--color-border); background: var(--color-surface-2)">
            <h3 class="text-lg font-bold text-white">Ajouter un moniteur</h3>
            <button (click)="closeModal()" class="text-gray-400 hover:text-white transition-colors">
              <span class="text-xl">&times;</span>
            </button>
          </div>
          <form (ngSubmit)="onSubmit()" #monitorForm="ngForm" class="p-6">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-1" style="color: var(--color-text-muted)">Email</label>
                <input type="email" name="email" [(ngModel)]="newMonitor.email" required email
                       class="w-full px-4 py-2 rounded-lg border text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                       style="background: rgba(0,0,0,0.2); border-color: var(--color-border)"
                       placeholder="moniteur@exemple.com" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1" style="color: var(--color-text-muted)">Mot de passe provisoire</label>
                <input type="password" name="password" [(ngModel)]="newMonitor.password" required minlength="6"
                       class="w-full px-4 py-2 rounded-lg border text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                       style="background: rgba(0,0,0,0.2); border-color: var(--color-border)"
                       placeholder="******" />
              </div>
            </div>
            
            <div class="mt-8 flex gap-3 justify-end">
              <button type="button" (click)="closeModal()" class="px-4 py-2 rounded-lg text-sm font-medium transition-colors border hover:bg-white/5" style="border-color: var(--color-border); color: var(--color-text-muted)">
                Annuler
              </button>
              <button type="submit" [disabled]="!monitorForm.form.valid || isSubmitting"
                      class="px-5 py-2 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-50"
                      style="background: linear-gradient(135deg, #06b6d4, #4f46e5)">
                <span *ngIf="!isSubmitting">Créer le moniteur</span>
                <span *ngIf="isSubmitting" class="flex items-center gap-2">
                  <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                  Création...
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class MonitorsComponent implements OnInit {
  monitors: Monitor[] = [];
  isLoading = true;

  isModalOpen = false;
  isSubmitting = false;
  newMonitor = { email: '', password: '' };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadMonitors();
  }

  loadMonitors() {
    this.isLoading = true;
    this.http.get<Monitor[]>(`${environment.apiUrl}/admin/monitors`).subscribe({
      next: (data) => { this.monitors = data; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  openModal() {
    this.newMonitor = { email: '', password: '' };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  onSubmit() {
    if (!this.newMonitor.email || !this.newMonitor.password) return;
    this.isSubmitting = true;
    this.http.post(`${environment.apiUrl}/admin/monitors`, this.newMonitor).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.closeModal();
        this.loadMonitors(); // refresh the list
      },
      error: (err) => {
        console.error('Error creating monitor', err);
        this.isSubmitting = false;
      }
    });
  }
}
