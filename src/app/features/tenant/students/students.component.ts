import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  licenseType?: string;
}

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-white">Élèves</h1>
          <p class="text-sm mt-1" style="color: var(--color-text-muted)">Liste des élèves inscrits</p>
        </div>
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
              <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">Permis</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let s of students" class="border-t hover:bg-white/5 transition-colors" style="border-color: var(--color-border)">
              <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                       style="background: linear-gradient(135deg, #4f46e5, #06b6d4)">
                    {{ s.firstName.charAt(0) }}{{ s.lastName.charAt(0) }}
                  </div>
                  <span class="font-medium text-white">{{ s.firstName }} {{ s.lastName }}</span>
                </div>
              </td>
              <td class="px-5 py-4" style="color: var(--color-text-muted)">{{ s.email }}</td>
              <td class="px-5 py-4" style="color: var(--color-text-muted)">{{ s.phone || '—' }}</td>
              <td class="px-5 py-4">
                <span class="px-2 py-1 rounded-full text-xs font-medium" style="background: rgba(79,70,229,0.15); color: #818cf8">
                  {{ s.licenseType || 'B' }}
                </span>
              </td>
            </tr>
            <tr *ngIf="students.length === 0">
              <td colspan="4" class="px-5 py-12 text-center text-sm" style="color: var(--color-text-muted)">Aucun élève trouvé.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class StudentsComponent implements OnInit {
  students: Student[] = [];
  isLoading = true;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<Student[]>(`${environment.apiUrl}/students`).subscribe({
      next: (data) => { this.students = data; this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }
}
