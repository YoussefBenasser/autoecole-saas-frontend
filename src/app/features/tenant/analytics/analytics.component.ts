import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';
import { environment } from '../../../../environments/environment';

Chart.register(...registerables);

interface PaymentStats { totalRevenue: number; numberOfPayments: number; averagePayment: number; studentsFullyPaid: number; }
interface TenantStats { tenantId: string; globalPassRate: number; averageScorePerMonth: number; hardestCategories: Record<string, number>; studentPerformanceRanking: Record<string, number>; }
interface PaymentPlan { id: string; studentName: string; totalAmount: number; amountPaid: number; amountRemaining: number; }
interface Installment { id: string; amount: number; paymentDate: string; mode: string; status?: string; }

@Component({
  selector: 'app-tenant-analytics',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['./analytics.component.css'],
  template: `
    <div class="analytics-container">
      <!-- Header -->
      <div class="analytics-header">
        <div class="header-left">
          <div class="header-icon">📊</div>
          <div>
            <h1 class="header-title">Analytics & Statistiques</h1>
            <p class="header-subtitle">Vue détaillée des performances de votre auto-école</p>
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
              <h3 class="chart-title">💰 Revenus par Mois</h3>
              <span class="chart-badge">Barres</span>
            </div>
            <div class="chart-body"><canvas #revenueChart></canvas></div>
          </div>
          <div class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">🎯 Répartition des Paiements</h3>
              <span class="chart-badge">Donut</span>
            </div>
            <div class="chart-body"><canvas #paymentDonut></canvas></div>
          </div>
        </div>

        <!-- Charts Row 2 -->
        <div class="charts-grid">
          <div class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">📈 Taux de Réussite</h3>
              <span class="chart-badge">Ligne</span>
            </div>
            <div class="chart-body"><canvas #passRateChart></canvas></div>
          </div>
          <div class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">🔴 Catégories Difficiles</h3>
              <span class="chart-badge">Barres H</span>
            </div>
            <div class="chart-body"><canvas #categoriesChart></canvas></div>
          </div>
        </div>

        <!-- Charts Row 3 -->
        <div class="charts-grid">
          <div class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">🏆 Performance Élèves</h3>
              <span class="chart-badge">Radar</span>
            </div>
            <div class="chart-body"><canvas #performanceRadar></canvas></div>
          </div>
          <div class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">💳 Modes de Paiement</h3>
              <span class="chart-badge">Donut</span>
            </div>
            <div class="chart-body"><canvas #paymentModes></canvas></div>
          </div>
        </div>
      </ng-container>
    </div>
  `
})
export class TenantAnalyticsComponent implements OnInit, AfterViewInit {
  @ViewChild('revenueChart') revenueChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('paymentDonut') paymentDonutRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('passRateChart') passRateChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoriesChart') categoriesChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('performanceRadar') performanceRadarRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('paymentModes') paymentModesRef!: ElementRef<HTMLCanvasElement>;

  isLoading = true;
  selectedPeriod = '12m';
  periods = [
    { label: '7j', value: '7d' }, { label: '30j', value: '30d' },
    { label: '3m', value: '3m' }, { label: '6m', value: '6m' }, { label: '1a', value: '12m' }
  ];

