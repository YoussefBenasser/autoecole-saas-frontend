import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment';

interface Tenant {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
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
                      (click)="approveTenant(tenant.id)"
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
  isLoading = false;
  expandedTenantId: string | null = null;
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
      'linear-gradient(135deg, #ff7a6c 0%, #ffb86c 100%)',
      'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
      'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    ];
    const index = (name?.charCodeAt(0) ?? 0) % colors.length;
    return colors[index];
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
  }

  approveTenant(tenantId: string) {
    this.http.post(`${environment.apiUrl}/super-admin/tenants/${tenantId}/approve`, {}).subscribe({
      next: () => {
        this.loadDashboardData(); // Refresh data
      },
      error: (error) => {
        console.error('Error approving tenant:', error);
        alert('Erreur lors de l\'approbation: ' + (error?.error?.message || error?.message || 'Erreur inconnue'));
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
