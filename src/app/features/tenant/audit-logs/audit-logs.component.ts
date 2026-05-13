import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface AuditLog {
  id: string;
  tenantId: string;
  userId?: string;
  action: string;
  timestamp: string;
}

@Component({
  selector: 'app-tenant-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-wrapper">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-left">
          <div class="header-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h1 class="page-title">Journal d'Activité</h1>
            <p class="page-subtitle">Historique des actions de votre auto-école</p>
          </div>
        </div>
        <div class="header-actions">
          <button class="btn-export" (click)="exportCsv()" [disabled]="isLoading">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exporter CSV
          </button>
          <button class="btn-refresh" (click)="loadLogs()" [disabled]="isLoading">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16"
              [class.spinning]="isLoading">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualiser
          </button>
        </div>
      </div>

      <!-- Stats Bar -->
      <div class="stats-bar">
        <div class="stat-pill">
          <span class="stat-dot total"></span>
          <span>{{ logs.length }} actions enregistrées</span>
        </div>
        <div class="stat-pill">
          <span class="stat-dot filtered"></span>
          <span>{{ filtered.length }} affichées</span>
        </div>
        <div class="stat-pill" *ngIf="todayCount > 0">
          <span class="stat-dot today"></span>
          <span>{{ todayCount }} aujourd'hui</span>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-bar">
        <div class="search-wrapper">
          <svg class="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="applyFilters()"
            placeholder="Rechercher par action ou identifiant utilisateur..."
            class="search-input"
          />
          <button *ngIf="searchQuery" class="clear-btn" (click)="searchQuery=''; applyFilters()">×</button>
        </div>

        <select [(ngModel)]="actionFilter" (ngModelChange)="applyFilters()" class="filter-select">
          <option value="">Toutes les actions</option>
          <option *ngFor="let a of uniqueActions" [value]="a">{{ a }}</option>
        </select>

        <select [(ngModel)]="dateFilter" (ngModelChange)="applyFilters()" class="filter-select">
          <option value="">Toute la période</option>
          <option value="today">Aujourd'hui</option>
          <option value="week">Cette semaine</option>
          <option value="month">Ce mois</option>
        </select>
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading" class="loading-state">
        <div class="spinner-ring"></div>
        <p>Chargement de l'historique...</p>
      </div>

      <!-- Error -->
      <div *ngIf="errorMessage && !isLoading" class="error-banner">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {{ errorMessage }}
      </div>

      <!-- Table -->
      <div *ngIf="!isLoading && !errorMessage" class="table-card">
        <div *ngIf="paginated.length === 0" class="empty-state">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3>Aucune activité trouvée</h3>
          <p>Essayez de modifier vos filtres ou d'actualiser la page.</p>
        </div>

        <div *ngIf="paginated.length > 0" class="table-wrapper">
          <table class="audit-table">
            <thead>
              <tr>
                <th>Horodatage</th>
                <th>Action</th>
                <th>Utilisateur</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let log of paginated; let i = index" class="table-row" [class.row-alt]="i % 2 === 1">
                <td class="cell-timestamp">
                  <div class="timestamp-main">{{ formatDate(log.timestamp) }}</div>
                  <div class="timestamp-time">{{ formatTime(log.timestamp) }}</div>
                </td>
                <td class="cell-action">
                  <span class="action-badge" [class]="getActionClass(log.action)">
                    <span class="action-dot"></span>
                    {{ log.action }}
                  </span>
                </td>
                <td class="cell-id">
                  <span *ngIf="log.userId" class="id-chip user" title="{{ log.userId }}">
                    {{ log.userId | slice:0:8 }}...
                  </span>
                  <span *ngIf="!log.userId" class="system-tag">Système</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination" *ngIf="totalPages > 1">
          <button class="page-btn" (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 1">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <ng-container *ngFor="let p of pageNumbers">
            <button class="page-btn" [class.page-active]="p === currentPage" (click)="goToPage(p)">{{ p }}</button>
          </ng-container>

          <button class="page-btn" (click)="goToPage(currentPage + 1)" [disabled]="currentPage === totalPages">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <span class="page-info">Page {{ currentPage }} / {{ totalPages }} ({{ filtered.length }} résultats)</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    :host { display: block; font-family: 'Inter', sans-serif; }

    .page-wrapper { display: flex; flex-direction: column; gap: 1.5rem; animation: fadeIn 0.3s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

    /* Header */
    .page-header {
      display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;
    }
    .header-left { display: flex; align-items: center; gap: 1rem; }
    .header-icon {
      width: 52px; height: 52px; border-radius: 16px;
      background: linear-gradient(135deg, rgba(14,165,233,0.25), rgba(99,102,241,0.2));
      border: 1px solid rgba(14,165,233,0.3);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .header-icon svg { width: 26px; height: 26px; color: #38bdf8; }
    .page-title { font-size: 1.6rem; font-weight: 800; color: white; margin: 0 0 0.2rem; }
    .page-subtitle { font-size: 0.85rem; color: rgba(255,255,255,0.5); margin: 0; }

    .header-actions { display: flex; gap: 0.75rem; }

    .btn-refresh, .btn-export {
      display: flex; align-items: center; gap: 0.5rem;
      padding: 0.65rem 1.2rem; border-radius: 12px; font-size: 0.875rem; font-weight: 600;
      cursor: pointer; transition: all 0.2s; font-family: inherit; border: none;
    }
    .btn-refresh {
      background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.85);
    }
    .btn-refresh:hover:not(:disabled) { background: rgba(255,255,255,0.13); color: white; }
    .btn-export {
      background: linear-gradient(135deg, #10b981, #059669); color: white;
      box-shadow: 0 4px 12px rgba(16,185,129,0.25);
    }
    .btn-export:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(16,185,129,0.35); }
    .btn-refresh:disabled, .btn-export:disabled { opacity: 0.5; cursor: not-allowed; }
    .spinning { animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Stats Bar */
    .stats-bar {
      display: flex; gap: 0.75rem; flex-wrap: wrap;
    }
    .stat-pill {
      display: flex; align-items: center; gap: 0.5rem;
      padding: 0.4rem 0.9rem; border-radius: 20px;
      background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
      font-size: 0.82rem; color: rgba(255,255,255,0.7); font-weight: 500;
    }
    .stat-dot { width: 8px; height: 8px; border-radius: 50%; }
    .stat-dot.total { background: #60a5fa; }
    .stat-dot.filtered { background: #a78bfa; }
    .stat-dot.today { background: #34d399; }

    /* Filters */
    .filters-bar {
      display: flex; gap: 0.75rem; flex-wrap: wrap;
    }
    .search-wrapper {
      position: relative; flex: 1; min-width: 260px;
      display: flex; align-items: center;
    }
    .search-icon {
      position: absolute; left: 0.9rem; width: 16px; height: 16px;
      color: rgba(255,255,255,0.35); pointer-events: none;
    }
    .search-input {
      width: 100%; padding: 0.75rem 2.5rem 0.75rem 2.6rem;
      background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
      border-radius: 12px; color: white; font-size: 0.9rem; outline: none;
      transition: border 0.2s, box-shadow 0.2s; font-family: inherit;
    }
    .search-input:focus {
      border-color: rgba(56,189,248,0.5); box-shadow: 0 0 0 3px rgba(56,189,248,0.1);
    }
    .search-input::placeholder { color: rgba(255,255,255,0.3); }
    .clear-btn {
      position: absolute; right: 0.75rem; background: none; border: none;
      color: rgba(255,255,255,0.5); cursor: pointer; font-size: 1.2rem; line-height: 1;
    }
    .clear-btn:hover { color: white; }

    .filter-select {
      padding: 0.75rem 1rem; background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.12); border-radius: 12px;
      color: rgba(255,255,255,0.85); font-size: 0.875rem; outline: none;
      cursor: pointer; font-family: inherit; min-width: 180px;
    }
    .filter-select option { background: #1e293b; }
    .filter-select:focus { border-color: rgba(56,189,248,0.5); }

    /* Loading */
    .loading-state {
      display: flex; flex-direction: column; align-items: center; gap: 1rem;
      padding: 4rem; color: rgba(255,255,255,0.6);
    }
    .spinner-ring {
      width: 40px; height: 40px;
      border: 3px solid rgba(255,255,255,0.1);
      border-top-color: #38bdf8;
      border-radius: 50%; animation: spin 0.8s linear infinite;
    }

    /* Error */
    .error-banner {
      display: flex; align-items: center; gap: 0.6rem;
      padding: 1rem 1.25rem; border-radius: 12px;
      background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25);
      color: #fca5a5; font-size: 0.9rem;
    }

    /* Table Card */
    .table-card {
      background: rgba(15,23,42,0.7); backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.1); border-radius: 20px;
      overflow: hidden;
    }

    .empty-state {
      display: flex; flex-direction: column; align-items: center; gap: 0.75rem;
      padding: 4rem 2rem; text-align: center; color: rgba(255,255,255,0.5);
    }
    .empty-state svg { width: 48px; height: 48px; opacity: 0.4; }
    .empty-state h3 { margin: 0; color: rgba(255,255,255,0.7); font-size: 1.1rem; }
    .empty-state p { margin: 0; font-size: 0.875rem; }

    .table-wrapper { overflow-x: auto; }

    .audit-table {
      width: 100%; border-collapse: collapse; min-width: 600px;
    }

    .audit-table thead tr {
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .audit-table th {
      padding: 1rem 1.25rem; text-align: left;
      font-size: 0.75rem; font-weight: 700;
      color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.06em;
    }

    .table-row {
      border-bottom: 1px solid rgba(255,255,255,0.04);
      transition: background 0.15s;
    }
    .table-row:hover { background: rgba(255,255,255,0.04); }
    .table-row.row-alt { background: rgba(255,255,255,0.02); }
    .table-row.row-alt:hover { background: rgba(255,255,255,0.05); }

    .audit-table td { padding: 0.9rem 1.25rem; vertical-align: middle; }

    .cell-timestamp {}
    .timestamp-main { font-size: 0.875rem; font-weight: 600; color: rgba(255,255,255,0.85); }
    .timestamp-time { font-size: 0.75rem; color: rgba(255,255,255,0.4); margin-top: 0.15rem; }

    .action-badge {
      display: inline-flex; align-items: center; gap: 0.4rem;
      padding: 0.3rem 0.75rem; border-radius: 20px;
      font-size: 0.8rem; font-weight: 600; white-space: nowrap;
    }
    .action-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

    .action-badge.badge-approve {
      background: rgba(34,197,94,0.12); border: 1px solid rgba(34,197,94,0.25); color: #86efac;
    }
    .action-badge.badge-approve .action-dot { background: #22c55e; }

    .action-badge.badge-reject {
      background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.25); color: #fca5a5;
    }
    .action-badge.badge-reject .action-dot { background: #ef4444; }

    .action-badge.badge-login {
      background: rgba(59,130,246,0.12); border: 1px solid rgba(59,130,246,0.25); color: #93c5fd;
    }
    .action-badge.badge-login .action-dot { background: #3b82f6; }

    .action-badge.badge-create {
      background: rgba(168,85,247,0.12); border: 1px solid rgba(168,85,247,0.25); color: #d8b4fe;
    }
    .action-badge.badge-create .action-dot { background: #a855f7; }

    .action-badge.badge-default {
      background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12); color: rgba(255,255,255,0.7);
    }
    .action-badge.badge-default .action-dot { background: rgba(255,255,255,0.4); }

    .id-chip {
      display: inline-block; padding: 0.2rem 0.6rem; border-radius: 6px;
      font-size: 0.75rem; font-family: 'Courier New', monospace; font-weight: 600;
      background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1);
      color: rgba(255,255,255,0.6); cursor: default;
    }
    .id-chip.user { color: #93c5fd; border-color: rgba(147,197,253,0.2); background: rgba(59,130,246,0.08); }
    .system-tag {
      font-size: 0.75rem; color: rgba(255,255,255,0.35); font-style: italic;
    }

    /* Pagination */
    .pagination {
      display: flex; align-items: center; gap: 0.5rem; padding: 1rem 1.25rem;
      border-top: 1px solid rgba(255,255,255,0.06); flex-wrap: wrap;
    }
    .page-btn {
      min-width: 36px; height: 36px; padding: 0 0.5rem; display: flex; align-items: center; justify-content: center;
      border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05);
      color: rgba(255,255,255,0.7); font-size: 0.875rem; font-weight: 600; cursor: pointer;
      transition: all 0.15s; font-family: inherit;
    }
    .page-btn:hover:not(:disabled):not(.page-active) { background: rgba(255,255,255,0.1); color: white; }
    .page-btn:disabled { opacity: 0.35; cursor: not-allowed; }
    .page-btn.page-active {
      background: linear-gradient(135deg, #0ea5e9, #3b82f6); color: white; border-color: transparent;
      box-shadow: 0 4px 12px rgba(14,165,233,0.3);
    }
    .page-info { margin-left: auto; font-size: 0.8rem; color: rgba(255,255,255,0.4); }
  `]
})
export class TenantAuditLogsComponent implements OnInit {
  logs: AuditLog[] = [];
  filtered: AuditLog[] = [];
  paginated: AuditLog[] = [];
  uniqueActions: string[] = [];

  isLoading = false;
  errorMessage = '';
  searchQuery = '';
  actionFilter = '';
  dateFilter = '';
  todayCount = 0;

  currentPage = 1;
  pageSize = 20;
  totalPages = 1;
  pageNumbers: number[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.http.get<AuditLog[]>(`${environment.apiUrl}/audit`).subscribe({
      next: (data) => {
        this.logs = data;
        this.uniqueActions = [...new Set(data.map(l => l.action))].sort();
        const today = new Date().toDateString();
        this.todayCount = data.filter(l => new Date(l.timestamp).toDateString() === today).length;
        this.isLoading = false;
        this.applyFilters();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Erreur lors du chargement de l\'historique : ' + (err?.error?.message || err?.message || 'Erreur inconnue');
      }
    });
  }

  applyFilters(): void {
    const q = this.searchQuery.toLowerCase();
    const today = new Date();

    this.filtered = this.logs.filter(log => {
      // Text search
      const matchesSearch = !q ||
        log.action.toLowerCase().includes(q) ||
        log.userId?.toLowerCase().includes(q);

      // Action filter
      const matchesAction = !this.actionFilter || log.action === this.actionFilter;

      // Date filter
      let matchesDate = true;
      if (this.dateFilter) {
        const logDate = new Date(log.timestamp);
        if (this.dateFilter === 'today') {
          matchesDate = logDate.toDateString() === today.toDateString();
        } else if (this.dateFilter === 'week') {
          const weekAgo = new Date(today); weekAgo.setDate(today.getDate() - 7);
          matchesDate = logDate >= weekAgo;
        } else if (this.dateFilter === 'month') {
          const monthAgo = new Date(today); monthAgo.setMonth(today.getMonth() - 1);
          matchesDate = logDate >= monthAgo;
        }
      }

      return matchesSearch && matchesAction && matchesDate;
    });

    this.currentPage = 1;
    this.totalPages = Math.max(1, Math.ceil(this.filtered.length / this.pageSize));
    this.pageNumbers = Array.from({ length: Math.min(this.totalPages, 7) }, (_, i) => i + 1);
    this.updatePage();
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p;
    this.updatePage();
    // Build page numbers around current page
    const range = 3;
    const start = Math.max(1, this.currentPage - range);
    const end = Math.min(this.totalPages, this.currentPage + range);
    this.pageNumbers = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  private updatePage(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.paginated = this.filtered.slice(start, start + this.pageSize);
  }

  getActionClass(action: string): string {
    const a = action.toLowerCase();
    if (a.includes('approv') || a.includes('activ') || a.includes('success')) return 'badge-approve';
    if (a.includes('reject') || a.includes('refus') || a.includes('delete') || a.includes('error')) return 'badge-reject';
    if (a.includes('login') || a.includes('connexion')) return 'badge-login';
    if (a.includes('creat') || a.includes('register') || a.includes('inscript')) return 'badge-create';
    return 'badge-default';
  }

  formatDate(ts: string): string {
    return new Date(ts).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  formatTime(ts: string): string {
    return new Date(ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  exportCsv(): void {
    const headers = ['Horodatage', 'Action', 'Utilisateur ID'];
    const rows = this.filtered.map(l => [
      `${this.formatDate(l.timestamp)} ${this.formatTime(l.timestamp)}`,
      l.action,
      l.userId || 'Système'
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `historique_activites_${new Date().toISOString().split('T')[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  }
}
