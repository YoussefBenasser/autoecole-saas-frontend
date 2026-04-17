import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';

interface Monitor {
  id: string;
  prenom?: string;
  nom?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  telephone?: string;
  tenantName?: string;
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
  selector: 'app-super-admin-monitors',
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
          </div>
          <div>
            <h1 class="page-title">Tous les Moniteurs</h1>
            <p class="page-subtitle">Vue d'ensemble de tous les moniteurs inscrits dans toutes les auto-écoles</p>
          </div>
        </div>
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
      </div>

      <!-- Search -->
      <div class="search-bar">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="search-icon">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input type="text" name="searchTerm" [(ngModel)]="searchTerm" placeholder="Rechercher un moniteur, une école..." class="search-input" />
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Chargement des moniteurs...</p>
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
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let m of filteredMonitors; let i = index" class="table-row" [style.animation-delay]="(i * 0.04) + 's'">
              <td>
                <div class="user-cell">
                  <div class="avatar avatar-cyan">
                    {{ getInitials(m) }}
                  </div>
                  <span class="user-name">{{ getFirstName(m) || '—' }}</span>
                </div>
              </td>
              <td class="user-name">{{ getLastName(m) || '—' }}</td>
              <td class="text-muted">{{ m.tenantName || '—' }}</td>
              <td class="text-muted">{{ m.email || m.user?.email || '—' }}</td>
              <td class="text-muted">{{ m.telephone || m.user?.telephone || '—' }}</td>
            </tr>
            <tr *ngIf="filteredMonitors.length === 0">
              <td colspan="5" class="empty-state">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="empty-icon">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                </svg>
                <p>Aucun moniteur trouvé.</p>
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

    .kpi-row {
      display: grid;
      grid-template-columns: repeat(1, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
      max-width: 240px;
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

    .kpi-info { display: flex; flex-direction: column; }
    .kpi-value { font-size: 1.5rem; font-weight: 800; color: #ffffff; }
    .kpi-label { font-size: 0.8rem; color: rgba(255, 255, 255, 0.55); font-weight: 500; }

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

    @keyframes spin { to { transform: rotate(360deg); } }

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

    .avatar-cyan {
      background: linear-gradient(135deg, #06b6d4, #4f46e5);
      box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
    }

    .user-name {
      font-weight: 600;
      color: #ffffff;
    }

    .text-muted {
      color: rgba(255, 255, 255, 0.55);
    }

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

    @media (max-width: 768px) {
      .page-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
    }
  `]
})
export class SuperAdminMonitorsComponent implements OnInit {
  monitors: Monitor[] = [];
  isLoading = true;
  searchTerm = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadMonitors();
  }

  get filteredMonitors(): Monitor[] {
    if (!this.searchTerm.trim()) return this.monitors;
    const term = this.searchTerm.toLowerCase();
    return this.monitors.filter(m =>
      (this.getFirstName(m) || '').toLowerCase().includes(term) ||
      (this.getLastName(m) || '').toLowerCase().includes(term) ||
      (m.tenantName || '').toLowerCase().includes(term) ||
      (m.email || m.user?.email || '').toLowerCase().includes(term)
    );
  }

  getFirstName(m: Monitor): string {
    return m.prenom || m.firstName || m.user?.prenom || m.user?.firstName || '';
  }

  getLastName(m: Monitor): string {
    return m.nom || m.lastName || m.user?.nom || m.user?.lastName || '';
  }

  getInitials(m: Monitor): string {
    const first = this.getFirstName(m);
    const last = this.getLastName(m);
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || 'M';
  }

  loadMonitors() {
    this.isLoading = true;
    this.http.get<Monitor[]>(`${environment.apiUrl}/super-admin/monitors`).subscribe({
      next: (data) => {
        this.monitors = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading monitors:', err);
        this.isLoading = false;
      }
    });
  }
}
