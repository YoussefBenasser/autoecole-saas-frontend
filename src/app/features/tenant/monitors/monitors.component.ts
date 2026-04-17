import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { environment } from '../../../../environments/environment';

interface Monitor {
  id: string;
  // Backend exposes these at root level via @Transient @JsonProperty
  prenom?: string;
  nom?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  telephone?: string;
  // Nested user object also may be present
  user?: {
    prenom?: string;
    nom?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    telephone?: string;
  };
}

@Component({
  selector: 'app-monitors',
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </div>
          <div>
            <h1 class="page-title">Moniteurs</h1>
            <p class="page-subtitle">Gérez les moniteurs de l'auto-école et ajoutez-en de nouveaux</p>
          </div>
        </div>
        <button (click)="openModal()" class="btn-primary">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="btn-icon">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Ajouter un moniteur
        </button>
      </div>

      <!-- KPI Cards -->
      <div class="kpi-row">
        <div class="kpi-card">
          <div class="kpi-icon" style="background: rgba(6,182,212,0.15);">👨‍🏫</div>
          <div class="kpi-info">
            <span class="kpi-value">{{ monitors.length }}</span>
            <span class="kpi-label">Total moniteurs</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background: rgba(34,197,94,0.15);">✅</div>
          <div class="kpi-info">
            <span class="kpi-value">{{ monitors.length }}</span>
            <span class="kpi-label">Actifs</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background: rgba(245,158,11,0.15);">🚗</div>
          <div class="kpi-info">
            <span class="kpi-value">{{ monitors.length > 0 ? 'Oui' : 'Non' }}</span>
            <span class="kpi-label">Disponibles</span>
          </div>
        </div>
      </div>

      <!-- Search -->
      <div class="search-bar">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="search-icon">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input type="text" name="searchTerm" [(ngModel)]="searchTerm" placeholder="Rechercher un moniteur..." class="search-input" />
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Chargement des moniteurs...</p>
      </div>

      <!-- Monitor Cards Grid -->
      <div *ngIf="!isLoading && filteredMonitors.length > 0" class="monitors-grid">
        <div *ngFor="let m of filteredMonitors; let i = index" class="monitor-card" [style.animation-delay]="(i * 0.06) + 's'">
          <div class="card-top">
            <div class="avatar avatar-cyan">
              {{ (m.prenom || m.firstName || m.user?.prenom || m.user?.firstName)?.charAt(0) || 'M' }}{{ (m.nom || m.lastName || m.user?.nom || m.user?.lastName)?.charAt(0) || '' }}
            </div>
            <div class="status-dot active" title="Actif"></div>
          </div>
          <h3 class="monitor-name">{{ m.prenom || m.firstName || m.user?.prenom || m.user?.firstName || 'Nouveau' }} {{ m.nom || m.lastName || m.user?.nom || m.user?.lastName || 'Moniteur' }}</h3>
          <div class="monitor-details">
            <div class="detail-row">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              <span>{{ m.email || m.user?.email || '—' }}</span>
            </div>
            <div class="detail-row">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
              <span *ngIf="m.telephone || m.user?.telephone">{{ m.telephone || m.user?.telephone }}</span>
              <span *ngIf="!m.telephone && !m.user?.telephone">—</span>
            </div>
          </div>
          <div class="card-badge">
            <span class="specialty-badge">🚗 Conduite</span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading && filteredMonitors.length === 0" class="empty-container">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="empty-icon">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
        </svg>
        <p>Aucun moniteur trouvé.</p>
      </div>

      <!-- Modal -->
      <div *ngIf="isModalOpen" class="modal-overlay" (click)="closeModal()">
        <div class="modal-container" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-header-left">
              <div class="modal-icon">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                </svg>
              </div>
              <h3>Ajouter un moniteur</h3>
            </div>
            <button (click)="closeModal()" class="modal-close">&times;</button>
          </div>
          <form (ngSubmit)="onSubmit()" #monitorForm="ngForm" class="modal-body">
            <div class="form-group">
              <label>Prénom</label>
              <input type="text" name="prenom" [(ngModel)]="newMonitor.prenom" required
                     placeholder="Prénom du moniteur" class="form-input" />
            </div>
            <div class="form-group">
              <label>Nom</label>
              <input type="text" name="nom" [(ngModel)]="newMonitor.nom" required
                     placeholder="Nom de famille" class="form-input" />
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" name="email" [(ngModel)]="newMonitor.email" required email
                     placeholder="moniteur@exemple.com" class="form-input" />
            </div>
            <div class="form-group">
              <label>Mot de passe provisoire</label>
              <input type="password" name="password" [(ngModel)]="newMonitor.password" required minlength="6"
                     placeholder="••••••" class="form-input" />
            </div>
            <div class="form-group">
              <label>Téléphone</label>
              <input type="tel" name="telephone" [(ngModel)]="newMonitor.telephone"
                     placeholder="06 12 34 56 78" class="form-input" />
            </div>
            <div class="modal-actions">
              <button type="button" (click)="closeModal()" class="btn-ghost">Annuler</button>
              <button type="submit" [disabled]="!monitorForm.form.valid || isSubmitting" class="btn-primary">
                <span *ngIf="!isSubmitting">Créer le moniteur</span>
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

    @keyframes cardIn {
      from { opacity: 0; transform: translateY(16px) scale(0.97); }
      to { opacity: 1; transform: translateY(0) scale(1); }
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
      background: linear-gradient(135deg, #06b6d4, #4f46e5);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 20px rgba(6, 182, 212, 0.3);
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
      background: linear-gradient(135deg, #ffffff 0%, #a5f3fc 100%);
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
      grid-template-columns: repeat(3, 1fr);
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
      border-color: rgba(6, 182, 212, 0.5);
      box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.15);
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
      border-top-color: #06b6d4;
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

    /* Monitors Grid (Card View) */
    .monitors-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.25rem;
    }

    .monitor-card {
      background: rgba(255, 255, 255, 0.04);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 1.5rem;
      transition: all 0.3s ease;
      animation: cardIn 0.5s ease-out both;
      position: relative;
    }

    .monitor-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3), 0 0 30px rgba(6, 182, 212, 0.08);
      border-color: rgba(6, 182, 212, 0.25);
    }

    .card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
    }

    .avatar {
      width: 52px;
      height: 52px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      font-weight: 700;
      color: white;
      text-transform: uppercase;
    }

    .avatar-cyan {
      background: linear-gradient(135deg, #06b6d4, #4f46e5);
      box-shadow: 0 6px 16px rgba(6, 182, 212, 0.3);
    }

    .status-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }

    .status-dot.active {
      background: #22c55e;
      box-shadow: 0 0 8px rgba(34, 197, 94, 0.5);
    }

    .monitor-name {
      font-size: 1.1rem;
      font-weight: 700;
      color: white;
      margin: 0 0 0.75rem 0;
    }

    .monitor-details {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .detail-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: rgba(255, 255, 255, 0.55);
      font-size: 0.85rem;
    }

    .detail-row svg {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
      color: rgba(255, 255, 255, 0.35);
    }

    .card-badge {
      padding-top: 0.75rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

    .specialty-badge {
      display: inline-block;
      padding: 0.3rem 0.75rem;
      border-radius: 20px;
      font-size: 0.78rem;
      font-weight: 600;
      background: rgba(6, 182, 212, 0.15);
      color: #22d3ee;
      border: 1px solid rgba(6, 182, 212, 0.2);
    }

    /* Empty */
    .empty-container {
      text-align: center;
      padding: 4rem 2rem;
      color: rgba(255, 255, 255, 0.4);
    }

    .empty-icon {
      width: 56px;
      height: 56px;
      margin: 0 auto 1rem;
      color: rgba(255, 255, 255, 0.2);
    }

    /* Buttons */
    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #06b6d4, #4f46e5);
      border: none;
      border-radius: 14px;
      color: white;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 6px 20px rgba(6, 182, 212, 0.3);
      font-family: inherit;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px) scale(1.03);
      box-shadow: 0 10px 30px rgba(6, 182, 212, 0.4);
    }

    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

    .btn-icon { width: 18px; height: 18px; }

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

    /* Modal */
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
      background: linear-gradient(135deg, #06b6d4, #4f46e5);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .modal-icon svg { width: 20px; height: 20px; color: white; }

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

    .modal-body { padding: 1.75rem; }

    .form-group { margin-bottom: 1.25rem; }

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
      border-color: rgba(6, 182, 212, 0.5);
      box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.12);
    }

    .modal-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
      margin-top: 1.75rem;
      padding-top: 1.25rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

    @media (max-width: 768px) {
      .page-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
      .kpi-row { grid-template-columns: 1fr; }
      .monitors-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class MonitorsComponent implements OnInit {
  monitors: Monitor[] = [];
  isLoading = true;
  searchTerm = '';

  isModalOpen = false;
  isSubmitting = false;
  newMonitor = { prenom: '', nom: '', email: '', password: '', telephone: '' };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadMonitors();
  }

  get filteredMonitors(): Monitor[] {
    if (!this.searchTerm.trim()) return this.monitors;
    const term = this.searchTerm.toLowerCase();
    return this.monitors.filter(m =>
      (m.prenom || m.firstName || m.user?.prenom || m.user?.firstName || '').toLowerCase().includes(term) ||
      (m.nom || m.lastName || m.user?.nom || m.user?.lastName || '').toLowerCase().includes(term) ||
      (m.email || m.user?.email || '').toLowerCase().includes(term) ||
      (m.telephone || m.user?.telephone || '').toLowerCase().includes(term)
    );
  }

  private normalizeMonitor(raw: any): Monitor {
    return {
      ...raw,
      prenom: raw.prenom || raw.firstName || raw.user?.prenom || raw.user?.firstName || '',
      nom: raw.nom || raw.lastName || raw.user?.nom || raw.user?.lastName || '',
      email: raw.email || raw.user?.email || '',
      telephone: raw.telephone || raw.user?.telephone || ''
    };
  }

  loadMonitors() {
    this.isLoading = true;
    this.http.get<any>(`${environment.apiUrl}/admin/monitors`).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (data) => {
        const monitorsArray = Array.isArray(data)
          ? data
          : data?.data || data?.items || data?.monitors || [];
        this.monitors = (monitorsArray || []).map((m: any) => this.normalizeMonitor(m));
      },
      error: (err) => {
        console.error('Failed to load monitors', err);
        this.monitors = [];
      }
    });
  }

  openModal() {
    this.newMonitor = { prenom: '', nom: '', email: '', password: '', telephone: '' };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  onSubmit() {
    if (!this.newMonitor.prenom || !this.newMonitor.nom || !this.newMonitor.email || !this.newMonitor.password) return;
    this.isSubmitting = true;
    const payload = {
      prenom: this.newMonitor.prenom.trim(),
      nom: this.newMonitor.nom.trim(),
      email: this.newMonitor.email.trim(),
      password: this.newMonitor.password,
      telephone: this.newMonitor.telephone?.trim() || null
    };
    this.http.post(`${environment.apiUrl}/admin/monitors`, payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.closeModal();
        this.loadMonitors();
      },
      error: (err) => {
        console.error('Error creating monitor', err);
        this.isSubmitting = false;
      }
    });
  }
}
