import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { ExamResponse as Exam } from '../../../core/models/exam.model';

interface Student {
  id: string;
  user?: {
    firstName: string;
    lastName: string;
  };
}

@Component({
  selector: 'app-exams',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative min-h-[500px]">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-white">Examens</h1>
          <p class="text-sm mt-1" style="color: var(--color-text-muted)">Planification et suivi des examens</p>
        </div>
        <button (click)="openModal()" class="px-4 py-2 rounded-lg font-medium text-white shadow-sm transition-transform hover:scale-105"
                style="background: linear-gradient(135deg, #f59e0b, #d97706)">
          + Planifier un examen
        </button>
      </div>

      <div *ngIf="isLoading" class="flex justify-center py-20">
        <svg class="w-8 h-8 animate-spin" style="color: var(--color-warning)" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      </div>

      <div *ngIf="!isLoading" class="rounded-2xl overflow-hidden border" style="background: var(--color-surface); border-color: var(--color-border)">
        <table class="w-full text-sm">
          <thead>
            <tr style="background: var(--color-surface-2)">
              <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">Type</th>
              <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">Élève</th>
              <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">Date</th>
              <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">Statut/Résultat</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let e of exams" class="border-t hover:bg-white/5 transition-colors" style="border-color: var(--color-border)">
              <td class="px-5 py-4">
                <span class="px-2 py-1.5 rounded-full text-xs font-medium uppercase shadow-sm" style="background: rgba(245,158,11,0.15); color: var(--color-warning)">
                  {{ e.type }}
                </span>
              </td>
              <td class="px-5 py-4 font-medium text-white">
                {{ getStudentLabel(e.studentId) }}
              </td>
              <td class="px-5 py-4" style="color: var(--color-text-muted)">{{ e.date | date:'dd/MM/yyyy' }}</td>
              <td class="px-5 py-4">
                <span *ngIf="e.result" class="px-2 py-1.5 rounded-full text-xs font-semibold shadow-sm"
                      [style.background]="e.result === 'PASSED' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'"
                      [style.color]="e.result === 'PASSED' ? 'var(--color-success)' : 'var(--color-danger)'">
                  {{ e.result === 'PASSED' ? 'Reçu' : 'Échoué' }}
                </span>
                <span *ngIf="!e.result" class="text-xs px-2 py-1.5 rounded-full font-medium shadow-sm" style="background: rgba(59,130,246,0.15); color: #60a5fa">
                  {{ e.status || 'En attente' }}
                </span>
              </td>
            </tr>
            <tr *ngIf="exams.length === 0">
              <td colspan="4" class="px-5 py-12 text-center text-sm" style="color: var(--color-text-muted)">Aucun examen planifié.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Plan Exam Modal Overlay -->
      <div *ngIf="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
        <div class="w-full max-w-md rounded-2xl shadow-xl overflow-hidden border animate-slide-up" style="background: var(--color-surface); border-color: var(--color-border)">
          <div class="px-6 py-4 border-b flex justify-between items-center" style="border-color: var(--color-border); background: var(--color-surface-2)">
            <h3 class="text-lg font-bold text-white">Planifier un examen</h3>
            <button (click)="closeModal()" class="text-gray-400 hover:text-white transition-colors">
              <span class="text-xl">&times;</span>
            </button>
          </div>
          <form (ngSubmit)="onSubmit()" #examForm="ngForm" class="p-6">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-1" style="color: var(--color-text-muted)">Élève</label>
                <select name="studentId" [(ngModel)]="newExam.studentId" required
                        class="w-full px-4 py-2 rounded-lg border text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                        style="background: rgba(0,0,0,0.2); border-color: var(--color-border)">
                  <option value="" disabled selected>Sélectionner un élève</option>
                  <option *ngFor="let student of allStudents" [value]="student.id">
                    {{ student.user?.firstName }} {{ student.user?.lastName }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1" style="color: var(--color-text-muted)">Type d'examen</label>
                <select name="type" [(ngModel)]="newExam.type" required
                        class="w-full px-4 py-2 rounded-lg border text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                        style="background: rgba(0,0,0,0.2); border-color: var(--color-border)">
                  <option value="" disabled selected>Choisir (code/driving)</option>
                  <option value="code">Code de la route</option>
                  <option value="driving">Conduite pratique</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1" style="color: var(--color-text-muted)">Date prévue</label>
                <input type="date" name="date" [(ngModel)]="newExam.date" required
                       class="w-full px-4 py-2 rounded-lg border text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                       style="background: rgba(0,0,0,0.2); border-color: var(--color-border)" />
              </div>
            </div>
            
            <div class="mt-8 flex gap-3 justify-end">
              <button type="button" (click)="closeModal()" class="px-4 py-2 rounded-lg text-sm font-medium transition-colors border hover:bg-white/5" style="border-color: var(--color-border); color: var(--color-text-muted)">
                Annuler
              </button>
              <button type="submit" [disabled]="!examForm.form.valid || isSubmitting"
                      class="px-5 py-2 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-50"
                      style="background: linear-gradient(135deg, #f59e0b, #d97706)">
                <span *ngIf="!isSubmitting">Planifier</span>
                <span *ngIf="isSubmitting" class="flex items-center gap-2">
                  <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                  Progression...
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class ExamsComponent implements OnInit {
  exams: Exam[] = [];
  allStudents: Student[] = [];
  isLoading = true;

  isModalOpen = false;
  isSubmitting = false;
  newExam = { studentId: '', type: '', date: '' };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadStudents();
    this.loadExams();
  }

  loadExams() {
    this.isLoading = true;
    this.http.get<Exam[]>(`${environment.apiUrl}/exams/upcoming`).subscribe({
      next: (data) => { this.exams = data; this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }

  loadStudents() {
    this.http.get<Student[]>(`${environment.apiUrl}/admin/students`).subscribe({
      next: (data) => this.allStudents = data,
      error: (err) => console.error('Failed to load students', err)
    });
  }

  openModal() {
    this.newExam = { studentId: '', type: '', date: '' };
    if (!this.allStudents.length) {
      this.loadStudents();
    }
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  onSubmit() {
    if (!this.newExam.studentId || !this.newExam.type || !this.newExam.date) return;
    this.isSubmitting = true;
    this.http.post(`${environment.apiUrl}/exams/register`, this.newExam).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.closeModal();
        this.loadExams(); // Refresh list
      },
      error: (err) => {
        console.error('Error scheduling exam', err);
        this.isSubmitting = false;
      }
    });
  }

  getStudentLabel(studentId: string): string {
    const student = this.allStudents.find((item) => item.id === studentId);
    if (!student) {
      return `Candidat ${studentId.slice(0, 6)}`;
    }
    const name = `${student.user?.firstName || ''} ${student.user?.lastName || ''}`.trim();
    return name || `Candidat ${student.id.slice(0, 6)}`;
  }
}
