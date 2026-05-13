import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';

interface Student {
  id: string;
  name?: string;
  fullName?: string;
  full_name?: string;
  tenantName?: string;
  schoolName?: string;
  tenant?: { name?: string; id?: string };
  user?: {
    name?: string;
    fullName?: string;
    full_name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    telephone?: string;
  };
  firstName?: string;
  lastName?: string;
  telephone?: string;
  level?: string;
  prenom?: string;
  nom?: string;
  email?: string;
}

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-wrapper">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-left">
          <div class="header-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
          </div>
          <div>
            <h1 class="page-title">Tous les Élèves</h1>
            <p class="page-subtitle">Vue d'ensemble de tous les élèves inscrits dans toutes les auto-écoles</p>
          </div>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="kpi-row">
        <div class="kpi-card">
          <div class="kpi-icon" style="background: rgba(79,70,229,0.15);">🎓</div>
          <div class="kpi-info">
            <span class="kpi-value">{{ students.length }}</span>
            <span class="kpi-label">Total élèves</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background: rgba(34,197,94,0.15);">✅</div>
          <div class="kpi-info">
            <span class="kpi-value">{{ getCountByLevel('Avancé') }}</span>
            <span class="kpi-label">Niveau Avancé</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background: rgba(56,189,248,0.15);">📊</div>
          <div class="kpi-info">
            <span class="kpi-value">{{ getCountByLevel('Intermédiaire') }}</span>
            <span class="kpi-label">Intermédiaire</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background: rgba(245,158,11,0.15);">🆕</div>
          <div class="kpi-info">
            <span class="kpi-value">{{ getCountByLevel('Débutant') }}</span>
            <span class="kpi-label">Débutant</span>
          </div>
        </div>
      </div>

      <!-- Search -->
      <div class="search-bar">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="search-icon">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input type="text" name="searchTerm" [(ngModel)]="searchTerm" placeholder="Rechercher un élève, une école..." class="search-input" />
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Chargement des élèves...</p>
      </div>

      <!-- Table -->
      <div *ngIf="!isLoading" class="glass-table-container">
        <table class="glass-table">
          <thead>
            <tr>
              <th>Prénom</th>
              <th>Nom</th>
              <th>École</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Niveau</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let s of filteredStudents; let i = index" class="table-row" [style.animation-delay]="(i * 0.04) + 's'">
              <td>
                <div class="user-cell">
                  <div class="avatar avatar-indigo">
                    {{ getInitials(s) }}
                  </div>
                  <span class="user-name">{{ s.user?.firstName || s.firstName || '—' }}</span>
                </div>
              </td>
              <td class="user-name">{{ s.user?.lastName || s.lastName || s.nom || '—' }}</td>
              <td class="school-cell">
                <span *ngIf="s.schoolName || s.tenantName || s.tenant?.name" class="school-badge">
                  🏫 {{ s.schoolName || s.tenantName || s.tenant?.name }}
                </span>
                <span *ngIf="!s.schoolName && !s.tenantName && !s.tenant?.name" class="no-school">—</span>
              </td>
              <td class="text-muted">{{ s.user?.email || '—' }}</td>
              <td class="text-muted">{{ s.telephone || s.user?.telephone || '—' }}</td>
              <td>
                <span class="level-badge" [ngClass]="getLevelClass(s.level)">
                  {{ s.level || 'Non défini' }}
                </span>
              </td>
            </tr>
            <tr *ngIf="filteredStudents.length === 0">
              <td colspan="6" class="empty-state">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="empty-icon">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                </svg>
                <p>Aucun élève trouvé.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .page-wrapper {
      animation: fadeIn 0.5s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes slideInRow {
      from { opacity: 0; transform: translateX(-10px); }
      to { opacity: 1; transform: translateX(0); }
    }

    /* Page Header */
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2rem;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .header-icon {
      width: 52px;
      height: 52px;
      border-radius: 16px;
      background: linear-gradient(135deg, #4f46e5, #06b6d4);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 20px rgba(79, 70, 229, 0.3);
    }

    .header-icon svg {
      width: 26px;
      height: 26px;
      color: white;
    }

    .page-title {
      font-size: 1.75rem;
      font-weight: 800;
      margin: 0;
      background: linear-gradient(135deg, #ffffff 0%, #c7d2fe 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .page-subtitle {
      margin: 0.25rem 0 0 0;
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.9rem;
    }

    /* KPI Row */
    .kpi-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .kpi-card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: all 0.3s ease;
    }

    .kpi-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
      border-color: rgba(255, 255, 255, 0.18);
    }

    .kpi-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.3rem;
      flex-shrink: 0;
    }

    .kpi-info {
      display: flex;
      flex-direction: column;
    }

    .kpi-value {
      font-size: 1.5rem;
      font-weight: 800;
      color: #ffffff;
    }

    .kpi-label {
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.55);
      font-weight: 500;
    }

    /* Search */
    .search-bar {
      position: relative;
      margin-bottom: 1.5rem;
    }

    .search-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      width: 18px;
      height: 18px;
      color: rgba(255, 255, 255, 0.4);
    }

    .search-input {
      width: 100%;
      padding: 0.85rem 1rem 0.85rem 2.8rem;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 14px;
      color: white;
      font-size: 0.9rem;
      outline: none;
      transition: all 0.3s ease;
      font-family: inherit;
    }

    .search-input::placeholder { color: rgba(255, 255, 255, 0.35); }

    .search-input:focus {
      border-color: rgba(79, 70, 229, 0.5);
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
      background: rgba(255, 255, 255, 0.08);
    }

    /* Loading */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 4rem 0;
      color: rgba(255, 255, 255, 0.5);
    }

    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid rgba(255, 255, 255, 0.1);
      border-top-color: #4f46e5;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    /* Glass Table */
    .glass-table-container {
      background: rgba(255, 255, 255, 0.04);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
    }

    .glass-table {
      width: 100%;
      border-collapse: collapse;
    }

    .glass-table thead tr {
      background: rgba(255, 255, 255, 0.06);
    }

    .glass-table th {
      padding: 1rem 1.5rem;
      text-align: left;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: rgba(255, 255, 255, 0.5);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .glass-table td {
      padding: 1rem 1.5rem;
      font-size: 0.9rem;
    }

    .table-row {
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      transition: all 0.2s ease;
      animation: slideInRow 0.4s ease-out both;
    }

    .table-row:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    /* User Cell */
    .user-cell {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 700;
      color: white;
      flex-shrink: 0;
      text-transform: uppercase;
    }

    .avatar-indigo {
      background: linear-gradient(135deg, #4f46e5, #06b6d4);
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
    }

    .user-name {
      font-weight: 600;
      color: #ffffff;
    }

    .text-muted {
      color: rgba(255, 255, 255, 0.55);
    }

    /* Level Badges */
    .level-badge {
      display: inline-block;
      padding: 0.3rem 0.75rem;
      border-radius: 20px;
      font-size: 0.78rem;
      font-weight: 600;
    }

    .level-advanced {
      background: rgba(34, 197, 94, 0.15);
      color: #4ade80;
      border: 1px solid rgba(34, 197, 94, 0.2);
    }

    .level-intermediate {
      background: rgba(56, 189, 248, 0.15);
      color: #38bdf8;
      border: 1px solid rgba(56, 189, 248, 0.2);
    }

    .level-beginner {
      background: rgba(245, 158, 11, 0.15);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.2);
    }

    .level-default {
      background: rgba(148, 163, 184, 0.15);
      color: #94a3b8;
      border: 1px solid rgba(148, 163, 184, 0.2);
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 3rem 2rem !important;
      color: rgba(255, 255, 255, 0.4);
    }

    .empty-icon {
      width: 48px;
      height: 48px;
      margin: 0 auto 0.75rem;
      color: rgba(255, 255, 255, 0.2);
    }

    /* School Badge */
    .school-cell { vertical-align: middle; }
    .school-badge {
      display: inline-flex; align-items: center; gap: 0.3rem;
      padding: 0.3rem 0.7rem; border-radius: 20px; font-size: 0.78rem; font-weight: 600;
      background: rgba(79,70,229,0.12); border: 1px solid rgba(79,70,229,0.25); color: #a5b4fc;
    }
    .no-school { color: rgba(255, 255, 255, 0.3); }

    /* Responsive */
    @media (max-width: 768px) {
      .page-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
      .kpi-row { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class StudentsComponent implements OnInit {
  students: Student[] = [];
  isLoading = true;
  searchTerm = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  get filteredStudents(): Student[] {
    if (!this.searchTerm.trim()) return this.students;
    const term = this.searchTerm.toLowerCase();
    return this.students.filter(s =>
      (s.name || '').toLowerCase().includes(term) ||
      (s.tenantName || '').toLowerCase().includes(term) ||
      (s.user?.name || '').toLowerCase().includes(term) ||
      (s.user?.firstName || '').toLowerCase().includes(term) ||
      (s.user?.lastName || '').toLowerCase().includes(term) ||
      (s.user?.email || '').toLowerCase().includes(term) ||
      (s.telephone || s.user?.telephone || '').toLowerCase().includes(term)
    );
  }

  getCountByLevel(level: string): number {
    return this.students.filter(s => s.level === level).length;
  }

  getLevelClass(level?: string): string {
    switch (level) {
      case 'Avancé': return 'level-advanced';
      case 'Intermédiaire': return 'level-intermediate';
      case 'Débutant': return 'level-beginner';
      default: return 'level-default';
    }
  }

  getDisplayName(student: Student): string {
    if (student.name?.trim()) {
      return student.name.trim();
    }
    if (student.fullName?.trim()) {
      return student.fullName.trim();
    }
    if (student.full_name?.trim()) {
      return student.full_name.trim();
    }
    if (student.user?.name?.trim()) {
      return student.user.name.trim();
    }
    if (student.user?.fullName?.trim()) {
      return student.user.fullName.trim();
    }
    if (student.user?.full_name?.trim()) {
      return student.user.full_name.trim();
    }
    const first = (student.user?.firstName || student.firstName)?.trim();
    const last = (student.user?.lastName || student.lastName)?.trim();
    
    if (first || last) {
      return `${first || ''} ${last || ''}`.trim();
    }

    if (student.user?.email) {
      return student.user.email;
    }

    return 'Nom non renseigné';
  }

  getInitials(student: Student): string {
    const explicitName = student.name?.trim() || student.fullName?.trim() || student.full_name?.trim();
    if (explicitName) {
      const nameParts = explicitName.split(' ');
      if (nameParts.length >= 2) {
        return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
      }
      return explicitName.charAt(0).toUpperCase();
    }
    
    const userName = student.user?.name?.trim() || student.user?.fullName?.trim() || student.user?.full_name?.trim();
    if (userName) {
      const nameParts = userName.split(' ');
      if (nameParts.length >= 2) {
        return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
      }
      return userName.charAt(0).toUpperCase();
    }
    
    const first = (student.user?.firstName || student.firstName)?.trim();
    const last = (student.user?.lastName || student.lastName)?.trim();
    if (first || last) {
      return `${first?.charAt(0) || ''}${last?.charAt(0) || ''}`.toUpperCase();
    }

    return (student.user?.email?.charAt(0) || 'N').toUpperCase();
  }

  private normalizeStudent(student: Student): Student {
    const explicitName = student.name?.trim() || student.fullName?.trim() || student.full_name?.trim()
      || student.user?.name?.trim() || student.user?.fullName?.trim() || student.user?.full_name?.trim();
    const first = (student.user?.firstName || student.firstName || student.prenom || '').trim();
    const last = (student.user?.lastName || student.lastName || student.nom || '').trim();
    const normalizedName = explicitName || [first, last].filter(Boolean).join(' ').trim();
    return {
      ...student,
      name: normalizedName || student.name,
      fullName: student.fullName || student.name || normalizedName,
      full_name: student.full_name || student.name || normalizedName,
      schoolName: student.schoolName || student.tenantName || student.tenant?.name,
    };
  }

  loadStudents() {
    this.isLoading = true;
    this.http.get<Student[]>(`${environment.apiUrl}/super-admin/students`).subscribe({
      next: (data) => {
        console.log('✅ Students loaded:', data);
        console.log('Total students:', data.length);
        
        this.students = data.map(student => this.normalizeStudent(student));
        
        this.students.forEach((student, index) => {
          console.log(`Student ${index}:`, {
            id: student.id,
            name: student.name,
            fullName: student.fullName,
            full_name: student.full_name,
            tenantName: student.tenantName,
            firstName: student.firstName,
            lastName: student.lastName,
            user: student.user,
            displayName: this.getDisplayName(student),
            studentKeys: Object.keys(student),
            userKeys: student.user ? Object.keys(student.user) : []
          });
        });
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Error loading students:', err);
        alert('Erreur lors du chargement: ' + (err?.error?.message || err?.message || 'Erreur inconnue'));
        this.isLoading = false;
      }
    });
  }
}