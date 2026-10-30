import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Tenant {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-tenants',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tenants-container">
      <!-- Header Section -->
      <div class="tenants-header">
        <div class="header-content">
          <div>
            <h1 class="tenants-title">Écoles partenaires</h1>
            <p class="tenants-subtitle">Gérez les inscriptions, validez les demandes et suivez l'activité des auto-écoles.</p>
          </div>

          <div class="header-actions">
            <div class="search-container">
              <div class="search-input-wrapper">
                <svg class="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  name="searchQuery"
                  placeholder="Rechercher une école, un email..."
                  [(ngModel)]="searchQuery"
                  (input)="onSearchInput()"
                  class="search-input"
                />
                <button *ngIf="searchQuery" (click)="clearSearch()" class="clear-button">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <button class="refresh-button" (click)="loadTenants()" [disabled]="isLoading">
              <svg *ngIf="!isLoading" class="refresh-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <svg *ngIf="isLoading" class="loading-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span class="refresh-text">{{ isLoading ? 'Chargement...' : 'Actualiser' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Statistics Bar -->
      <div class="stats-bar">
        <div class="stat-item">
          <div class="stat-number">{{ totalTenants }}</div>
          <div class="stat-label">Total Écoles</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-number">{{ approvedTenants }}</div>
          <div class="stat-label">Approuvées</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-number">{{ pendingTenants }}</div>
          <div class="stat-label">En Attente</div>
        </div>
      </div>

      <!-- Tenants Grid -->
      <div class="tenants-grid">
        <div *ngIf="isLoading" class="loading-state">
          <div class="loading-spinner">
            <svg class="spinner-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <p class="loading-text">Chargement des écoles...</p>
        </div>

        <div *ngIf="!isLoading && filteredTenants.length === 0" class="empty-state">
          <svg class="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 class="empty-title">Aucune école trouvée</h3>
          <p class="empty-description">
            {{ searchQuery ? 'Essayez un autre terme de recherche.' : 'Aucune école n\'est encore inscrite.' }}
          </p>
        </div>

        <div *ngFor="let tenant of filteredTenants" class="tenant-card" [class.pending]="tenant.status === 'PENDING'" [class.expanded]="expandedTenantId === tenant.id">
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
              <div class="detail-item" *ngIf="tenant.phone">
                <svg class="detail-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span class="detail-text">{{ tenant.phone }}</span>
              </div>
              <div class="detail-item">
                <svg class="detail-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span class="detail-text">
                  Inscrit le {{ tenant.createdAt ? formatDate(tenant.createdAt) : 'N/A' }}
                </span>
              </div>
            </div>

            <div class="card-actions">
              <div style="display: flex; gap: 0.5rem; width: 100%; align-items: center; justify-content: flex-end;">
                <!-- Details button (Always visible) -->
                <button
                  (click)="openDetailModal(tenant); $event.stopPropagation()"
                  class="action-button details-button"
                  title="Voir les détails du dossier"
                  style="flex: 1; justify-content: center;">
                  <svg class="button-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>Détails</span>
                </button>

              <div *ngIf="tenant.status === 'PENDING'" style="display: flex; gap: 0.5rem; flex: 2;">

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
        </div>
      </div>

      <!-- Success / Error Toast -->
      <div *ngIf="successMessage" class="success-toast">
        <svg class="success-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <span>{{ successMessage }}</span>
        <button (click)="successMessage = ''" class="success-close">×</button>
      </div>

      <div *ngIf="errorMessage" class="error-toast">
        <svg class="error-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ errorMessage }}</span>
        <button (click)="errorMessage = ''" class="error-close">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- ===== Tenant Detail Modal ===== -->
      <div *ngIf="showDetailModal && selectedTenant" class="modal-overlay" (click.self)="closeDetailModal()">
        <div class="modal-content detail-modal-content">
          <div class="modal-header">
            <div class="modal-header-icon" style="background: linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.2)); border-color: rgba(99,102,241,0.3);">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style="color: #818cf8;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div style="flex:1;">
              <h2 class="modal-title">Dossier d'inscription</h2>
              <p class="modal-subtitle">Examinez les informations avant de statuer</p>
            </div>
            <button class="modal-close-btn" (click)="closeDetailModal()">&#x2715;</button>
          </div>

          <div class="detail-modal-body">
            <!-- Avatar + Name -->
            <div class="detail-hero">
              <div class="detail-avatar" [style.background]="getAvatarBg(selectedTenant.name)">
                {{ selectedTenant.name.charAt(0).toUpperCase() }}
              </div>
              <div class="detail-hero-info">
                <h3 class="detail-school-name">{{ selectedTenant.name }}</h3>
                <span class="status-badge pending" style="background: rgba(245,158,11,0.2); color: #f59e0b; border: 1px solid rgba(245,158,11,0.35); font-size: 0.78rem;">
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="margin-right:4px;vertical-align:middle;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  En attente de validation
                </span>
              </div>
            </div>

            <!-- Info grid -->
            <div class="detail-info-grid">
              <div class="detail-info-card">
                <div class="detail-info-label">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  Adresse e-mail
                </div>
                <div class="detail-info-value">{{ selectedTenant.email }}</div>
              </div>

              <div class="detail-info-card">
                <div class="detail-info-label">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  Téléphone
                </div>
                <div class="detail-info-value">{{ selectedTenant.phone || 'Non renseigné' }}</div>
              </div>

              <div class="detail-info-card">
                <div class="detail-info-label">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  Date d'inscription
                </div>
                <div class="detail-info-value">{{ selectedTenant.createdAt ? formatDate(selectedTenant.createdAt) : 'N/A' }}</div>
              </div>

              <div class="detail-info-card">
                <div class="detail-info-label">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Statut actuel
                </div>
                <div class="detail-info-value" style="color: #f59e0b;">En attente</div>
              </div>

              <div class="detail-info-card" *ngIf="selectedTenant.address">
                <div class="detail-info-label">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  Adresse
                </div>
                <div class="detail-info-value">{{ selectedTenant.address }}</div>
              </div>

              <div class="detail-info-card" *ngIf="selectedTenant.city">
                <div class="detail-info-label">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" /></svg>
                  Ville
                </div>
                <div class="detail-info-value">{{ selectedTenant.city }}</div>
              </div>
            </div>

            <!-- Divider -->
            <div style="border-top: 1px solid rgba(255,255,255,0.07); margin: 0.25rem 0;"></div>

            <!-- Unique ID -->
            <div style="padding: 0.75rem 0; display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-size: 0.78rem; color: rgba(255,255,255,0.35); font-family: monospace;">ID:</span>
              <span style="font-size: 0.78rem; color: rgba(255,255,255,0.25); font-family: monospace; word-break: break-all;">{{ selectedTenant.id }}</span>
            </div>
          </div>

          <div class="modal-actions" style="gap: 0.6rem;">
            <button class="modal-cancel-btn" (click)="closeDetailModal()" [disabled]="isSubmitting">Fermer</button>
            <button
              *ngIf="selectedTenant.status === 'PENDING'"
              class="action-button reject-button"
              style="flex:1; justify-content: center; padding: 0.85rem; border-radius: 12px; font-size:0.9rem; font-family:inherit;"
              (click)="closeDetailModal(); rejectTenant(selectedTenant.id)"
              [disabled]="isLoading">
              <svg class="button-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Rejeter
            </button>
            <button
              *ngIf="selectedTenant.status === 'PENDING'"
              class="modal-confirm-btn"
              style="flex:2;"
              (click)="closeDetailModal(); approveTenant(selectedTenant.id)"
              [disabled]="isLoading">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Approuver l'auto-école
            </button>
          </div>
        </div>
      </div>

      <!-- Password Modal -->
      <div *ngIf="showPasswordModal" class="modal-overlay" (click.self)="closePasswordModal()">
        <div class="modal-content">
          <div class="modal-header">
            <div class="modal-header-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 class="modal-title">Approuver l'auto-école</h2>
              <p class="modal-subtitle">Définissez un accès immédiat pour le tenant</p>
            </div>
            <button class="modal-close-btn" (click)="closePasswordModal()" [disabled]="isSubmitting">&times;</button>
          </div>

          <div class="modal-body">
            <div class="modal-info-box">
              <svg class="modal-info-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>Si vous entrez un mot de passe provisoire, le tenant pourra se connecter immédiatement et <strong>devra le changer à sa première connexion</strong>. Si vous laissez ce champ vide, un lien de configuration lui sera envoyé par e-mail.</p>
            </div>

            <div class="modal-field">
              <label class="modal-label">Mot de passe provisoire <span class="modal-optional">(facultatif)</span></label>
              <div class="modal-input-wrapper">
                <svg class="modal-input-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input
                  [type]="showProvisionalPassword ? 'text' : 'password'"
                  [(ngModel)]="provisionalPassword"
                  name="provisionalPassword"
                  placeholder="Ex: AutoEcole2024!"
                  class="modal-input"
                />
                <button type="button" class="modal-toggle-pw" (click)="toggleProvisionalPassword()">
                  <svg *ngIf="!showProvisionalPassword" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg *ngIf="showProvisionalPassword" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                </button>
              </div>
            </div>

            <div class="modal-notice" *ngIf="!provisionalPassword">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Un lien de configuration par e-mail sera envoyé au tenant</span>
            </div>
            <div class="modal-notice success-notice" *ngIf="provisionalPassword">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <span>Le tenant pourra se connecter immédiatement avec ce mot de passe provisoire</span>
            </div>
          </div>

          <div class="modal-actions">
            <button class="modal-cancel-btn" (click)="closePasswordModal()" [disabled]="isSubmitting">Annuler</button>
            <button class="modal-confirm-btn" (click)="submitApproval()" [disabled]="isSubmitting">
              <svg *ngIf="!isSubmitting" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span class="modal-spinner" *ngIf="isSubmitting"></span>
              {{ isSubmitting ? 'Approbation en cours...' : 'Confirmer l\'approbation' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }

    .tenants-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }

    /* Header Styles */
    .tenants-header {
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 2rem;
    }

    .tenants-title {
      font-size: 2.5rem;
      font-weight: 700;
      color: white;
      margin: 0 0 0.5rem 0;
      background: linear-gradient(135deg, #ff7a6c 0%, #ffb86c 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .tenants-subtitle {
      color: rgba(255, 255, 255, 0.7);
      font-size: 1.1rem;
      margin: 0;
      font-weight: 500;
      max-width: 500px;
    }

    .search-container {
      display: flex;
      align-items: center;
      gap: 1rem;
      min-width: 300px;
    }

    .search-input {
      flex: 1;
      padding: 0.75rem 1rem;
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      color: white;
      font-size: 1rem;
      transition: all 0.3s ease;
    }

    .search-input::placeholder {
      color: rgba(255, 255, 255, 0.6);
    }

    .search-input:focus {
      outline: none;
      border-color: rgba(255, 255, 255, 0.5);
      background: rgba(255, 255, 255, 0.15);
      box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
    }

    .search-button {
      padding: 0.75rem 1.5rem;
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 8px;
      color: white;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .search-button:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-1px);
    }

    .search-icon {
      width: 18px;
      height: 18px;
    }

    /* Statistics Bar Styles */
    .stats-bar {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-item {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(20px);
      border-radius: 12px;
      padding: 1.5rem;
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }

    .stat-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }

    .stat-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.5rem;
    }

    .stat-icon {
      width: 24px;
      height: 24px;
      color: rgba(255, 255, 255, 0.8);
    }

    .stat-title {
      font-size: 0.9rem;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.7);
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: 700;
      color: white;
      margin: 0;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    /* Tenants Grid Styles */
    .tenants-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .loading-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 4rem 2rem;
      color: rgba(255, 255, 255, 0.8);
      font-size: 1.1rem;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-top: 3px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem auto;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 4rem 2rem;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(20px);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .empty-icon {
      width: 64px;
      height: 64px;
      color: rgba(255, 255, 255, 0.6);
      margin: 0 auto 1rem auto;
    }

    .empty-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: white;
      margin: 0 0 0.5rem 0;
    }

    .empty-message {
      color: rgba(255, 255, 255, 0.8);
      margin: 0;
      line-height: 1.6;
    }

    .tenants-header {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 2rem;
    }

    .tenants-title {
      font-size: 2.5rem;
      font-weight: 700;
      color: #1a202c;
      margin: 0 0 0.5rem 0;
      background: linear-gradient(135deg, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .tenants-subtitle {
      color: #718096;
      font-size: 1.1rem;
      margin: 0;
      font-weight: 500;
      max-width: 500px;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      flex-shrink: 0;
    }

    .search-container {
      min-width: 300px;
    }

    .search-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-icon {
      position: absolute;
      left: 1rem;
      width: 18px;
      height: 18px;
      color: #9ca3af;
      z-index: 1;
    }

    .search-input {
      width: 100%;
      padding: 0.875rem 3rem 0.875rem 3rem;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      background: rgba(0, 0, 0, 0.3);
      font-size: 0.9rem;
      color: white;
      transition: all 0.3s ease;
      outline: none;
    }

    .search-input:focus {
      border-color: #ffb86c;
      box-shadow: 0 0 0 3px rgba(255, 184, 108, 0.2);
      background: rgba(0, 0, 0, 0.5);
    }

    .clear-button {
      position: absolute;
      right: 0.75rem;
      width: 20px;
      height: 20px;
      border: none;
      background: none;
      color: #9ca3af;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s ease;
    }

    .clear-button:hover {
      color: #6b7280;
    }

    .clear-button svg {
      width: 16px;
      height: 16px;
    }

    .refresh-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: linear-gradient(135deg, #ff7a6c 0%, #ffb86c 100%);
      color: #1a1a1a;
      border: none;
      padding: 0.875rem 1.25rem;
      border-radius: 12px;
      font-weight: 700;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(255, 122, 108, 0.3);
    }

    .refresh-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(255, 122, 108, 0.5);
    }

    .refresh-button:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
    }

    .refresh-icon, .loading-icon {
      width: 16px;
      height: 16px;
    }

    .loading-icon {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Tenant Card Styles */
    .tenant-card {
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(20px);
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      transition: all 0.3s ease;
      overflow: hidden;
      position: relative;
    }

    .tenant-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .tenant-card.pending {
      border: 1px solid rgba(255, 184, 108, 0.3);
      box-shadow: 0 0 20px rgba(255, 184, 108, 0.15);
    }

    .tenant-card.pending:hover {
      box-shadow: 0 0 35px rgba(255, 184, 108, 0.3);
    }

    .card-header {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid transparent;
      background: rgba(255, 255, 255, 0.02);
      cursor: pointer;
      display: flex;
      align-items: center;
      transition: background 0.3s ease;
    }

    .card-header:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    .tenant-info {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 0.2rem;
      flex: 1;
      margin-left: 1rem;
    }

    .tenant-avatar {
      width: 45px;
      height: 45px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      font-weight: 700;
      color: #1a1a1a;
      text-transform: uppercase;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
      position: relative;
    }

    .tenant-avatar.pending-avatar {
      animation: pulse-avatar 2s infinite;
    }

    @keyframes pulse-avatar {
      0% { box-shadow: 0 0 0 0 rgba(255, 184, 108, 0.6); }
      70% { box-shadow: 0 0 0 20px rgba(255, 184, 108, 0); }
      100% { box-shadow: 0 0 0 0 rgba(255, 184, 108, 0); }
    }

    .tenant-details h3 {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 700;
      color: white;
    }

    .expand-indicator {
      display: flex;
      align-items: center;
      color: rgba(255, 255, 255, 0.5);
    }

    .chevron-icon {
      width: 24px;
      height: 24px;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .chevron-icon.rotated {
      transform: rotate(180deg);
    }

    .card-body {
      max-height: 0;
      padding: 0 1.5rem;
      overflow: hidden;
      opacity: 0;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .card-body.show {
      padding: 1.5rem;
      max-height: 400px;
      opacity: 1;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.8rem;
    }

    .detail-icon {
      width: 18px;
      height: 18px;
      color: rgba(255, 255, 255, 0.5);
    }

    .detail-text {
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.95rem;
    }

   .tenant-details {
      margin-bottom: 1.5rem;
    }

    .status-indicator {
      margin-left: auto;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-indicator.pending {
      background: rgba(245, 158, 11, 0.2);
      color: #f59e0b;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .status-indicator.approved {
      background: rgba(34, 197, 94, 0.2);
      color: #22c55e;
      border: 1px solid rgba(34, 197, 94, 0.3);
    }

    .status-indicator.rejected {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    .card-body {
      padding: 1.5rem;
    }

    .tenant-meta {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .meta-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .meta-label {
      font-size: 0.8rem;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.6);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .meta-value {
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.9);
      font-weight: 500;
    }

    .card-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
    }

    .action-button {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 1.2rem;
      border: none;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
    }

    .action-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .approve-button {
      background: linear-gradient(135deg, #22c55e 0%, #10b981 100%);
      color: white;
      box-shadow: 0 5px 15px rgba(34, 197, 94, 0.3);
    }

    .approve-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(34, 197, 94, 0.4);
    }

    .reject-button {
      background: rgba(239, 68, 68, 0.1);
      color: #fca5a5;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    .reject-button:hover:not(:disabled) {
      background: rgba(239, 68, 68, 0.2) !important;
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(239, 68, 68, 0.2);
    }

    .details-button {
      background: rgba(99, 102, 241, 0.15);
      color: #a5b4fc;
      border: 1px solid rgba(99, 102, 241, 0.35);
    }

    .details-button:hover:not(:disabled) {
      background: rgba(99, 102, 241, 0.28);
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(99, 102, 241, 0.2);
    }

    /* ── Detail Modal ── */
    .detail-modal-content {
      width: min(620px, 100%);
    }

    .detail-modal-body {
      padding: 1.5rem 1.75rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .detail-hero {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: 1rem 1.25rem;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
    }

    .detail-avatar {
      width: 56px;
      height: 56px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.6rem;
      font-weight: 800;
      color: #1a1a1a;
      flex-shrink: 0;
      box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    }

    .detail-hero-info {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .detail-school-name {
      font-size: 1.25rem;
      font-weight: 700;
      color: white;
      margin: 0;
    }

    .detail-info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }

    .detail-info-card {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 12px;
      padding: 0.875rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .detail-info-label {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.4);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .detail-info-label svg {
      flex-shrink: 0;
      color: rgba(255, 255, 255, 0.3);
    }

    .detail-info-value {
      font-size: 0.9rem;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.9);
      word-break: break-word;
    }

    .button-icon {
      width: 16px;
      height: 16px;
    }

    .approved-indicator {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #22c55e;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .approved-icon {
      width: 18px;
      height: 18px;
    }

    /* Error Toast Styles */
    .error-toast {
      position: fixed;
      top: 2rem;
      right: 2rem;
      background: rgba(239, 68, 68, 0.9);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 8px;
      padding: 1rem 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
      z-index: 1000;
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .error-icon {
      width: 20px;
      height: 20px;
      color: white;
    }

    .error-close {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 4px;
      transition: background-color 0.2s ease;
    }

    .error-close:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .success-toast {
      position: fixed;
      top: 2rem;
      right: 2rem;
      background: rgba(34, 197, 94, 0.9);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(34, 197, 94, 0.3);
      border-radius: 8px;
      padding: 1rem 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
      z-index: 1000;
      animation: slideIn 0.3s ease;
    }

    .success-icon {
      width: 20px;
      height: 20px;
      color: white;
    }

    .success-close {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 4px;
      transition: background-color 0.2s ease;
    }

    .success-close:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    /* ── Modal Styles ── */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(8px);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      animation: fadeInOverlay 0.2s ease;
    }

    @keyframes fadeInOverlay {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-content {
      background: linear-gradient(135deg, rgba(20, 20, 40, 0.98) 0%, rgba(30, 20, 50, 0.98) 100%);
      backdrop-filter: blur(30px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 24px;
      width: min(560px, 100%);
      box-shadow: 0 40px 80px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255,255,255,0.05);
      animation: slideUpModal 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      overflow: hidden;
    }

    @keyframes slideUpModal {
      from { transform: translateY(30px) scale(0.96); opacity: 0; }
      to { transform: translateY(0) scale(1); opacity: 1; }
    }

    .modal-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.75rem 1.75rem 1.25rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .modal-header-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(16, 185, 129, 0.2));
      border: 1px solid rgba(34, 197, 94, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .modal-header-icon svg {
      width: 22px;
      height: 22px;
      color: #22c55e;
    }

    .modal-title {
      font-size: 1.2rem;
      font-weight: 700;
      color: white;
      margin: 0 0 0.2rem;
    }

    .modal-subtitle {
      font-size: 0.82rem;
      color: rgba(255,255,255,0.5);
      margin: 0;
    }

    .modal-close-btn {
      margin-left: auto;
      width: 32px;
      height: 32px;
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 8px;
      background: rgba(255,255,255,0.05);
      color: rgba(255,255,255,0.6);
      font-size: 1.2rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      flex-shrink: 0;
    }

    .modal-close-btn:hover:not(:disabled) {
      background: rgba(255,255,255,0.1);
      color: white;
    }

    .modal-close-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    .modal-body {
      padding: 1.5rem 1.75rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .modal-info-box {
      display: flex;
      gap: 0.75rem;
      padding: 1rem;
      background: rgba(59, 130, 246, 0.08);
      border: 1px solid rgba(59, 130, 246, 0.2);
      border-radius: 12px;
      color: rgba(147, 197, 253, 0.9);
      font-size: 0.875rem;
      line-height: 1.5;
    }

    .modal-info-icon {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
      margin-top: 1px;
      color: #60a5fa;
    }

    .modal-info-box strong { color: #93c5fd; }

    .modal-field { display: flex; flex-direction: column; gap: 0.5rem; }

    .modal-label {
      font-size: 0.85rem;
      font-weight: 600;
      color: rgba(255,255,255,0.8);
    }

    .modal-optional {
      font-size: 0.75rem;
      color: rgba(255,255,255,0.4);
      font-weight: 400;
    }

    .modal-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .modal-input-icon {
      position: absolute;
      left: 0.9rem;
      width: 16px;
      height: 16px;
      color: rgba(255,255,255,0.35);
      pointer-events: none;
    }

    .modal-input {
      width: 100%;
      padding: 0.85rem 3rem 0.85rem 2.6rem;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 12px;
      color: white;
      font-size: 0.95rem;
      outline: none;
      transition: border 0.25s, box-shadow 0.25s;
      font-family: inherit;
    }

    .modal-input:focus {
      border-color: rgba(34, 197, 94, 0.5);
      box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
      background: rgba(255,255,255,0.08);
    }

    .modal-input::placeholder { color: rgba(255,255,255,0.25); }

    .modal-toggle-pw {
      position: absolute;
      right: 0.75rem;
      background: none;
      border: none;
      color: rgba(255,255,255,0.4);
      cursor: pointer;
      padding: 0.25rem;
      display: flex;
      align-items: center;
      transition: color 0.2s;
    }

    .modal-toggle-pw:hover { color: rgba(255,255,255,0.8); }

    .modal-notice {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.65rem 0.9rem;
      border-radius: 8px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      color: rgba(255,255,255,0.5);
      font-size: 0.82rem;
    }

    .modal-notice.success-notice {
      background: rgba(34, 197, 94, 0.07);
      border-color: rgba(34, 197, 94, 0.2);
      color: rgba(134, 239, 172, 0.9);
    }

    .modal-actions {
      display: flex;
      gap: 0.75rem;
      padding: 1.25rem 1.75rem;
      border-top: 1px solid rgba(255,255,255,0.08);
    }

    .modal-cancel-btn {
      flex: 1;
      padding: 0.85rem;
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 12px;
      background: rgba(255,255,255,0.05);
      color: rgba(255,255,255,0.7);
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      font-family: inherit;
    }

    .modal-cancel-btn:hover:not(:disabled) {
      background: rgba(255,255,255,0.1);
      color: white;
    }

    .modal-cancel-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    .modal-confirm-btn {
      flex: 2;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.85rem;
      border: none;
      border-radius: 12px;
      background: linear-gradient(135deg, #22c55e 0%, #10b981 100%);
      color: white;
      font-size: 0.9rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3);
      font-family: inherit;
    }

    .modal-confirm-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 8px 25px rgba(34, 197, 94, 0.4);
    }

    .modal-confirm-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

    .modal-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      flex-shrink: 0;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .tenants-container {
        padding: 1rem;
      }

      .header {
        padding: 1.5rem;
      }

      .header-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .header-title {
        font-size: 1.8rem;
      }

      .search-container {
        width: 100%;
        min-width: unset;
      }

      .stats-bar {
        grid-template-columns: 1fr;
      }

      .tenants-grid {
        grid-template-columns: 1fr;
      }

      .tenant-meta {
        grid-template-columns: 1fr;
      }

      .card-actions {
        flex-direction: column;
      }

      .action-button {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class TenantsComponent implements OnInit {
  tenants: Tenant[] = [];
  isLoading = true;
  errorMessage = '';
  successMessage = '';
  searchQuery = '';
  expandedTenantId: string | null = null;

  // Detail modal state
  showDetailModal = false;
  selectedTenant: Tenant | null = null;

  // Password / Approval modal state
  showPasswordModal = false;
  provisionalPassword = '';
  showProvisionalPassword = false;
  isSubmitting = false;
  pendingApprovalId: string | null = null;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadTenants();
  }

  toggleExpand(id: string): void {
    if (this.expandedTenantId === id) {
      this.expandedTenantId = null;
    } else {
      this.expandedTenantId = id;
    }
  }

  openDetailModal(tenant: Tenant): void {
    this.selectedTenant = tenant;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedTenant = null;
  }

  get filteredTenants(): Tenant[] {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) return this.tenants;
    return this.tenants.filter((tenant) =>
      tenant.name.toLowerCase().includes(query) ||
      tenant.email.toLowerCase().includes(query) ||
      (tenant.phone ?? '').toLowerCase().includes(query)
    );
  }

  get totalTenants(): number {
    return this.tenants.length;
  }

  get approvedTenants(): number {
    return this.tenants.filter(t => t.status === 'ACTIVE' || t.status === 'APPROVED').length;
  }

  get pendingTenants(): number {
    return this.tenants.filter(t => t.status === 'PENDING').length;
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

  onSearchInput(): void {
    this.errorMessage = '';
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.errorMessage = '';
  }

  loadTenants(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.http.get<Tenant[]>(`${environment.apiUrl}/super-admin/tenants`).subscribe({
      next: (data) => {
        this.tenants = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les écoles. Veuillez réessayer.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  approveTenant(id: string): void {
    this.pendingApprovalId = id;
    this.provisionalPassword = '';
    this.showProvisionalPassword = false;
    this.showPasswordModal = true;
  }

  openPasswordModal(id: string): void {
    this.approveTenant(id);
  }

  closePasswordModal(): void {
    this.showPasswordModal = false;
    this.pendingApprovalId = null;
    this.provisionalPassword = '';
    this.isSubmitting = false;
  }

  toggleProvisionalPassword(): void {
    this.showProvisionalPassword = !this.showProvisionalPassword;
  }

  submitApproval(): void {
    if (!this.pendingApprovalId) return;

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const id = this.pendingApprovalId;
    const password = this.provisionalPassword.trim();

    const body = password ? { provisionalPassword: password } : {};

    this.http.post<any>(`${environment.apiUrl}/super-admin/tenants/${id}/approve`, body).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.closePasswordModal();
        if (response.provisionalPasswordSet) {
          this.successMessage = 'École approuvée ! Le tenant peut maintenant se connecter avec le mot de passe provisoire et devra le changer à sa première connexion.';
        } else {
          this.successMessage = 'École approuvée avec succès. Un e-mail de configuration a été envoyé.';
        }
        this.loadTenants();
      },
      error: (error: any) => {
        this.isSubmitting = false;
        this.errorMessage = "Erreur lors de l'approbation\xa0: " + (error?.error?.message || error?.message || 'Erreur inconnue');
        this.closePasswordModal();
      }
    });
  }

  rejectTenant(id: string): void {
    if (!confirm('Êtes-vous sûr de vouloir rejeter cette école ?')) {
      return;
    }

    const reason = prompt('Veuillez indiquer la raison du refus :');
    if (reason === null) return; // User cancelled

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.http.post(`${environment.apiUrl}/super-admin/tenants/${id}/reject`, { reason: reason || 'Raison non spécifiée' }).subscribe({
      next: () => {
        this.successMessage = 'École rejetée avec succès.';
        this.loadTenants();
      },
      error: (error: any) => {
        this.errorMessage = 'Erreur lors du rejet de l\'école: ' + (error?.error?.message || error?.message || 'Erreur inconnue');
        this.isLoading = false;
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }
}
