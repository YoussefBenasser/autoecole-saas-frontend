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
  // Backend exposes these at root level via @Transient @JsonProperty
  nom?: string;
  prenom?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  telephone?: string;
  // Also handle nested user object in case structure changes
  user?: {
    nom?: string;
    prenom?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    telephone?: string;
  };
  level?: string;
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
            <h1 class="page-title">Élèves</h1>
            <p class="page-subtitle">Gérez vos élèves inscrits et ajoutez-en de nouveaux</p>
          </div>
        </div>
        <button (click)="openModal()" class="btn-primary">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="btn-icon">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Ajouter un élève
        </button>
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
        <input type="text" name="searchTerm" [(ngModel)]="searchTerm" placeholder="Rechercher un élève..." class="search-input" />
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
                  <span class="user-name">{{ s.prenom || s.firstName || s.user?.prenom || s.user?.firstName || '—' }}</span>
                </div>
              </td>
              <td class="user-name">{{ s.nom || s.lastName || s.user?.nom || s.user?.lastName || '—' }}</td>
              <td class="text-muted">{{ s.email || s.user?.email || '—' }}</td>
              <td class="text-muted"><span *ngIf="s.telephone || s.user?.telephone">{{ s.telephone || s.user?.telephone }}</span><span *ngIf="!s.telephone && !s.user?.telephone">—</span></td>
              <td>
                <span class="level-badge" [ngClass]="getLevelClass(s.level)">
                  {{ s.level || 'Non défini' }}
                </span>
              </td>
            </tr>
            <tr *ngIf="filteredStudents.length === 0">
              <td colspan="5" class="empty-state">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="empty-icon">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                </svg>
                <p>Aucun élève trouvé.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Create Student Modal -->
      <div *ngIf="isModalOpen" class="modal-overlay" (click)="closeModal()">
        <div class="modal-container" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-header-left">
              <div class="modal-icon">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                </svg>
              </div>
              <h3>Ajouter un élève</h3>
            </div>
            <button (click)="closeModal()" class="modal-close">&times;</button>
          </div>
          <form (ngSubmit)="onSubmit()" #studentForm="ngForm" class="modal-body">
            <div class="form-group">
              <label>Prénom</label>
              <input type="text" name="prenom" [(ngModel)]="newStudent.prenom" required
                     placeholder="Prénom de l'élève" class="form-input" />
            </div>
            <div class="form-group">
              <label>Nom</label>
              <input type="text" name="nom" [(ngModel)]="newStudent.nom" required
                     placeholder="Nom de famille" class="form-input" />
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" name="email" [(ngModel)]="newStudent.email" required email
                     placeholder="eleve@exemple.com" class="form-input" />
            </div>
            <div class="form-group">
              <label>Mot de passe provisoire</label>
              <input type="password" name="password" [(ngModel)]="newStudent.password" required minlength="6"
                     placeholder="••••••" class="form-input" />
            </div>
            <div class="form-group">
              <label>Niveau</label>
              <select name="level" [(ngModel)]="newStudent.level" required class="form-input">
                <option value="" disabled>Sélectionner un niveau</option>
                <option value="Débutant">Débutant</option>
                <option value="Intermédiaire">Intermédiaire</option>
                <option value="Avancé">Avancé</option>
              </select>
            </div>
            <div class="form-group">
              <label>Téléphone</label>
              <input type="tel" name="telephone" [(ngModel)]="newStudent.telephone"
                     placeholder="06 12 34 56 78" class="form-input" />
            </div>
            <div class="modal-actions">
              <button type="button" (click)="closeModal()" class="btn-ghost">Annuler</button>
              <button type="submit" [disabled]="!studentForm.form.valid || isSubmitting" class="btn-primary">
                <span *ngIf="!isSubmitting">Créer l'élève</span>
                <span *ngIf="isSubmitting" class="btn-loading">
                  <div class="spinner-sm"></div>
                  Création...
                </span>
              </button>
            </div>
          </form>
        </div>
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

    .spinner-sm {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-top-color: white;
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

    /* Buttons */
    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%);
      border: none;
      border-radius: 14px;
      color: white;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 6px 20px rgba(79, 70, 229, 0.3);
      font-family: inherit;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px) scale(1.03);
      box-shadow: 0 10px 30px rgba(79, 70, 229, 0.4);
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-icon {
      width: 18px;
      height: 18px;
    }

    .btn-ghost {
      padding: 0.75rem 1.25rem;
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 14px;
      color: rgba(255, 255, 255, 0.7);
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
    }

    .btn-ghost:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.25);
    }

    .btn-loading {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    /* MODAL */
    .modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(8px);
      animation: fadeIn 0.2s ease-out;
    }

    .modal-container {
      width: 100%;
      max-width: 480px;
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.98), rgba(15, 23, 42, 0.98));
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
      animation: modalIn 0.3s ease-out;
    }

    @keyframes modalIn {
      from { opacity: 0; transform: scale(0.95) translateY(20px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.5rem 1.75rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.03);
    }

    .modal-header-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .modal-header h3 {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 700;
      color: white;
    }

    .modal-icon {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: linear-gradient(135deg, #4f46e5, #06b6d4);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .modal-icon svg {
      width: 20px;
      height: 20px;
      color: white;
    }

    .modal-close {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      color: rgba(255, 255, 255, 0.6);
      font-size: 1.3rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .modal-close:hover {
      background: rgba(255, 255, 255, 0.12);
      color: white;
    }

    .modal-body {
      padding: 1.75rem;
    }

    .form-group {
      margin-bottom: 1.25rem;
    }

    .form-group label {
      display: block;
      font-size: 0.85rem;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.65);
      margin-bottom: 0.5rem;
    }

    .form-input {
      width: 100%;
      padding: 0.75rem 1rem;
      background: rgba(0, 0, 0, 0.25);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      color: white;
      font-size: 0.9rem;
      outline: none;
      transition: all 0.3s ease;
      font-family: inherit;
    }

    .form-input::placeholder { color: rgba(255, 255, 255, 0.3); }

    .form-input:focus {
      border-color: rgba(79, 70, 229, 0.5);
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
    }

    .form-input option {
      background: #1e293b;
      color: white;
    }

    .modal-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
      margin-top: 1.75rem;
      padding-top: 1.25rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

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

  isModalOpen = false;
  isSubmitting = false;
  newStudent = { prenom: '', nom: '', email: '', password: '', level: '', telephone: '' };

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.loadStudents();
  }

  get filteredStudents(): Student[] {
    if (!this.searchTerm.trim()) return this.students;
    const term = this.searchTerm.toLowerCase();
    return this.students.filter(s =>
      (s.prenom || s.user?.prenom || '').toLowerCase().includes(term) ||
      (s.nom || s.user?.nom || '').toLowerCase().includes(term) ||
      (s.email || s.user?.email || '').toLowerCase().includes(term) ||
      (s.telephone || s.user?.telephone || '').toLowerCase().includes(term) ||
      (s.name || '').toLowerCase().includes(term)
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
    const first = (student.prenom || student.firstName || student.user?.prenom || student.user?.firstName)?.trim();
    const last = (student.nom || student.lastName || student.user?.nom || student.user?.lastName)?.trim();

    if (first || last) {
      return `${first || ''} ${last || ''}`.trim();
    }

    if (student.user?.email) {
      return student.user.email;
    }

    return 'Nom non renseigné';
  }

  getInitials(student: Student): string {
    const first = (student.prenom || student.firstName || student.user?.prenom || student.user?.firstName || '').trim();
    const last = (student.nom || student.lastName || student.user?.nom || student.user?.lastName || '').trim();
    if (first || last) {
      return `${first.charAt(0) || ''}${last.charAt(0) || ''}`.toUpperCase();
    }
    const email = student.email || student.user?.email || '';
    return (email.charAt(0) || 'N').toUpperCase();
  }

  private normalizeStudent(student: any): Student {
    // Keep raw data exactly as provided by the backend to prevent stripping fields
    return {
      ...student,
      // Provide robust fallbacks directly so the template always has something to display
      prenom: student.prenom || student.firstName || student.user?.prenom || student.user?.firstName || '',
      nom: student.nom || student.lastName || student.user?.nom || student.user?.lastName || '',
      telephone: student.telephone || student.user?.telephone || '',
      email: student.email || student.user?.email || '',
    };
  }

  loadStudents() {
    this.isLoading = true;
    this.http.get<Student[]>(`${environment.apiUrl}/admin/students`).subscribe({
      next: (data) => {
        console.log('✅ Students loaded:', data);
        console.log('Total students:', data.length);

        this.students = data.map(student => this.normalizeStudent(student));

        // Debug: check each student's user data
        this.students.forEach((student, index) => {
          console.log(`Student ${index}:`, {
            id: student.id,
            name: student.name,
            fullName: student.fullName,
            full_name: student.full_name,
            userName: student.user?.name,
            userFullName: student.user?.fullName,
            userFull_name: student.user?.full_name,
            userExists: !!student.user,
            firstName: student.user?.firstName,
            lastName: student.user?.lastName,
            email: student.user?.email,
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

  openModal() {
    this.newStudent = { prenom: '', nom: '', email: '', password: '', level: '', telephone: '' };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  onSubmit() {
    if (!this.newStudent.prenom || !this.newStudent.nom || !this.newStudent.email || !this.newStudent.password || !this.newStudent.level) return;
    this.isSubmitting = true;

    const payload = {
      prenom: this.newStudent.prenom.trim(),
      nom: this.newStudent.nom.trim(),
      email: this.newStudent.email.trim(),
      password: this.newStudent.password,
      level: this.newStudent.level,
      telephone: this.newStudent.telephone?.trim() || null
    };

    console.log('Creating student with data:', payload);

    this.http.post<any>(`${environment.apiUrl}/admin/students`, payload).subscribe({
      next: (response) => {
        console.log('Student created successfully:', response);
        console.log('Response user object:', response.user);
        this.isSubmitting = false;
        this.closeModal();
        this.loadStudents();
      },
      error: (err) => {
        console.error('Error creating student:', err);
        alert('Erreur lors de la création: ' + (err?.error?.message || err?.message || 'Erreur inconnue'));
        this.isSubmitting = false;
      }
    });
  }
}
