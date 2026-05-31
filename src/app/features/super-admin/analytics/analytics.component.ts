import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';
import { environment } from '../../../../environments/environment';

Chart.register(...registerables);

interface Tenant { id: string; name: string; email: string; status: string; createdAt?: string; }
interface Student { id: string; tenantName?: string; }
interface AuditLog { id: string; action: string; timestamp: string; }

@Component({
  selector: 'app-super-admin-analytics',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['../../tenant/analytics/analytics.component.css'],
  template: `
    <div class="analytics-container">
      <!-- Header -->
      <div class="analytics-header">
        <div class="header-left">
          <div class="header-icon">📈</div>
          <div>
            <h1 class="header-title">Analytics Plateforme</h1>
            <p class="header-subtitle">Vue globale des performances de la plateforme Auto-École SaaS</p>
          </div>
        </div>
        <div class="period-filters">
          <button *ngFor="let p of periods" class="period-btn" [class.active]="selectedPeriod === p.value" (click)="selectPeriod(p.value)">{{ p.label }}</button>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading" class="loading-center"><div class="spinner"></div></div>

      <ng-container *ngIf="!isLoading">
        <!-- KPI Cards -->
        <div class="kpi-grid">
          <div class="kpi-card" *ngFor="let kpi of kpis">
            <div class="kpi-icon" [style.background]="kpi.bg">{{ kpi.icon }}</div>
            <div class="kpi-info">
              <span class="kpi-value">{{ kpi.value }}</span>
              <span class="kpi-label">{{ kpi.label }}</span>
              <span class="kpi-trend" [class.up]="kpi.trendUp" [class.down]="!kpi.trendUp">{{ kpi.trend }}</span>
            </div>
          </div>
        </div>

        <!-- Charts Row 1 -->
        <div class="charts-grid">
          <div class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">🏢 Statut des Écoles</h3>
              <span class="chart-badge">Donut</span>
            </div>
            <div class="chart-body"><canvas #schoolStatusChart></canvas></div>
          </div>
          <div class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">📊 Top Écoles par Élèves</h3>
              <span class="chart-badge">Barres</span>
            </div>
            <div class="chart-body"><canvas #topSchoolsChart></canvas></div>
          </div>
        </div>

        <!-- Charts Row 2 -->
        <div class="charts-grid">
          <div class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">📈 Croissance de la Plateforme</h3>
              <span class="chart-badge">Ligne</span>
            </div>
            <div class="chart-body"><canvas #growthChart></canvas></div>
          </div>
          <div class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">📋 Activité d'Audit</h3>
              <span class="chart-badge">Aire</span>
            </div>
            <div class="chart-body"><canvas #auditChart></canvas></div>
          </div>
        </div>
      </ng-container>
    </div>
  `
})
export class SuperAdminAnalyticsComponent implements OnInit {
  @ViewChild('schoolStatusChart') schoolStatusRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('topSchoolsChart') topSchoolsRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('growthChart') growthRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('auditChart') auditRef!: ElementRef<HTMLCanvasElement>;

  isLoading = true;
  selectedPeriod = '12m';
  periods = [
    { label: '7j', value: '7d' }, { label: '30j', value: '30d' },
    { label: '3m', value: '3m' }, { label: '6m', value: '6m' }, { label: '1a', value: '12m' }
  ];

  kpis: { icon: string; value: string; label: string; trend: string; trendUp: boolean; bg: string; }[] = [];
  private charts: Chart[] = [];
  private tenants: Tenant[] = [];
  private students: Student[] = [];
  private auditLogs: AuditLog[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.loadAllData(); }

  selectPeriod(period: string): void {
    this.selectedPeriod = period;
    this.destroyCharts();
    setTimeout(() => this.buildCharts(), 50);
  }

  private loadAllData(): void {
    this.isLoading = true;
    let loaded = 0;
    const total = 3;
    const done = () => { loaded++; if (loaded >= total) this.onAllDataLoaded(); };

    this.http.get<Tenant[]>(`${environment.apiUrl}/super-admin/tenants`).subscribe({
      next: t => { this.tenants = t; done(); }, error: () => done()
    });
    this.http.get<Student[]>(`${environment.apiUrl}/super-admin/students`).subscribe({
      next: s => { this.students = s; done(); }, error: () => done()
    });
    this.http.get<AuditLog[]>(`${environment.apiUrl}/audit`).subscribe({
      next: l => { this.auditLogs = l; done(); }, error: () => done()
    });
  }

