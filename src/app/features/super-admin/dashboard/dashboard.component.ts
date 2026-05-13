import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';

interface Tenant {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt?: string;
}

interface Student {
  id: string;
  name?: string;
  fullName?: string;
  full_name?: string;
  tenantName?: string;
  user?: {
    name?: string;
    fullName?: string;
    full_name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  firstName?: string;
  lastName?: string;
  level?: string;
}

interface AuditLog {
  id: string;
  tenantId: string;
  userId?: string;
  action: string;
  timestamp: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="dashboard-container">
      <!-- Header Section -->
      <div class="header">
        <div class="header-content">
          <div>
            <h1 class="header-title">🎯 Tableau de Bord Administrateur</h1>
            <p class="header-subtitle">Contrôlez et gérez votre plateforme d'auto-école avec puissance et élégance</p>
          </div>
          <div class="header-actions">
            <div class="date-display">
              <svg class="calendar-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span class="current-date">{{ today }}</span>
            </div>
            <button class="refresh-button" (click)="refresh()" [disabled]="isLoading">
              <svg *ngIf="!isLoading" class="refresh-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <svg *ngIf="isLoading" class="loading-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span class="refresh-text">{{ isLoading ? 'Actualisation...' : 'Actualiser' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="stats-overview">
        <!-- Total Schools -->
        <div class="stat-card total-card">
          <div class="stat-header">
            <div class="stat-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span class="stat-title">Écoles Totales</span>
          </div>
          <div class="stat-value">{{ totalTenants }}</div>
          <div class="stat-change positive">📈 +12% ce mois</div>
        </div>

        <!-- Approved Schools -->
        <div class="stat-card approved-card">
          <div class="stat-header">
            <div class="stat-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span class="stat-title">Écoles Approuvées</span>
          </div>
          <div class="stat-value">{{ approvedTenants }}</div>
          <div class="stat-progress">
            <div class="progress-bar">
              <div class="progress-fill" [style.width]="approvalRate + '%'"></div>
            </div>
            <span class="progress-text">{{ approvalRate }}% approuvées</span>
          </div>
        </div>

        <!-- Pending Schools -->
        <div class="stat-card pending-card">
          <div class="stat-header">
            <div class="stat-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span class="stat-title">En Attente</span>
          </div>
          <div class="stat-value">{{ pendingTenants }}</div>
          <div class="stat-change">⏳ Validation requise</div>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="content-grid">
        <!-- Recent Students Table -->
        <div class="recent-students">
          <div class="section-header">
            <h2 class="section-title">👨‍🎓 Élèves Récemment Inscrits</h2>
            <p class="section-subtitle">Derniers élèves inscrits dans la plateforme</p>
          </div>

          <div *ngIf="isLoading" class="loading">
            <div class="spinner"></div>
            <p>Chargement des élèves...</p>
          </div>

          <div *ngIf="!isLoading" class="students-grid">
            <div *ngFor="let student of recentStudents" class="student-card">
              <div class="card-header">
                <div class="student-avatar" [style.background]="getAvatarBg(getStudentDisplayName(student))">
                  {{ getStudentInitials(student) }}
                </div>
                <div class="student-info">
                  <h3 class="student-name">{{ (student.user?.firstName || student.firstName || '') }} {{ (student.user?.lastName || student.lastName || '') }}</h3>
                  <p class="student-school">{{ student.tenantName || 'École non renseignée' }}</p>
                </div>
              </div>
            </div>

            <div *ngIf="recentStudents.length === 0" class="empty">
              <svg class="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3>Aucun élève inscrit</h3>
              <p>Les nouveaux élèves apparaîtront ici automatiquement.</p>
            </div>
          </div>
        </div>

        <!-- Recent Tenants Table -->
        <div class="recent-tenants">
          <div class="section-header">
            <h2 class="section-title">🏢 Inscriptions Récentes</h2>
            <p class="section-subtitle">Dernières demandes d'inscription d'auto-écoles</p>
          </div>

          <div *ngIf="isLoading" class="loading">
            <div class="spinner"></div>
            <p>Chargement des données...</p>
          </div>

          <div *ngIf="!isLoading" class="tenants-grid">
            <div *ngFor="let tenant of recentTenants" class="tenant-card" [class.pending]="tenant.status === 'PENDING'" [class.expanded]="expandedTenantId === tenant.id">
              <div class="card-header" (click)="toggleExpand(tenant.id)">
                <div class="tenant-avatar" [class.pending-avatar]="tenant.status === 'PENDING'" [style.background]="getAvatarBg(tenant.name)">
                  {{ tenant.name.charAt(0).toUpperCase() }}
                </div>
                <div class="tenant-info">
                  <h3 class="tenant-name">{{ tenant.name }}</h3>
                </div>
                <div class="tenant-status" style="margin-left: auto; display: flex; align-items: center; gap: 1rem;">
                  <span class="status-badge" [ngClass]="tenant.status.toLowerCase()">
                    <svg *ngIf="tenant.status === 'ACTIVE' || tenant.status === 'APPROVED'" class="status-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <svg *ngIf="tenant.status === 'PENDING'" class="status-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <svg *ngIf="tenant.status === 'REJECTED'" class="status-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {{ tenant.status === 'ACTIVE' || tenant.status === 'APPROVED' ? 'Approuvé' : (tenant.status === 'REJECTED' ? 'Refusé' : 'En attente') }}
                  </span>
                  <div class="expand-indicator">
                    <svg class="chevron-icon" [class.rotated]="expandedTenantId === tenant.id" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div class="card-body" [class.show]="expandedTenantId === tenant.id">
                <div class="tenant-details">
                  <div class="detail-item">
                    <svg class="detail-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span class="detail-text">{{ tenant.email }}</span>
                  </div>
                </div>

                <div class="card-actions">
                  <div *ngIf="tenant.status === 'PENDING'" style="display: flex; gap: 0.5rem; width: 100%;">
                    <button
                      (click)="openPasswordModal(tenant.id)"
                      class="action-button approve-button"
                      [disabled]="isLoading">
                      <svg class="button-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Approuver</span>
                    </button>

                    <button
                      (click)="rejectTenant(tenant.id)"
                      class="action-button reject-button"
                      [disabled]="isLoading" style="background: rgba(239, 68, 68, 0.2); border-color: rgba(239,68,68,0.4); color: #fca5a5;">
                      <svg class="button-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>Rejeter</span>
                    </button>
                  </div>

                  <div *ngIf="tenant.status === 'ACTIVE' || tenant.status === 'APPROVED'" class="approved-indicator">
                    <svg class="approved-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>École active</span>
                  </div>
                  <div *ngIf="tenant.status === 'REJECTED'" class="approved-indicator" style="color: #ef4444;">
                    <svg class="approved-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>École refusée</span>
                  </div>
                </div>
              </div>
            </div>

            <div *ngIf="recentTenants.length === 0" class="empty">
              <svg class="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3>Aucune inscription récente</h3>
              <p>Les nouvelles demandes apparaîtront ici automatiquement.</p>
            </div>
          </div>
        </div>

        <!-- Audit Logs Table -->
        <div class="recent-logs">
          <div class="section-header">
            <h2 class="section-title">📜 Journal d'Audit</h2>
            <p class="section-subtitle">Dernières activités sur la plateforme</p>
          </div>

          <div *ngIf="isLoading" class="loading">
            <div class="spinner"></div>
            <p>Chargement du journal...</p>
          </div>

          <div *ngIf="!isLoading" class="logs-list" style="display: flex; flex-direction: column; gap: 1rem;">
            <div *ngFor="let log of recentLogs" class="log-card" style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 1rem; display: flex; justify-content: space-between; align-items: center;">
              <div class="log-info" style="display: flex; gap: 1rem; align-items: center;">
                <div class="log-icon" style="background: rgba(14, 165, 233, 0.2); color: #38bdf8; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width: 20px; height: 20px;">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 style="margin: 0; color: #f8fafc; font-size: 1rem;">{{ log.action }}</h4>
                  <p style="margin: 0; color: #94a3b8; font-size: 0.875rem;">Utilisateur ID: {{ log.userId || 'Système' }} | Locataire: {{ log.tenantId }}</p>
                </div>
              </div>
              <div class="log-time" style="color: #64748b; font-size: 0.875rem;">
                {{ log.timestamp | date:'dd/MM/yyyy HH:mm' }}
              </div>
            </div>

            <div *ngIf="recentLogs.length === 0" class="empty">
              <svg class="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3>Aucune activité</h3>
              <p>Les activités apparaîtront ici.</p>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions">
          <div class="section-header">
            <h2 class="section-title">⚡ Actions Rapides</h2>
          </div>

          <div class="actions-grid">
            <a routerLink="/super-admin/tenants" class="action-item">
              <div class="action-icon">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div class="action-content">
                <h4>Gérer les Écoles</h4>
                <p>Approuver ou rejeter les demandes d'inscription</p>
              </div>
            </a>

            <a routerLink="/super-admin/monitors" class="action-item">
              <div class="action-icon">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div class="action-content">
                <h4>Moniteurs</h4>
                <p>Gérer les instructeurs de conduite</p>
              </div>
            </a>

            <a routerLink="/super-admin/students" class="action-item">
              <div class="action-icon">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div class="action-content">
                <h4>Étudiants</h4>
                <p>Consulter les élèves inscrits</p>
              </div>
            </a>

            <a routerLink="/super-admin/payments" class="action-item">
              <div class="action-icon">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div class="action-content">
                <h4>Paiements</h4>
                <p>Suivre les transactions financières</p>
              </div>
            </a>
          </div>
        </div>
      </div>

      <!-- Password Modal -->
      <div *ngIf="showPasswordModal" class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title">Approuver l'auto-école</h2>
            <button class="close-btn" (click)="closePasswordModal()">&times;</button>
          </div>
          <div class="modal-body">
            <p class="modal-description">Veuillez définir un mot de passe provisoire pour permettre à l'auto-école de se connecter immédiatement.</p>
            <p class="modal-note">Si vous laissez ce champ vide, un e-mail contenant un lien de configuration lui sera envoyé.</p>
            
            <div class="input-group">
              <label>Mot de passe provisoire</label>
              <input type="text" [(ngModel)]="provisionalPassword" placeholder="Ex: AutoEcole123!" class="password-input" />
            </div>
          </div>
          
          <div class="modal-actions">
            <button class="cancel-btn" (click)="closePasswordModal()" [disabled]="isSubmitting">Annuler</button>
            <button class="confirm-btn" (click)="submitApproval()" [disabled]="isSubmitting">
              {{ isSubmitting ? 'En cours...' : 'Approuver' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  totalTenants = 0;
  approvedTenants = 0;
  pendingTenants = 0;
  approvalRate = 0;
  recentTenants: Tenant[] = [];
  recentStudents: Student[] = [];
  recentLogs: AuditLog[] = [];
  isLoading = false;
  expandedTenantId: string | null = null;
  showPasswordModal = false;
  selectedTenantIdForApproval: string | null = null;
  provisionalPassword = '';
  isSubmitting = false;

  today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  toggleExpand(id: string): void {
    if (this.expandedTenantId === id) {
      this.expandedTenantId = null;
    } else {
      this.expandedTenantId = id;
    }
  }

  getAvatarBg(name: string): string {
    const colors = [
      'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)', // Sky to Blue
      'linear-gradient(135deg, #10b981 0%, #059669 100%)', // Emerald
      'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', // Violet
      'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', // Amber
      'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', // Pink
      'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)'  // Teal
    ];
    const index = (name?.charCodeAt(0) ?? 0) % colors.length;
    return colors[index];
  }

  getStudentDisplayName(student: Student): string {
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
    return 'Nom non renseigné';
  }

  getStudentInitials(student: Student): string {
    const displayName = this.getStudentDisplayName(student);
    if (displayName && displayName !== 'Nom non renseigné') {
      const parts = displayName.split(' ');
      if (parts.length >= 2) {
        return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
      }
      return displayName.charAt(0).toUpperCase();
    }
    return 'N';
  }

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.isLoading = true;

    // Load tenants data
    this.http.get<Tenant[]>(`${environment.apiUrl}/super-admin/tenants`).subscribe({
      next: (tenants) => {
        this.totalTenants = tenants.length;
        this.approvedTenants = tenants.filter(t => t.status === 'ACTIVE' || t.status === 'APPROVED').length;
        this.pendingTenants = tenants.filter(t => t.status === 'PENDING').length;
        this.approvalRate = this.totalTenants > 0 ? Math.round((this.approvedTenants / this.totalTenants) * 100) : 0;
        this.recentTenants = tenants.slice(0, 5);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading tenants:', error);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });

    // Load students data
    this.http.get<Student[]>(`${environment.apiUrl}/super-admin/students`).subscribe({
      next: (students) => {
        this.recentStudents = students.slice(0, 5);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading students:', error);
      }
    });

    // Load audit logs
    this.http.get<AuditLog[]>(`${environment.apiUrl}/audit`).subscribe({
      next: (logs) => {
        this.recentLogs = logs.slice(0, 5);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading audit logs:', error);
      }
    });
  }

  openPasswordModal(tenantId: string) {
    this.selectedTenantIdForApproval = tenantId;
    this.provisionalPassword = '';
    this.showPasswordModal = true;
  }

  closePasswordModal() {
    this.showPasswordModal = false;
    this.selectedTenantIdForApproval = null;
    this.provisionalPassword = '';
  }

  submitApproval() {
    if (!this.selectedTenantIdForApproval) return;
    const tenantId = this.selectedTenantIdForApproval;
    const password = this.provisionalPassword.trim();

    this.isSubmitting = true;

    const body = password ? { provisionalPassword: password } : {};

    this.http.post<any>(`${environment.apiUrl}/super-admin/tenants/${tenantId}/approve`, body).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.closePasswordModal();
        if (response.provisionalPasswordSet) {
          alert('École approuvée ! Le tenant peut se connecter avec le mot de passe provisoire et devra le changer à la première connexion.');
        } else {
          alert('École approuvée avec succès. Un e-mail de configuration a été envoyé.');
        }
        this.loadDashboardData();
      },
      error: (error) => {
        console.error('Error approving tenant:', error);
        alert('Erreur lors de l\'approbation : ' + (error?.error?.message || error?.message || 'Erreur inconnue'));
        this.isSubmitting = false;
      }
    });
  }

  rejectTenant(tenantId: string) {
    const reason = prompt('Veuillez indiquer la raison du refus :');
    if (reason !== null) {
      this.http.post(`${environment.apiUrl}/super-admin/tenants/${tenantId}/reject`, { reason: reason || 'Raison non spécifiée' }).subscribe({
        next: () => {
          this.loadDashboardData();
        },
        error: (error) => {
          console.error('Error rejecting tenant:', error);
          alert('Erreur lors du refus: ' + (error?.error?.message || error?.message || 'Erreur inconnue'));
        }
      });
    }
  }

  sendPasswordLink(tenantId: string) {
    // This method is no longer needed as the backend handles both approval and email sending in validateTenant
    console.log('sendPasswordLink called but backend handles this automatically');
  }

  refresh() {
    this.loadDashboardData();
  }
}