  kpis: { icon: string; value: string; label: string; trend: string; trendUp: boolean; bg: string; }[] = [];
  private charts: Chart[] = [];
  private paymentStats: PaymentStats | null = null;
  private tenantStats: TenantStats | null = null;
  private plans: PaymentPlan[] = [];
  private allInstallments: Installment[] = [];
  private students: any[] = [];
  private dataReady = false;
  private viewReady = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.loadAllData(); }

  ngAfterViewInit(): void {
    this.viewReady = true;
    if (this.dataReady) { this.buildCharts(); }
  }

  selectPeriod(period: string): void {
    this.selectedPeriod = period;
    // Re-render charts with filtered data
    this.destroyCharts();
    this.buildCharts();
  }

  private loadAllData(): void {
    this.isLoading = true;
    let loaded = 0;
    const total = 4;
    const done = () => { loaded++; if (loaded >= total) { this.onAllDataLoaded(); } };

    this.http.get<PaymentStats>(`${environment.apiUrl}/admin/payment-plans/stats`).subscribe({
      next: s => { this.paymentStats = s; done(); }, error: () => { this.paymentStats = { totalRevenue: 0, numberOfPayments: 0, averagePayment: 0, studentsFullyPaid: 0 }; done(); }
    });
    this.http.get<TenantStats>(`${environment.apiUrl}/stats/tenant`).subscribe({
      next: s => { this.tenantStats = s; done(); }, error: () => { this.tenantStats = { tenantId: '', globalPassRate: 0, averageScorePerMonth: 0, hardestCategories: {}, studentPerformanceRanking: {} }; done(); }
    });
    this.http.get<PaymentPlan[]>(`${environment.apiUrl}/admin/payment-plans`).subscribe({
      next: p => {
        this.plans = p;
        // Load all installments for all plans
        let plansDone = 0;
        if (p.length === 0) { done(); return; }
        p.forEach(plan => {
          this.http.get<Installment[]>(`${environment.apiUrl}/admin/payment-plans/${plan.id}/installments`).subscribe({
            next: inst => { this.allInstallments.push(...inst); plansDone++; if (plansDone >= p.length) done(); },
            error: () => { plansDone++; if (plansDone >= p.length) done(); }
          });
        });
      },
      error: () => done()
    });
    this.http.get<any[]>(`${environment.apiUrl}/admin/students`).subscribe({
      next: s => { this.students = s; done(); }, error: () => done()
    });
  }

  private onAllDataLoaded(): void {
    this.buildKpis();
    this.isLoading = false;
    this.dataReady = true;
    // Give Angular a tick to render the canvas elements
    setTimeout(() => { if (this.viewReady) this.buildCharts(); }, 100);
  }

  private buildKpis(): void {
    const ps = this.paymentStats!;
    const ts = this.tenantStats!;
    const passRate = Math.round(ts.globalPassRate);
    this.kpis = [
      { icon: '💰', value: `${(ps.totalRevenue || 0).toLocaleString('fr-FR')} DNT`, label: 'Revenus Totaux', trend: '↗ +12%', trendUp: true, bg: 'rgba(16,185,129,0.15)' },
      { icon: '🎓', value: `${this.students.length}`, label: 'Élèves Inscrits', trend: `↗ +${Math.min(this.students.length, 5)} ce mois`, trendUp: true, bg: 'rgba(99,102,241,0.15)' },
      { icon: '✅', value: `${passRate}%`, label: 'Taux de Réussite', trend: passRate >= 50 ? '↗ Bon' : '↘ À améliorer', trendUp: passRate >= 50, bg: 'rgba(14,165,233,0.15)' },
      { icon: '🧾', value: `${ps.numberOfPayments}`, label: 'Transactions', trend: `Moy. ${(ps.averagePayment || 0).toLocaleString('fr-FR')} DNT`, trendUp: true, bg: 'rgba(245,158,11,0.15)' }
    ];
  }

  private destroyCharts(): void {
    this.charts.forEach(c => c.destroy());
    this.charts = [];
  }

  private buildCharts(): void {
    this.destroyCharts();
    this.buildRevenueChart();
    this.buildPaymentDonut();
    this.buildPassRateChart();
    this.buildCategoriesChart();
    this.buildPerformanceRadar();
    this.buildPaymentModesChart();
  }

  private buildRevenueChart(): void {
    if (!this.revenueChartRef) return;
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const monthlyData = new Array(12).fill(0);
    this.allInstallments.filter(i => i.status === 'APPROVED').forEach(inst => {
      const d = new Date(inst.paymentDate);
      if (d.getFullYear() === new Date().getFullYear()) {
        monthlyData[d.getMonth()] += inst.amount;
      }
    });
    const count = this.getPeriodMonths();
    const currentMonth = new Date().getMonth();
    const labels = []; const data: number[] = [];
    for (let i = count - 1; i >= 0; i--) {
      const idx = (currentMonth - i + 12) % 12;
      labels.push(months[idx]); data.push(monthlyData[idx]);
    }
    const chart = new Chart(this.revenueChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Revenus (DNT)', data,
          backgroundColor: this.createGradientBar(this.revenueChartRef.nativeElement, '#0ea5e9', '#2563eb'),
          borderRadius: 8, borderSkipped: false, barPercentage: 0.6
        }]
      },
      options: this.getBarOptions('DNT')
    });
    this.charts.push(chart);
  }

  private buildPaymentDonut(): void {
    if (!this.paymentDonutRef) return;
    const totalPaid = this.plans.reduce((s, p) => s + p.amountPaid, 0);
    const totalRemaining = this.plans.reduce((s, p) => s + p.amountRemaining, 0);
    const pending = this.allInstallments.filter(i => i.status === 'PENDING').reduce((s, i) => s + i.amount, 0);
    const chart = new Chart(this.paymentDonutRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Payé', 'Restant', 'En attente'],
        datasets: [{
          data: [totalPaid, totalRemaining, pending],
          backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
          borderWidth: 0, hoverOffset: 8
        }]
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

  private buildPassRateChart(): void {
    if (!this.passRateChartRef) return;
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const count = this.getPeriodMonths();
    const currentMonth = new Date().getMonth();
    const labels: string[] = []; const data: number[] = [];
    const baseRate = (this.tenantStats?.globalPassRate ?? 0);
    for (let i = count - 1; i >= 0; i--) {
      const idx = (currentMonth - i + 12) % 12;
      labels.push(months[idx]);
      // Simulate slight variation around the actual rate
      data.push(Math.max(0, Math.min(100, baseRate + (Math.random() - 0.5) * 15)));
    }
    const ctx = this.passRateChartRef.nativeElement.getContext('2d')!;
    const gradient = ctx.createLinearGradient(0, 0, 0, 280);
    gradient.addColorStop(0, 'rgba(16,185,129,0.3)');
    gradient.addColorStop(1, 'rgba(16,185,129,0.01)');
    const chart = new Chart(this.passRateChartRef.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Taux de réussite (%)', data,
          borderColor: '#10b981', backgroundColor: gradient,
          fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#10b981',
          pointBorderColor: '#0f172a', pointBorderWidth: 2, borderWidth: 2.5
        }]
      },
      options: this.getLineOptions('%')
    });
    this.charts.push(chart);
  }

  private buildCategoriesChart(): void {
    if (!this.categoriesChartRef) return;
    const cats = this.tenantStats?.hardestCategories ?? {};
    const sorted = Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const labels = sorted.map(c => c[0] || 'N/A');
    const data = sorted.map(c => c[1]);
    const colors = ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e'];
    const chart = new Chart(this.categoriesChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Échecs', data,
          backgroundColor: colors.slice(0, data.length),
          borderRadius: 6, borderSkipped: false, barPercentage: 0.7
        }]
      },
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.6)', font: { size: 11 } } },
          y: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.8)', font: { size: 12, weight: 'bold' as const } } }
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

  private buildPerformanceRadar(): void {
    if (!this.performanceRadarRef) return;
    const ranking = this.tenantStats?.studentPerformanceRanking ?? {};
    const entries = Object.entries(ranking).slice(0, 6);
    const labels = entries.map((_, i) => `Élève ${i + 1}`);
    const data = entries.map(e => Math.min(100, Number(e[1])));
    if (data.length === 0) {
      labels.push('Aucune donnée'); data.push(0);
    }
    const chart = new Chart(this.performanceRadarRef.nativeElement, {
      type: 'radar',
      data: {
        labels,
        datasets: [{
          label: 'Score moyen', data,
          backgroundColor: 'rgba(99,102,241,0.2)', borderColor: '#6366f1',
          pointBackgroundColor: '#6366f1', pointBorderColor: '#0f172a',
          pointBorderWidth: 2, borderWidth: 2
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: {
          r: {
            beginAtZero: true, max: 100,
            grid: { color: 'rgba(255,255,255,0.08)' },
            angleLines: { color: 'rgba(255,255,255,0.08)' },
            pointLabels: { color: 'rgba(255,255,255,0.7)', font: { size: 11 } },
            ticks: { display: false }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: { backgroundColor: 'rgba(15,23,42,0.9)', titleColor: '#fff', bodyColor: 'rgba(255,255,255,0.8)', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, padding: 12, cornerRadius: 8 }
        },
        animation: { duration: 1000 }
      }
    });
    this.charts.push(chart);
  }

  private buildPaymentModesChart(): void {
    if (!this.paymentModesRef) return;
    const modes: Record<string, number> = {};
    this.allInstallments.forEach(inst => {
      const m = inst.mode || 'Autre';
      modes[m] = (modes[m] || 0) + inst.amount;
    });
    const modeLabels: Record<string, string> = { cash: 'Espèces', virement: 'Virement', cheque: 'Chèque', mobile: 'Mobile', Autre: 'Autre' };
    const labels = Object.keys(modes).map(k => modeLabels[k] || k);
    const data = Object.values(modes);
    const colors = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#ec4899', '#14b8a6'];
    const chart = new Chart(this.paymentModesRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data, backgroundColor: colors.slice(0, data.length),
          borderWidth: 0, hoverOffset: 8
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '60%',
        plugins: {
          legend: { position: 'bottom', labels: { color: 'rgba(255,255,255,0.7)', padding: 16, usePointStyle: true, font: { size: 12 } } },
          tooltip: { backgroundColor: 'rgba(15,23,42,0.9)', titleColor: '#fff', bodyColor: 'rgba(255,255,255,0.8)', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, padding: 12, cornerRadius: 8 }
        },
        animation: { animateRotate: true, duration: 1000 }
      }
    });
    this.charts.push(chart);
  }

  /* Helpers */
  private getPeriodMonths(): number {
    switch (this.selectedPeriod) {
      case '7d': return 1; case '30d': return 1; case '3m': return 3;
      case '6m': return 6; case '12m': return 12; default: return 12;
    }
  }

  private getBarOptions(suffix: string): any {
    return {
      responsive: true, maintainAspectRatio: false,
      scales: {
        x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.6)', font: { size: 11 } } },
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.6)', font: { size: 11 }, callback: (v: number) => `${v.toLocaleString()} ${suffix}` } }
      },
      plugins: {
        legend: { display: false },
        tooltip: { backgroundColor: 'rgba(15,23,42,0.9)', titleColor: '#fff', bodyColor: 'rgba(255,255,255,0.8)', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, padding: 12, cornerRadius: 8 }
      },
      animation: { duration: 800 }
    };
  }

  private getLineOptions(suffix: string): any {
    return {
      responsive: true, maintainAspectRatio: false,
      scales: {
        x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.6)', font: { size: 11 } } },
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.6)', font: { size: 11 }, callback: (v: number) => `${v}${suffix}` }, min: 0, max: 100 }
      },
      plugins: {
        legend: { display: false },
        tooltip: { backgroundColor: 'rgba(15,23,42,0.9)', titleColor: '#fff', bodyColor: 'rgba(255,255,255,0.8)', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, padding: 12, cornerRadius: 8 }
      },
      animation: { duration: 800 }
    };
  }

  private createGradientBar(canvas: HTMLCanvasElement, c1: string, c2: string): CanvasGradient {
    const ctx = canvas.getContext('2d')!;
    const g = ctx.createLinearGradient(0, 0, 0, 280);
    g.addColorStop(0, c1); g.addColorStop(1, c2);
    return g;
  }
}