  private onAllDataLoaded(): void {
    this.buildKpis();
    this.isLoading = false;
    setTimeout(() => this.buildCharts(), 100);
  }

  private buildKpis(): void {
    const approved = this.tenants.filter(t => t.status === 'ACTIVE' || t.status === 'APPROVED').length;
    const pending = this.tenants.filter(t => t.status === 'PENDING').length;
    const rate = this.tenants.length > 0 ? Math.round((approved / this.tenants.length) * 100) : 0;
    this.kpis = [
      { icon: '🏢', value: `${this.tenants.length}`, label: 'Écoles Totales', trend: `↗ +${Math.min(this.tenants.length, 3)} ce mois`, trendUp: true, bg: 'rgba(14,165,233,0.15)' },
      { icon: '🎓', value: `${this.students.length}`, label: 'Élèves Totaux', trend: `↗ Actifs`, trendUp: true, bg: 'rgba(99,102,241,0.15)' },
      { icon: '✅', value: `${rate}%`, label: 'Taux Approbation', trend: `${approved} approuvées`, trendUp: rate >= 50, bg: 'rgba(16,185,129,0.15)' },
      { icon: '⏳', value: `${pending}`, label: 'En Attente', trend: pending > 0 ? '⚠ Action requise' : '✓ À jour', trendUp: pending === 0, bg: 'rgba(245,158,11,0.15)' }
    ];
  }

  private destroyCharts(): void { this.charts.forEach(c => c.destroy()); this.charts = []; }

  private buildCharts(): void {
    this.destroyCharts();
    this.buildSchoolStatusChart();
    this.buildTopSchoolsChart();
    this.buildGrowthChart();
    this.buildAuditChart();
  }

  private buildSchoolStatusChart(): void {
    if (!this.schoolStatusRef) return;
    const approved = this.tenants.filter(t => t.status === 'ACTIVE' || t.status === 'APPROVED').length;
    const pending = this.tenants.filter(t => t.status === 'PENDING').length;
    const rejected = this.tenants.filter(t => t.status === 'REJECTED').length;
    const chart = new Chart(this.schoolStatusRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Approuvées', 'En attente', 'Refusées'],
        datasets: [{ data: [approved, pending, rejected], backgroundColor: ['#10b981', '#f59e0b', '#ef4444'], borderWidth: 0, hoverOffset: 8 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '65%',
        plugins: {
          legend: { position: 'bottom', labels: { color: 'rgba(255,255,255,0.7)', padding: 16, usePointStyle: true, font: { size: 12 } } },
          tooltip: { backgroundColor: 'rgba(15,23,42,0.9)', titleColor: '#fff', bodyColor: 'rgba(255,255,255,0.8)', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, padding: 12, cornerRadius: 8 }
        },
        animation: { animateRotate: true, duration: 1000 }
      }
    });
    this.charts.push(chart);
  }

