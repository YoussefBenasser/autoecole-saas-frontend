import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TenantService, TenantStatsApi } from '../tenant.service';
import { environment } from '../../../../environments/environment';

interface RecentStudent {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  user?: {
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  email?: string;
}

interface RecentPayment {
  id: number;
  amount: number;
  date: string;
  studentName?: string;
  status?: string;
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
                <h3 class="tenant-name">{{ (s.user?.firstName || s.firstName || '') }} {{ (s.user?.lastName || s.lastName || '') }}</h3>
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
              <td style="padding: 1rem 2rem; color: #22c55e; font-weight: 600; font-size: 0.9rem;">{{ p.amount | number }} DZD</td>
              <td style="padding: 1rem 2rem; color: rgba(255, 255, 255, 0.7); font-size: 0.9rem;">{{ p.date | date:'dd/MM/yyyy' }}</td>
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

  studentsLoading = true;
  statsLoading    = true;
  isLoading      = true;
  errorMessage = '';

  constructor(private tenantService: TenantService, private cdr: ChangeDetectorRef, private http: HttpClient) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.tenantService.getTenantStats().subscribe({
      next: (data: TenantStatsApi) => {
        this.passRate = Math.round(data.globalPassRate * 100);
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
      }
    });

    this.tenantService.getUpcomingExams().subscribe({
      next: exams => {
        this.kpiStats[2].value = String(exams.length);
        this.cdr.detectChanges();
      }
    });

    this.tenantService.getPaymentStats().subscribe({
      next: paymentStats => {
        this.kpiStats[3].value = String(paymentStats.numberOfPayments);
        this.cdr.detectChanges();
      }
    });

    // Load recent payments
    this.http.get<RecentPayment[]>(`${environment.apiUrl}/admin/payments/recent`).subscribe({
      next: payments => {
        this.recentPayments = payments.slice(0, 5);
        this.cdr.detectChanges();
      },
      error: () => {}
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
    
    const first = student.user?.firstName?.trim();
    const last = student.user?.lastName?.trim();
    
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
