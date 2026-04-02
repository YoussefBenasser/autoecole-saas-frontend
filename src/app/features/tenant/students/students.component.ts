import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';

interface Student {
  id: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  level?: string;
}

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative min-h-[500px]">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-white">Élèves</h1>
          <p class="text-sm mt-1" style="color: var(--color-text-muted)">Gérez vos élèves inscrits et ajoutez-en de nouveaux</p>
        </div>
        <button (click)="openModal()" class="px-4 py-2 rounded-lg font-medium text-white shadow-sm transition-transform hover:scale-105"
                style="background: linear-gradient(135deg, #4f46e5, #06b6d4)">
          + Ajouter un élève
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
              <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">Élève</th>
              <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">Email</th>
              <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">Téléphone</th>
              <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">Niveau</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let s of students" class="border-t hover:bg-white/5 transition-colors" style="border-color: var(--color-border)">
              <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-inner"
                       style="background: linear-gradient(135deg, #4f46e5, #06b6d4)">
                     {{ s.user?.firstName?.charAt(0) || '' }}{{ s.user?.lastName?.charAt(0) || '' }}
                  </div>
                  <span class="font-medium text-white">{{ s.user?.firstName || 'Nouvel' }} {{ s.user?.lastName || 'Élève' }}</span>
                </div>
              </td>
              <td class="px-5 py-4" style="color: var(--color-text-muted)">{{ s.user?.email || '—' }}</td>
              <td class="px-5 py-4" style="color: var(--color-text-muted)">{{ s.user?.phone || '—' }}</td>
              <td class="px-5 py-4">
                <span class="px-2 py-1.5 rounded-full text-xs font-medium" style="background: rgba(79,70,229,0.15); color: #818cf8">
                  {{ s.level || 'Non défini' }}
                </span>
              </td>
            </tr>
            <tr *ngIf="students.length === 0">
              <td colspan="4" class="px-5 py-12 text-center text-sm" style="color: var(--color-text-muted)">Aucun élève enregistré pour le moment.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Create Student Modal Overlay -->
      <div *ngIf="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
        <div class="w-full max-w-md rounded-2xl shadow-xl overflow-hidden border animate-slide-up" style="background: var(--color-surface); border-color: var(--color-border)">
          <div class="px-6 py-4 border-b flex justify-between items-center" style="border-color: var(--color-border); background: var(--color-surface-2)">
            <h3 class="text-lg font-bold text-white">Ajouter un élève</h3>
            <button (click)="closeModal()" class="text-gray-400 hover:text-white transition-colors">
              <span class="text-xl">&times;</span>
            </button>
          </div>
          <form (ngSubmit)="onSubmit()" #studentForm="ngForm" class="p-6">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-1" style="color: var(--color-text-muted)">Email</label>
                <input type="email" name="email" [(ngModel)]="newStudent.email" required email
                       class="w-full px-4 py-2 rounded-lg border text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                       style="background: rgba(0,0,0,0.2); border-color: var(--color-border)"
                       placeholder="eleve@exemple.com" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1" style="color: var(--color-text-muted)">Mot de passe provisoire</label>
                <input type="password" name="password" [(ngModel)]="newStudent.password" required minlength="6"
                       class="w-full px-4 py-2 rounded-lg border text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                       style="background: rgba(0,0,0,0.2); border-color: var(--color-border)"
                       placeholder="******" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1" style="color: var(--color-text-muted)">Niveau</label>
                <select name="level" [(ngModel)]="newStudent.level" required
                        class="w-full px-4 py-2 rounded-lg border text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        style="background: rgba(0,0,0,0.2); border-color: var(--color-border)">
                  <option value="" disabled>Sélectionner un niveau</option>
                  <option value="Débutant">Débutant</option>
                  <option value="Intermédiaire">Intermédiaire</option>
                  <option value="Avancé">Avancé</option>
                </select>
              </div>
            </div>
            
            <div class="mt-8 flex gap-3 justify-end">
              <button type="button" (click)="closeModal()" class="px-4 py-2 rounded-lg text-sm font-medium transition-colors border hover:bg-white/5" style="border-color: var(--color-border); color: var(--color-text-muted)">
                Annuler
              </button>
              <button type="submit" [disabled]="!studentForm.form.valid || isSubmitting"
                      class="px-5 py-2 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-50"
                      style="background: linear-gradient(135deg, #4f46e5, #06b6d4)">
                <span *ngIf="!isSubmitting">Créer l'élève</span>
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
export class StudentsComponent implements OnInit {
  students: Student[] = [];
  isLoading = true;
  
  isModalOpen = false;
  isSubmitting = false;
  newStudent = { email: '', password: '', level: '' };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents() {
    this.isLoading = true;
    this.http.get<Student[]>(`${environment.apiUrl}/admin/students`).subscribe({
      next: (data) => { this.students = data; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  openModal() {
    this.newStudent = { email: '', password: '', level: '' };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  onSubmit() {
    if (!this.newStudent.email || !this.newStudent.password || !this.newStudent.level) return;
    this.isSubmitting = true;
    this.http.post(`${environment.apiUrl}/admin/students`, this.newStudent).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.closeModal();
        this.loadStudents(); // refresh the list
      },
      error: (err) => {
        console.error('Error creating student', err);
        this.isSubmitting = false;
      }
    });
  }
}