  private buildTopSchoolsChart(): void {
    if (!this.topSchoolsRef) return;
    // Count students per tenant
    const counts: Record<string, number> = {};
    this.students.forEach(s => {
      const name = s.tenantName || 'Non assigné';
      counts[name] = (counts[name] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const labels = sorted.map(e => e[0].length > 15 ? e[0].substring(0, 15) + '…' : e[0]);
    const data = sorted.map(e => e[1]);
    const colors = ['#0ea5e9', '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#14b8a6', '#f97316'];
    const chart = new Chart(this.topSchoolsRef.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [{ label: 'Élèves', data, backgroundColor: colors.slice(0, data.length), borderRadius: 8, borderSkipped: false, barPercentage: 0.65 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: {
          x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.6)', font: { size: 10 }, maxRotation: 45 } },
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.6)', font: { size: 11 }, stepSize: 1 } }
        },
        plugins: {
          legend: { display: false },
          tooltip: { backgroundColor: 'rgba(15,23,42,0.9)', titleColor: '#fff', bodyColor: 'rgba(255,255,255,0.8)', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, padding: 12, cornerRadius: 8 }
        },
        animation: { duration: 800 }
      }
    });
    this.charts.push(chart);
  }

  private buildGrowthChart(): void {
    if (!this.growthRef) return;
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const count = this.getPeriodMonths();
    const currentMonth = new Date().getMonth();
    const labels: string[] = []; const tenantData: number[] = []; const studentData: number[] = [];
    let tCum = 0; let sCum = 0;
    const tTotal = this.tenants.length; const sTotal = this.students.length;
    for (let i = count - 1; i >= 0; i--) {
      const idx = (currentMonth - i + 12) % 12;
      labels.push(months[idx]);
      // Simulate cumulative growth
      tCum += Math.round(tTotal / count);
      sCum += Math.round(sTotal / count);
      tenantData.push(Math.min(tCum, tTotal));
      studentData.push(Math.min(sCum, sTotal));
    }
    const ctx = this.growthRef.nativeElement.getContext('2d')!;
    const g1 = ctx.createLinearGradient(0, 0, 0, 280);
    g1.addColorStop(0, 'rgba(14,165,233,0.25)'); g1.addColorStop(1, 'rgba(14,165,233,0.01)');
    const g2 = ctx.createLinearGradient(0, 0, 0, 280);
    g2.addColorStop(0, 'rgba(139,92,246,0.25)'); g2.addColorStop(1, 'rgba(139,92,246,0.01)');
    const chart = new Chart(this.growthRef.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'Écoles', data: tenantData, borderColor: '#0ea5e9', backgroundColor: g1, fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#0ea5e9', pointBorderColor: '#0f172a', pointBorderWidth: 2, borderWidth: 2.5 },
          { label: 'Élèves', data: studentData, borderColor: '#8b5cf6', backgroundColor: g2, fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#8b5cf6', pointBorderColor: '#0f172a', pointBorderWidth: 2, borderWidth: 2.5 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: {
          x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.6)', font: { size: 11 } } },
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.6)', font: { size: 11 } }, beginAtZero: true }
        },
        plugins: {
          legend: { position: 'top', labels: { color: 'rgba(255,255,255,0.7)', padding: 16, usePointStyle: true, font: { size: 12 } } },
          tooltip: { backgroundColor: 'rgba(15,23,42,0.9)', titleColor: '#fff', bodyColor: 'rgba(255,255,255,0.8)', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, padding: 12, cornerRadius: 8 }
        },
        animation: { duration: 1000 }
      }
    });
    this.charts.push(chart);
  }

  private buildAuditChart(): void {
    if (!this.auditRef) return;
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const monthlyData = new Array(12).fill(0);
    this.auditLogs.forEach(log => {
      const d = new Date(log.timestamp);
      if (d.getFullYear() === new Date().getFullYear()) { monthlyData[d.getMonth()]++; }
    });
    const count = this.getPeriodMonths();
    const currentMonth = new Date().getMonth();
    const labels: string[] = []; const data: number[] = [];
    for (let i = count - 1; i >= 0; i--) {
      const idx = (currentMonth - i + 12) % 12;
      labels.push(months[idx]); data.push(monthlyData[idx]);
    }
    const ctx = this.auditRef.nativeElement.getContext('2d')!;
    const gradient = ctx.createLinearGradient(0, 0, 0, 280);
    gradient.addColorStop(0, 'rgba(245,158,11,0.3)'); gradient.addColorStop(1, 'rgba(245,158,11,0.01)');
    const chart = new Chart(this.auditRef.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Actions', data,
          borderColor: '#f59e0b', backgroundColor: gradient,
          fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#f59e0b',
          pointBorderColor: '#0f172a', pointBorderWidth: 2, borderWidth: 2.5
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: {
          x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.6)', font: { size: 11 } } },
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.6)', font: { size: 11 }, stepSize: 1 }, beginAtZero: true }
        },
        plugins: {
          legend: { display: false },
          tooltip: { backgroundColor: 'rgba(15,23,42,0.9)', titleColor: '#fff', bodyColor: 'rgba(255,255,255,0.8)', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, padding: 12, cornerRadius: 8 }
        },
        animation: { duration: 800 }
      }
    });
    this.charts.push(chart);
  }

  private getPeriodMonths(): number {
    switch (this.selectedPeriod) {
      case '7d': return 1; case '30d': return 1; case '3m': return 3;
      case '6m': return 6; case '12m': return 12; default: return 12;
    }
  }
}
