import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TenantService, TenantStatsApi } from '../tenant.service';
import { environment } from '../../../../environments/environment';

interface RecentStudent {
  id: string;
  name?: string;
  prenom?: string;
  nom?: string;
  firstName?: string;
  lastName?: string;
  user?: {
    name?: string;
    firstName?: string;
    lastName?: string;
    prenom?: string;
    nom?: string;
    email?: string;
  };
  email?: string;
}

interface RecentPayment {
  id: number;
  amount: number;
  date?: string;
  paymentDate?: string;
  studentName?: string;
  status?: string;
}

interface JoinRequest {
  requestId: string;
  studentId: string;
  fullName: string;
  email: string;
  status: string;
  createdAt: string;
}

interface AuditLog {
  id: string;
  tenantId: string;
  userId?: string;
  action: string;
  timestamp: string;
}

@Component({
  selector: 'app-tenant-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
  <div class="dashboard-container">
    <div class="header">
      <div class="header-content">
        <div>
          <h1 class="header-title">Tableau de bord</h1>
          <p class="header-subtitle">Vue d'ensemble de votre auto-école</p>
        </div>
        <div class="header-actions">
          <div class="date-display">
            <svg class="calendar-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span class="current-date">{{ today }}</span>
          </div>
          <button class="refresh-button" (click)="loadDashboard()" [disabled]="isLoading || statsLoading || studentsLoading">
            <svg *ngIf="!isLoading && !statsLoading" class="refresh-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <svg *ngIf="isLoading || statsLoading" class="spinner loading-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" stroke-width="4"></circle>
            </svg>
            <span class="refresh-text">{{ isLoading || statsLoading ? 'Actualisation...' : 'Actualiser' }}</span>
          </button>
        </div>
      </div>
    </div>

    <div *ngIf="errorMessage" style="color: #fca5a5; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); padding: 1rem; border-radius: 12px; margin-bottom: 2rem;">
      {{ errorMessage }}
    </div>

    <div class="stats-overview">
      <div *ngFor="let stat of kpiStats" class="stat-card">
        <div class="stat-header">
          <div class="stat-icon" [style.background]="stat.iconBg">{{ stat.icon }}</div>
          <h3 class="stat-title">{{ stat.label }}</h3>
        </div>
        <p class="stat-value">{{ stat.value }}</p>
      </div>
    </div>

    <div class="content-grid">
      <div class="quick-actions">
        <div class="section-header" style="padding:0 0 2rem 0; background:transparent; border-bottom:none;">
          <h2 class="section-title">Statistiques d'examens</h2>
          <p class="section-subtitle">Aperçu global de votre taux de réussite.</p>
        </div>

        <div style="margin-bottom: 2rem;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <span style="color: rgba(255,255,255,0.7); font-size:0.9rem;">Taux de réussite global</span>
            <span style="font-weight:700; color:#22c55e;">{{ passRate }}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" [style.width]="passRate + '%'"></div>
          </div>
        </div>

        <div style="margin-bottom: 2rem;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <span style="color: rgba(255,255,255,0.7); font-size:0.9rem;">Score moyen / mois</span>
            <span style="font-weight:700; color:#38bdf8;">{{ (avgScore > 100 ? 100 : avgScore) | number:'1.1-1' }}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill accent" [style.width]="(avgScore > 100 ? 100 : avgScore) + '%'"></div>
          </div>
        </div>

        <div *ngIf="hardestCategories.length > 0">
          <p style="color: rgba(255,255,255,0.7); font-size: 0.9rem; font-weight:600; margin-bottom: 1rem;">Catégories les plus difficiles</p>
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            <div *ngFor="let cat of hardestCategories.slice(0,3)" style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.05); padding: 0.75rem 1rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
              <span style="color: white; font-size:0.9rem; font-weight:600;">{{ cat.key }}</span>
              <span style="background: rgba(239,68,68,0.2); color:#fca5a5; padding:0.2rem 0.6rem; border-radius:20px; font-size:0.8rem; font-weight:600;">{{ cat.count }} échecs</span>
            </div>
          </div>
        </div>
      </div>

      <div class="recent-tenants">
        <div class="section-header">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h2 class="section-title">Derniers élèves</h2>
            <a routerLink="/tenant/students" style="color:#38bdf8; text-decoration:none; font-size:0.95rem; font-weight:600;">Voir tout →</a>
          </div>
        </div>
        
        <div class="tenants-grid" *ngIf="!studentsLoading">
          <div *ngFor="let s of recentStudents" class="tenant-card" style="display:flex; justify-content:space-between; align-items:center; padding: 1.25rem;">
            <div style="display:flex; align-items:center;">
              <div class="tenant-avatar" style="background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%); color:white;">
                {{ getStudentInitials(s) }}
              </div>
              <div class="tenant-info">
                <h3 class="tenant-name">{{ getStudentDisplayName(s) }}</h3>
                <p class="tenant-email">{{ s.user?.email || s.email || '—' }}</p>
              </div>
            </div>
          </div>
          <div *ngIf="recentStudents.length === 0" class="empty">
            Aucun élève inscrit récemment.
          </div>
        </div>
      </div>
    </div>

    <div class="recent-tenants" style="margin-top: 2rem;">
      <div class="section-header">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2 class="section-title">Derniers paiements</h2>
          <a routerLink="/tenant/payments" style="color:#0ea5e9; text-decoration:none; font-size:0.95rem; font-weight:600;">Voir tout →</a>
        </div>
      </div>
      <div style="padding: 0;">
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead>
            <tr>
              <th style="padding: 1rem 2rem; font-weight: 600; color: rgba(255, 255, 255, 0.9); background: rgba(255, 255, 255, 0.05); font-size: 0.9rem; text-transform: uppercase;">Élève</th>
              <th style="padding: 1rem 2rem; font-weight: 600; color: rgba(255, 255, 255, 0.9); background: rgba(255, 255, 255, 0.05); font-size: 0.9rem; text-transform: uppercase;">Montant</th>
              <th style="padding: 1rem 2rem; font-weight: 600; color: rgba(255, 255, 255, 0.9); background: rgba(255, 255, 255, 0.05); font-size: 0.9rem; text-transform: uppercase;">Date</th>
              <th style="padding: 1rem 2rem; font-weight: 600; color: rgba(255, 255, 255, 0.9); background: rgba(255, 255, 255, 0.05); font-size: 0.9rem; text-transform: uppercase;">Statut</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of recentPayments" style="border-top: 1px solid rgba(255, 255, 255, 0.08); transition: all 0.2s ease;">
              <td style="padding: 1rem 2rem; color: rgba(255, 255, 255, 0.9); font-size: 0.9rem;">{{ p.studentName || '—' }}</td>
              <td style="padding: 1rem 2rem; color: #22c55e; font-weight: 600; font-size: 0.9rem;">{{ p.amount | number }} DNT</td>
              <td style="padding: 1rem 2rem; color: rgba(255, 255, 255, 0.7); font-size: 0.9rem;">{{ (p.paymentDate || p.date) | date:'dd/MM/yyyy' }}</td>
              <td style="padding: 1rem 2rem;">
                <span class="status-badge" [ngClass]="p.status === 'PAID' ? 'approved' : 'pending'">
                  {{ p.status === 'PAID' ? 'Payé' : 'En attente' }}
                </span>
              </td>
            </tr>
            <tr *ngIf="recentPayments.length === 0">
              <td colspan="4" class="empty">Aucun paiement enregistré.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="recent-logs" style="margin-top: 2rem;">
      <div class="section-header">
        <h2 class="section-title">📜 Journal d'Activité</h2>
      </div>

      <div *ngIf="recentLogs.length === 0" class="empty" style="padding: 2rem;">
        Aucune activité récente.
      </div>

      <div *ngIf="recentLogs.length > 0" class="logs-list" style="display: flex; flex-direction: column; gap: 1rem;">
        <div *ngFor="let log of recentLogs" style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 1rem; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; gap: 1rem; align-items: center;">
            <div style="background: rgba(14, 165, 233, 0.2); color: #38bdf8; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width: 20px; height: 20px;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 style="margin: 0; color: #f8fafc; font-size: 1rem;">{{ log.action }}</h4>
              <p style="margin: 0; color: #94a3b8; font-size: 0.875rem;">ID Utilisateur : {{ log.userId || 'Système' }}</p>
            </div>
          </div>
          <div style="color: #64748b; font-size: 0.875rem;">
            {{ log.timestamp | date:'dd/MM/yyyy HH:mm' }}
          </div>
        </div>
      </div>
    </div>

    <div class="recent-tenants" style="margin-top: 2rem; border: 2px solid rgba(251,191,36,0.25);">
      <div class="section-header" style="background: linear-gradient(135deg, rgba(251,191,36,0.08), transparent);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="display:flex; align-items:center; gap:0.75rem;">
            <span style="font-size:1.5rem;">📋</span>
            <div>
              <h2 class="section-title">Demandes d'inscription</h2>
              <p style="color:rgba(255,255,255,0.5); font-size:0.85rem; margin:0;">Élèves souhaitant rejoindre votre école</p>
            </div>
          </div>
          <span *ngIf="joinRequests.length > 0" style="background:rgba(251,191,36,0.2); color:#fbbf24; padding:0.35rem 0.85rem; border-radius:999px; font-size:0.8rem; font-weight:700;">{{ joinRequests.length }} en attente</span>
        </div>
      </div>
      <div *ngIf="requestsLoading" style="padding:2rem; text-align:center; color:rgba(255,255,255,0.5);">Chargement...</div>
      <div *ngIf="!requestsLoading && joinRequests.length === 0" class="empty" style="padding:2rem;">Aucune demande en attente.</div>
      <div *ngIf="!requestsLoading && joinRequests.length > 0" style="padding:0;">
        <table style="width:100%; border-collapse:collapse; text-align:left;">
          <thead>
            <tr>
              <th style="padding:1rem 1.5rem; font-weight:600; color:rgba(255,255,255,0.7); background:rgba(255,255,255,0.04); font-size:0.8rem; text-transform:uppercase;">Élève</th>
              <th style="padding:1rem 1.5rem; font-weight:600; color:rgba(255,255,255,0.7); background:rgba(255,255,255,0.04); font-size:0.8rem; text-transform:uppercase;">Email</th>
              <th style="padding:1rem 1.5rem; font-weight:600; color:rgba(255,255,255,0.7); background:rgba(255,255,255,0.04); font-size:0.8rem; text-transform:uppercase;">Date</th>
              <th style="padding:1rem 1.5rem; font-weight:600; color:rgba(255,255,255,0.7); background:rgba(255,255,255,0.04); font-size:0.8rem; text-transform:uppercase; text-align:right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let req of joinRequests" style="border-top:1px solid rgba(255,255,255,0.07); transition:background 0.2s;">
              <td style="padding:1rem 1.5rem; color:#fff; font-weight:600; font-size:0.9rem;">{{ req.fullName }}</td>
              <td style="padding:1rem 1.5rem; color:rgba(255,255,255,0.6); font-size:0.9rem;">{{ req.email }}</td>
              <td style="padding:1rem 1.5rem; color:rgba(255,255,255,0.5); font-size:0.85rem;">{{ req.createdAt | date:'dd/MM/yyyy' }}</td>
              <td style="padding:1rem 1.5rem; text-align:right;">
                <div style="display:flex; gap:0.5rem; justify-content:flex-end;">
                  <button
                    (click)="approveRequest(req.requestId)"
                    [disabled]="processingId === req.requestId"
                    style="padding:0.5rem 1rem; border:none; border-radius:0.6rem; background:linear-gradient(135deg,#22c55e,#16a34a); color:#fff; font-weight:600; font-size:0.8rem; cursor:pointer; transition:all 0.2s;"
                    [style.opacity]="processingId === req.requestId ? '0.5' : '1'">
                    ✓ Accepter
                  </button>
                  <button
                    (click)="rejectRequest(req.requestId)"
                    [disabled]="processingId === req.requestId"
                    style="padding:0.5rem 1rem; border:none; border-radius:0.6rem; background:linear-gradient(135deg,rgba(239,68,68,0.3),rgba(239,68,68,0.2)); color:#f87171; font-weight:600; font-size:0.8rem; cursor:pointer; transition:all 0.2s; border:1px solid rgba(239,68,68,0.3);"
                    [style.opacity]="processingId === req.requestId ? '0.5' : '1'">
                    ✕ Refuser
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  `,
  styleUrls: ['./dashboard.component.css']
})
export class TenantDashboardComponent implements OnInit {
  today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  kpiStats = [
    { label: 'Élèves', value: '—', icon: '🎓', iconBg: 'rgba(79,70,229,0.15)',  glowColor: 'rgba(79,70,229,0.08)' },
    { label: 'Moniteurs', value: '—', icon: '👨‍🏫', iconBg: 'rgba(6,182,212,0.15)', glowColor: 'rgba(6,182,212,0.08)' },
    { label: 'Examens', value: '—', icon: '📋', iconBg: 'rgba(245,158,11,0.15)', glowColor: 'rgba(245,158,11,0.08)' },
    { label: 'Paiements', value: '—', icon: '💳', iconBg: 'rgba(34,197,94,0.15)',  glowColor: 'rgba(34,197,94,0.08)' },
  ];

  passRate    = 0;
  avgScore    = 0;
  hardestCategories: { key: string; count: number }[] = [];

  recentStudents: RecentStudent[] = [];
  recentPayments: RecentPayment[] = [];
  joinRequests: JoinRequest[] = [];
  recentLogs: AuditLog[] = [];
  requestsLoading = true;
  processingId: string | null = null;

  studentsLoading = true;
  statsLoading    = true;
  isLoading      = true;
  errorMessage = '';

  constructor(private tenantService: TenantService, private cdr: ChangeDetectorRef, private http: HttpClient) {}

  ngOnInit(): void {
    this.loadDashboard();
    this.loadJoinRequests();
  }

  loadDashboard(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.tenantService.getTenantStats().subscribe({
      next: (data: TenantStatsApi) => {
        this.passRate = Math.round(data.globalPassRate);
        this.avgScore = data.averageScorePerMonth;
        this.hardestCategories = Object.entries(data.hardestCategories)
          .map(([key, value]) => ({ key, count: Number(value) }))
          .sort((a, b) => b.count - a.count);

        this.statsLoading = false;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Impossible de charger les données du tableau de bord.';
        this.statsLoading = false;
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });

    this.tenantService.getStudents().subscribe({
      next: students => {
        this.kpiStats[0].value = String(students.length);
        this.recentStudents = students.slice(0, 5);
        this.studentsLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.studentsLoading = false;
        this.cdr.detectChanges();
      }
    });

    this.tenantService.getMonitors().subscribe({
      next: monitors => {
        this.kpiStats[1].value = String(monitors.length);
        this.cdr.detectChanges();
      },
      error: () => {
        this.kpiStats[1].value = '—';
        this.cdr.detectChanges();
      }
    });

    this.tenantService.getUpcomingExams().subscribe({
      next: exams => {
        this.kpiStats[2].value = String(exams.length);
        this.cdr.detectChanges();
      },
      error: () => {
        this.kpiStats[2].value = '—';
        this.cdr.detectChanges();
      }
    });

    this.tenantService.getPaymentStats().subscribe({
      next: paymentStats => {
        this.kpiStats[3].value = String(paymentStats.numberOfPayments);
        this.cdr.detectChanges();
      },
      error: () => {
        this.kpiStats[3].value = '—';
        this.cdr.detectChanges();
      }
    });

    // Load recent payments
    this.http.get<RecentPayment[]>(`${environment.apiUrl}/admin/payments`).subscribe({
      next: payments => {
        this.recentPayments = payments.slice(0, 5);
        this.cdr.detectChanges();
      },
      error: () => {}
    });

    // Load audit logs
    this.http.get<AuditLog[]>(`${environment.apiUrl}/audit`).subscribe({
      next: logs => {
        this.recentLogs = logs.slice(0, 5);
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  loadJoinRequests(): void {
    this.requestsLoading = true;
    this.http.get<JoinRequest[]>(`${environment.apiUrl}/join-requests/pending`).subscribe({
      next: (requests) => {
        this.joinRequests = requests;
        this.requestsLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.requestsLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  approveRequest(requestId: string): void {
    this.processingId = requestId;
    this.http.post(`${environment.apiUrl}/join-requests/${requestId}/approve`, null, { responseType: 'text' }).subscribe({
      next: () => {
        this.joinRequests = this.joinRequests.filter(r => r.requestId !== requestId);
        this.processingId = null;
        this.cdr.detectChanges();
        // Refresh student count
        this.tenantService.getStudents().subscribe({ next: s => { this.kpiStats[0].value = String(s.length); this.cdr.detectChanges(); }, error: () => {} });
      },
      error: () => { this.processingId = null; this.cdr.detectChanges(); }
    });
  }

  rejectRequest(requestId: string): void {
    this.processingId = requestId;
    this.http.post(`${environment.apiUrl}/join-requests/${requestId}/reject`, null, { responseType: 'text' }).subscribe({
      next: () => {
        this.joinRequests = this.joinRequests.filter(r => r.requestId !== requestId);
        this.processingId = null;
        this.cdr.detectChanges();
      },
      error: () => { this.processingId = null; this.cdr.detectChanges(); }
    });
  }

  private loadFallback(): void {
    this.tenantService.getStudents().subscribe({
      next: students => {
        this.kpiStats[0].value = String(students.length);
        this.recentStudents = students.slice(0, 5);
        this.studentsLoading = false;
      },
      error: () => {
        this.studentsLoading = false;
      }
    });

    this.tenantService.getMonitors().subscribe({
      next: monitors => {
        this.kpiStats[1].value = String(monitors.length);
      },
      error: () => {}
    });

    this.tenantService.getUpcomingExams().subscribe({
      next: exams => {
        this.kpiStats[2].value = String(exams.length);
      },
      error: () => {}
    });

    this.tenantService.getPaymentStats().subscribe({
      next: paymentStats => {
        this.kpiStats[3].value = String(paymentStats.numberOfPayments);
      },
      error: () => {}
    });
  }

  getStudentDisplayName(student: RecentStudent): string {
    if (student.name?.trim()) {
      return student.name.trim();
    }
    
    if (student.user?.name?.trim()) {
      return student.user.name.trim();
    }
    
    const first = student.prenom?.trim() || student.firstName?.trim() || student.user?.prenom?.trim() || student.user?.firstName?.trim();
    const last = student.nom?.trim() || student.lastName?.trim() || student.user?.nom?.trim() || student.user?.lastName?.trim();
    
    if (first || last) {
      return `${first || ''} ${last || ''}`.trim();
    }

    return student.user?.email || student.email || 'Nom non renseigné';
  }

  getStudentInitials(student: RecentStudent): string {
    if (student.name?.trim()) {
      const nameParts = student.name.trim().split(' ');
      if (nameParts.length >= 2) {
        return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
      }
      return student.name.charAt(0).toUpperCase();
    }
    
    if (student.user?.name?.trim()) {
      const nameParts = student.user.name.trim().split(' ');
      if (nameParts.length >= 2) {
        return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
      }
      return student.user.name.charAt(0).toUpperCase();
    }
    
    const first = student.user?.firstName?.trim();
    const last = student.user?.lastName?.trim();
    if (first || last) {
      return `${first?.charAt(0) || ''}${last?.charAt(0) || ''}`.toUpperCase();
    }

    return (student.user?.email?.charAt(0) || student.email?.charAt(0) || 'N').toUpperCase();
  }
}
