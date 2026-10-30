import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Chart, registerables } from 'chart.js';
import { environment } from '../../../../environments/environment';

Chart.register(...registerables);

interface PaymentStats { totalRevenue: number; numberOfPayments: number; averagePayment: number; studentsFullyPaid: number; }
interface TenantStats { tenantId: string; globalPassRate: number; averageScorePerMonth: number; hardestCategories: Record<string, number>; studentPerformanceRanking: Record<string, number>; }
interface PaymentPlan { id: string; studentName: string; totalAmount: number; amountPaid: number; amountRemaining: number; }
interface Installment { id: string; amount: number; paymentDate: string; mode: string; status?: string; }
interface Exam { id: string; studentId: string; type: string; date: string; result?: string; status?: string; score?: number; }
interface Session { id: string; sessionDate: string; status: string; monitorId: string; }
interface Student { id: string; prenom?: string; nom?: string; firstName?: string; lastName?: string; user?: { firstName?: string; lastName?: string; prenom?: string; nom?: string; }; }

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
            <h1 class="header-title">Analytics &amp; Statistiques</h1>
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
              <span class="kpi-trend" [class.up]="kpi.trendUp" [class.down]="!kpi.trendUp && kpi.trend !== ''" [class.neutral]="kpi.trend === ''">{{ kpi.trend }}</span>
            </div>
          </div>
        </div>

        <!-- Summary Info Bar -->
        <div class="info-bar">
          <span class="info-item">
            <span class="info-dot" style="background:#10b981"></span>
            Période : <b>{{ getPeriodLabel() }}</b>
          </span>
          <span class="info-item">
            <span class="info-dot" style="background:#6366f1"></span>
            Séances complétées : <b>{{ completedSessionsInPeriod }}</b>
          </span>
          <span class="info-item">
            <span class="info-dot" style="background:#f59e0b"></span>
            Examens passés : <b>{{ examsInPeriod }}</b>
          </span>
          <span class="info-item">
            <span class="info-dot" style="background:#0ea5e9"></span>
            Paiements reçus : <b>{{ paymentsInPeriod }}</b>
          </span>
        </div>

        <!-- Charts Row 1 -->
        <div class="charts-grid">
          <div class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">💰 Revenus par Mois</h3>
              <span class="chart-badge">Réel</span>
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
              <h3 class="chart-title">💳 Modes de Paiement</h3>
              <span class="chart-badge">Donut</span>
            </div>
            <div class="chart-body"><canvas #paymentModes></canvas></div>
          </div>
          <div class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">📅 Séances par Statut</h3>
              <span class="chart-badge">Donut</span>
            </div>
            <div class="chart-body"><canvas #sessionsChart></canvas></div>
          </div>
        </div>
      </ng-container>
    </div>
  `
})
export class TenantAnalyticsComponent implements OnInit, AfterViewInit {
  @ViewChild('revenueChart')  revenueChartRef!:  ElementRef<HTMLCanvasElement>;
  @ViewChild('paymentDonut')  paymentDonutRef!:  ElementRef<HTMLCanvasElement>;
  @ViewChild('paymentModes')  paymentModesRef!:  ElementRef<HTMLCanvasElement>;
  @ViewChild('sessionsChart') sessionsChartRef!: ElementRef<HTMLCanvasElement>;

  isLoading = true;
  selectedPeriod = '12m';
  periods = [
    { label: '7j', value: '7d' }, { label: '30j', value: '30d' },
    { label: '3m', value: '3m' }, { label: '6m', value: '6m' }, { label: '1a', value: '12m' }
  ];

  kpis: { icon: string; value: string; label: string; trend: string; trendUp: boolean; bg: string; }[] = [];
  private charts: Chart[] = [];

  // Raw data from API
  private paymentStats: PaymentStats | null = null;
  private tenantStats:  TenantStats | null  = null;
  private plans:        PaymentPlan[] = [];
  private allInstallments: Installment[] = [];
  private students:     Student[] = [];
  private exams:        Exam[] = [];
  private sessions:     Session[] = [];

  // Computed for info bar
  completedSessionsInPeriod = 0;
  examsInPeriod = 0;
  paymentsInPeriod = 0;

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
    this.buildKpis();
    this.destroyCharts();
    setTimeout(() => this.buildCharts(), 50);
  }

  getPeriodLabel(): string {
    const map: Record<string, string> = { '7d': '7 derniers jours', '30d': '30 derniers jours', '3m': '3 derniers mois', '6m': '6 derniers mois', '12m': '12 derniers mois' };
    return map[this.selectedPeriod] || this.selectedPeriod;
  }

  // ─── Data loading ──────────────────────────────────────────────────────────

  private loadAllData(): void {
    this.isLoading = true;
    this.allInstallments = [];

    forkJoin({
      paymentStats: this.http.get<PaymentStats>(`${environment.apiUrl}/admin/payment-plans/stats`).pipe(catchError(() => of<PaymentStats>({ totalRevenue: 0, numberOfPayments: 0, averagePayment: 0, studentsFullyPaid: 0 }))),
      tenantStats:  this.http.get<TenantStats>(`${environment.apiUrl}/stats/tenant`).pipe(catchError(() => of<TenantStats>({ tenantId: '', globalPassRate: 0, averageScorePerMonth: 0, hardestCategories: {}, studentPerformanceRanking: {} }))),
      plans:        this.http.get<PaymentPlan[]>(`${environment.apiUrl}/admin/payment-plans`).pipe(catchError(() => of<PaymentPlan[]>([]))),
      students:     this.http.get<Student[]>(`${environment.apiUrl}/admin/students`).pipe(catchError(() => of<Student[]>([]))),
      exams:        this.http.get<Exam[]>(`${environment.apiUrl}/exams/upcoming`).pipe(catchError(() => of<Exam[]>([]))),
      sessions:     this.http.get<Session[]>(`${environment.apiUrl}/sessions`).pipe(catchError(() => of<Session[]>([])))
    }).subscribe(({ paymentStats, tenantStats, plans, students, exams, sessions }) => {
      this.paymentStats = paymentStats;
      this.tenantStats  = tenantStats;
      this.plans        = plans;
      this.students     = students;
      this.exams        = exams;
      this.sessions     = sessions;

      if (plans.length === 0) {
        this.onAllDataLoaded();
        return;
      }

      // Load installments for all plans
      let done = 0;
      plans.forEach(plan => {
        this.http.get<Installment[]>(`${environment.apiUrl}/admin/payment-plans/${plan.id}/installments`)
          .pipe(catchError(() => of<Installment[]>([])))
          .subscribe(inst => {
            this.allInstallments.push(...inst);
            done++;
            if (done >= plans.length) this.onAllDataLoaded();
          });
      });
    });
  }

  private onAllDataLoaded(): void {
    this.buildKpis();
    this.isLoading = false;
    this.dataReady = true;
    setTimeout(() => { if (this.viewReady) this.buildCharts(); }, 100);
  }

  // ─── Period helpers ─────────────────────────────────────────────────────────

  /** Returns the cutoff Date for the selected period */
  private getPeriodStart(): Date {
    const now = new Date();
    switch (this.selectedPeriod) {
      case '7d':  { const d = new Date(now); d.setDate(d.getDate() - 7);   return d; }
      case '30d': { const d = new Date(now); d.setDate(d.getDate() - 30);  return d; }
      case '3m':  { const d = new Date(now); d.setMonth(d.getMonth() - 3); return d; }
      case '6m':  { const d = new Date(now); d.setMonth(d.getMonth() - 6); return d; }
      default:    { const d = new Date(now); d.setFullYear(d.getFullYear() - 1); return d; }
    }
  }

  /** Previous period of same length (for trend comparison) */
  private getPrevPeriodStart(): Date {
    const start = this.getPeriodStart();
    const now   = new Date();
    const ms    = now.getTime() - start.getTime();
    return new Date(start.getTime() - ms);
  }

  private getPeriodMonths(): number {
    switch (this.selectedPeriod) {
      case '7d': case '30d': return 1;
      case '3m': return 3; case '6m': return 6; default: return 12;
    }
  }

  /** Filter installments to paid ones in current period */
  private paidInstallmentsInPeriod(): Installment[] {
    const start = this.getPeriodStart();
    return this.allInstallments.filter(i => {
      const paid = ['APPROVED', 'PAID', 'COMPLETED', 'paid', 'approved', 'completed'];
      const dateOk = i.paymentDate && new Date(i.paymentDate) >= start;
      return paid.includes((i.status || '').toLowerCase()) && dateOk;
    });
  }

  private paidInstallmentsInPrevPeriod(): Installment[] {
    const start    = this.getPrevPeriodStart();
    const periodStart = this.getPeriodStart();
    return this.allInstallments.filter(i => {
      const paid = ['APPROVED', 'PAID', 'COMPLETED', 'paid', 'approved', 'completed'];
      const d = i.paymentDate ? new Date(i.paymentDate) : null;
      return paid.includes((i.status || '').toLowerCase()) && d && d >= start && d < periodStart;
    });
  }

  // ─── KPI Builder ────────────────────────────────────────────────────────────

  private buildKpis(): void {
    const periodStart = this.getPeriodStart();

    // Revenue in current period
    const currentInstallments = this.paidInstallmentsInPeriod();
    const prevInstallments    = this.paidInstallmentsInPrevPeriod();
    const currentRevenue = currentInstallments.reduce((s, i) => s + i.amount, 0);
    const prevRevenue    = prevInstallments.reduce((s, i) => s + i.amount, 0);
    const revTrend = prevRevenue === 0
      ? (currentRevenue > 0 ? '↗ Nouveau' : '— Aucun')
      : (() => {
          const diff = ((currentRevenue - prevRevenue) / prevRevenue) * 100;
          return diff >= 0 ? `↗ +${Math.round(diff)}%` : `↘ ${Math.round(diff)}%`;
        })();
    const revUp = prevRevenue === 0 ? currentRevenue > 0 : currentRevenue >= prevRevenue;

    // Students registered in period
    const studentsInPeriod    = this.students.filter(s => (s as any).createdAt && new Date((s as any).createdAt) >= periodStart).length;
    const studentsInPrevPeriod = this.students.filter(s => {
      const d = (s as any).createdAt ? new Date((s as any).createdAt) : null;
      return d && d >= this.getPrevPeriodStart() && d < periodStart;
    }).length;
    const studentTrend = studentsInPrevPeriod === 0
      ? (studentsInPeriod > 0 ? `↗ +${studentsInPeriod} inscrits` : '— Aucun')
      : (() => {
          const diff = studentsInPeriod - studentsInPrevPeriod;
          return diff >= 0 ? `↗ +${diff} vs période préc.` : `↘ ${diff} vs période préc.`;
        })();

    // Pass rate — from real exam data in period
    const examsInPeriod  = this.exams.filter(e => e.date && new Date(e.date) >= periodStart);
    const examsWithResult = examsInPeriod.filter(e => e.result === 'PASSED' || e.result === 'FAILED');
    const passed  = examsWithResult.filter(e => e.result === 'PASSED').length;
    const passRate = examsWithResult.length > 0 ? Math.round((passed / examsWithResult.length) * 100) : Math.round(this.tenantStats?.globalPassRate ?? 0);
    const passRateDisplay = examsWithResult.length > 0 ? `${passRate}%` : `${Math.round(this.tenantStats?.globalPassRate ?? 0)}% (global)`;

    // Sessions in period
    const sessionsInPeriod = this.sessions.filter(s => s.sessionDate && new Date(s.sessionDate) >= periodStart);
    this.completedSessionsInPeriod = sessionsInPeriod.filter(s => s.status === 'COMPLETED').length;
    this.examsInPeriod             = examsInPeriod.length;
    this.paymentsInPeriod          = currentInstallments.length;

    const sessionsTrend = `${this.completedSessionsInPeriod} terminées / ${sessionsInPeriod.length} total`;

    this.kpis = [
      {
        icon: '💰', value: `${currentRevenue.toLocaleString('fr-FR')} DNT`,
        label: 'Revenus Période', trend: revTrend, trendUp: revUp,
        bg: 'rgba(16,185,129,0.15)'
      },
      {
        icon: '🎓', value: `${this.students.length}`,
        label: 'Élèves Inscrits',
        trend: studentsInPeriod > 0 ? `↗ +${studentsInPeriod} cette période` : '— Aucun nouveau',
        trendUp: studentsInPeriod > 0,
        bg: 'rgba(99,102,241,0.15)'
      },
      {
        icon: '✅', value: passRateDisplay,
        label: 'Taux de Réussite',
        trend: passRate >= 50 ? '↗ Bon niveau' : '↘ À améliorer',
        trendUp: passRate >= 50,
        bg: 'rgba(14,165,233,0.15)'
      },
      {
        icon: '📅', value: `${sessionsInPeriod.length}`,
        label: 'Séances Planifiées',
        trend: sessionsTrend,
        trendUp: this.completedSessionsInPeriod > 0,
        bg: 'rgba(245,158,11,0.15)'
      }
    ];
  }

  // ─── Charts ─────────────────────────────────────────────────────────────────

  private destroyCharts(): void { this.charts.forEach(c => c.destroy()); this.charts = []; }

  private buildCharts(): void {
    this.destroyCharts();
    this.buildRevenueChart();
    this.buildPaymentDonut();
    this.buildPaymentModesChart();
    this.buildSessionsChart();
  }

  /** Revenue bar chart — real paid installments per month in period */
  private buildRevenueChart(): void {
    if (!this.revenueChartRef) return;
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const count  = this.getPeriodMonths();
    const now    = new Date();
    const currentMonth = now.getMonth();
    const currentYear  = now.getFullYear();

    const paidStatuses = ['APPROVED', 'PAID', 'COMPLETED', 'paid', 'approved', 'completed'];
    const monthlyRevenue = new Map<string, number>();

    // Build keys for the last N months
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      monthlyRevenue.set(key, 0);
    }

    this.allInstallments.filter(i => paidStatuses.includes((i.status || '').toLowerCase())).forEach(inst => {
      const d = new Date(inst.paymentDate);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (monthlyRevenue.has(key)) {
        monthlyRevenue.set(key, (monthlyRevenue.get(key) || 0) + inst.amount);
      }
    });

    const labels: string[] = [];
    const data: number[]   = [];
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      labels.push(months[d.getMonth()]);
      data.push(monthlyRevenue.get(key) || 0);
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

  /** Payment donut — paid vs remaining vs pending */
  private buildPaymentDonut(): void {
    if (!this.paymentDonutRef) return;
    const paidStatuses = ['APPROVED', 'PAID', 'COMPLETED', 'paid', 'approved', 'completed'];
    const periodStart  = this.getPeriodStart();

    const totalPaid      = this.allInstallments.filter(i => paidStatuses.includes((i.status || '').toLowerCase()) && new Date(i.paymentDate) >= periodStart).reduce((s, i) => s + i.amount, 0);
    const totalPending   = this.allInstallments.filter(i => (i.status || '').toLowerCase() === 'pending' && new Date(i.paymentDate) >= periodStart).reduce((s, i) => s + i.amount, 0);
    const totalRemaining = this.plans.reduce((s, p) => s + p.amountRemaining, 0);

    const chart = new Chart(this.paymentDonutRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Payé', 'Restant', 'En attente'],
        datasets: [{ data: [totalPaid, totalRemaining, totalPending], backgroundColor: ['#10b981', '#6366f1', '#f59e0b'], borderWidth: 0, hoverOffset: 8 }]
      },
      options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { position: 'bottom', labels: { color: 'rgba(255,255,255,0.7)', padding: 16, usePointStyle: true } }, tooltip: this.tooltipDefaults() }, animation: { animateRotate: true, duration: 1000 } }
    });
    this.charts.push(chart);
  }



  /** Payment modes donut */
  private buildPaymentModesChart(): void {
    if (!this.paymentModesRef) return;
    const paidStatuses = ['APPROVED', 'PAID', 'COMPLETED', 'paid', 'approved', 'completed'];
    const periodStart  = this.getPeriodStart();
    const modes: Record<string, number> = {};
    this.allInstallments
      .filter(i => paidStatuses.includes((i.status || '').toLowerCase()) && new Date(i.paymentDate) >= periodStart)
      .forEach(inst => {
        const m = inst.mode || 'Autre';
        modes[m] = (modes[m] || 0) + inst.amount;
      });
    if (Object.keys(modes).length === 0) { this.renderNoData(this.paymentModesRef.nativeElement, 'Aucun paiement cette période'); return; }
    const modeLabels: Record<string, string> = { cash: 'Espèces', virement: 'Virement', cheque: 'Chèque', mobile: 'Mobile', CASH: 'Espèces', VIREMENT: 'Virement', CHEQUE: 'Chèque', MOBILE: 'Mobile', Autre: 'Autre' };
    const labels = Object.keys(modes).map(k => modeLabels[k] || k);
    const data   = Object.values(modes);
    const colors = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#ec4899', '#14b8a6'];
    const chart  = new Chart(this.paymentModesRef.nativeElement, {
      type: 'doughnut',
      data: { labels, datasets: [{ data, backgroundColor: colors.slice(0, data.length), borderWidth: 0, hoverOffset: 8 }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: '60%', plugins: { legend: { position: 'bottom', labels: { color: 'rgba(255,255,255,0.7)', padding: 16, usePointStyle: true } }, tooltip: this.tooltipDefaults() }, animation: { animateRotate: true, duration: 1000 } }
    });
    this.charts.push(chart);
  }


  /** Sessions by status donut */
  private buildSessionsChart(): void {
    if (!this.sessionsChartRef) return;
    const periodStart = this.getPeriodStart();
    const filtered = this.sessions.filter(s => s.sessionDate && new Date(s.sessionDate) >= periodStart);
    const planned   = filtered.filter(s => s.status === 'PLANNED').length;
    const completed = filtered.filter(s => s.status === 'COMPLETED').length;
    const cancelled = filtered.filter(s => s.status === 'CANCELLED').length;
    const other     = filtered.length - planned - completed - cancelled;
    const chart = new Chart(this.sessionsChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Planifiées', 'Terminées', 'Annulées', 'Autres'],
        datasets: [{ data: [planned, completed, cancelled, other], backgroundColor: ['#38bdf8', '#10b981', '#ef4444', '#f59e0b'], borderWidth: 0, hoverOffset: 8 }]
      },
      options: { responsive: true, maintainAspectRatio: false, cutout: '60%', plugins: { legend: { position: 'bottom', labels: { color: 'rgba(255,255,255,0.7)', padding: 14, usePointStyle: true } }, tooltip: this.tooltipDefaults() }, animation: { animateRotate: true, duration: 1000 } }
    });
    this.charts.push(chart);
  }

  // ─── Utilities ───────────────────────────────────────────────────────────────

  private renderNoData(canvas: HTMLCanvasElement, message: string): void {
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
  }

  private tooltipDefaults(): any {
    return { backgroundColor: 'rgba(15,23,42,0.95)', titleColor: '#fff', bodyColor: 'rgba(255,255,255,0.8)', borderColor: 'rgba(255,255,255,0.12)', borderWidth: 1, padding: 12, cornerRadius: 10 };
  }

  private getBarOptions(suffix: string): any {
    return {
      responsive: true, maintainAspectRatio: false,
      scales: {
        x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.6)', font: { size: 11 } } },
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.6)', font: { size: 11 }, callback: (v: number) => `${v.toLocaleString()} ${suffix}` }, beginAtZero: true }
      },
      plugins: { legend: { display: false }, tooltip: this.tooltipDefaults() }, animation: { duration: 800 }
    };
  }

  private getLineOptions(suffix: string): any {
    return {
      responsive: true, maintainAspectRatio: false,
      scales: {
        x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.6)', font: { size: 11 } } },
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.6)', font: { size: 11 }, callback: (v: number) => `${v}${suffix}` }, min: 0, max: 100 }
      },
      plugins: { legend: { display: false }, tooltip: this.tooltipDefaults() }, animation: { duration: 800 }
    };
  }

  private createGradientBar(canvas: HTMLCanvasElement, c1: string, c2: string): CanvasGradient {
    const ctx = canvas.getContext('2d')!;
    const g   = ctx.createLinearGradient(0, 0, 0, 280);
    g.addColorStop(0, c1); g.addColorStop(1, c2);
    return g;
  }
}
