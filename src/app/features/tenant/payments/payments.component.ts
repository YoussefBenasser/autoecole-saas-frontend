import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';

interface Student { id: string; prenom?: string; nom?: string; firstName?: string; lastName?: string; email?: string; }
interface PaymentPlan {
  id: string;
  studentName: string;
  totalAmount: number;
  amountPaid: number;
  amountRemaining: number;
  description: string;
  createdAt: string;
  installments?: Installment[];
}
interface Installment {
  id: string;
  amount: number;
  paymentDate: string;
  mode: string;
  receiptNumber: string;
  verificationCode: string;
  status?: string;
}
interface PaymentStats { totalRevenue: number; numberOfPayments: number; averagePayment: number; studentsFullyPaid: number; }

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe, DatePipe],
  styleUrls: ['../dashboard/dashboard.component.css'],
  template: `
    <div class="page-wrapper">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <div class="header-icon">💰</div>
          <div>
            <h1 class="page-title">Gestion des Paiements</h1>
            <p class="page-subtitle">Plans de paiement et versements des élèves</p>
          </div>
        </div>
        <button class="btn-primary" (click)="openPlanModal()">+ Nouveau plan</button>
      </div>

      <!-- Stats -->
      <div class="stats-grid" *ngIf="stats">
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div><span class="stat-value">{{ stats.totalRevenue | number }} DZD</span><span class="stat-label">Revenus totaux</span></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🧾</div>
          <div><span class="stat-value">{{ stats.numberOfPayments }}</span><span class="stat-label">Transactions</span></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div><span class="stat-value">{{ stats.averagePayment | number:'1.0-0' }} DZD</span><span class="stat-label">Moy. paiement</span></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📋</div>
          <div><span class="stat-value">{{ plans.length }}</span><span class="stat-label">Plans actifs</span></div>
        </div>
      </div>

      <!-- Plans Table -->
      <div class="glass-card">
        <div class="card-header">
          <h2 class="card-title">Plans de paiement</h2>
        </div>
        <div *ngIf="isLoading" class="loading-center"><div class="spinner"></div></div>
        <table *ngIf="!isLoading" class="data-table">
          <thead>
            <tr>
              <th>Élève</th>
              <th>Total</th>
              <th>Payé</th>
              <th>Restant</th>
              <th>Progression</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let plan of plans" class="table-row">
              <td class="name-cell">{{ plan.studentName }}</td>
              <td>{{ plan.totalAmount | number }} DZD</td>
              <td class="paid-cell">{{ plan.amountPaid | number }} DZD</td>
              <td [class.overdue]="plan.amountRemaining > 0">{{ plan.amountRemaining | number }} DZD</td>
              <td>
                <div class="progress-bar">
                  <div class="progress-fill" [style.width]="getProgress(plan) + '%'"></div>
                </div>
                <span class="progress-label">{{ getProgress(plan) }}%</span>
              </td>
              <td>
                <button class="btn-sm btn-success" (click)="openInstallmentModal(plan)">+ Versement</button>
                <button class="btn-sm btn-ghost" (click)="viewInstallments(plan)">📋 Reçus</button>
              </td>
            </tr>
            <tr *ngIf="plans.length === 0">
              <td colspan="6" class="empty-row">Aucun plan de paiement créé.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Installments detail -->
      <div class="glass-card" *ngIf="selectedPlan">
        <div class="card-header">
          <h2 class="card-title">Versements — {{ selectedPlan.studentName }}</h2>
          <button class="btn-ghost-sm" (click)="selectedPlan = null">✕ Fermer</button>
        </div>
        <table class="data-table">
          <thead>
            <tr><th>Date</th><th>Montant</th><th>Mode</th><th>Statut</th><th>N° Reçu</th><th>Code vérif.</th><th>Actions</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let i of selectedPlanInstallments">
              <td>{{ i.paymentDate | date:'dd/MM/yyyy' }}</td>
              <td class="paid-cell">{{ i.amount | number }} DZD</td>
              <td>{{ i.mode }}</td>
              <td>
                <span class="status-badge" [class.status-paid]="i.status === 'APPROVED'" [class.status-pending]="i.status === 'PENDING'">
                   {{ i.status === 'APPROVED' ? 'Approuvé' : 'En attente' }}
                </span>
              </td>
              <td><span class="receipt-chip" *ngIf="i.status === 'APPROVED'">{{ i.receiptNumber }}</span><span *ngIf="i.status !== 'APPROVED'">—</span></td>
              <td><span class="code-chip" *ngIf="i.status === 'APPROVED'">{{ i.verificationCode | slice:0:8 }}...</span><span *ngIf="i.status !== 'APPROVED'">—</span></td>
              <td>
                <button class="btn-sm btn-success" *ngIf="i.status === 'PENDING'" (click)="approveInstallment(i)">✅ Approuver</button>
                <button class="btn-sm btn-ghost" *ngIf="i.status === 'APPROVED'" (click)="printReceipt(i)">🖨️ Imprimer</button>
              </td>
            </tr>
            <tr *ngIf="selectedPlanInstallments.length === 0">
              <td colspan="7" class="empty-row">Aucun versement enregistré.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Create Plan Modal -->
      <div *ngIf="showPlanModal" class="modal-overlay" (click)="showPlanModal=false">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Nouveau plan de paiement</h3>
            <button (click)="showPlanModal=false">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Élève</label>
              <select [(ngModel)]="planForm.studentId" class="form-input">
                <option value="">Sélectionner un élève</option>
                <option *ngFor="let s of students" [value]="s.id">{{ getStudentName(s) }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Montant total (DZD)</label>
              <input type="number" [(ngModel)]="planForm.totalAmount" class="form-input" placeholder="Ex: 25000" min="1" />
            </div>
            <div class="form-group">
              <label>Description (optionnel)</label>
              <input type="text" [(ngModel)]="planForm.description" class="form-input" placeholder="Ex: Formation complète permis B" />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" (click)="showPlanModal=false">Annuler</button>
            <button class="btn-primary" (click)="createPlan()" [disabled]="!planForm.studentId || !planForm.totalAmount || isSaving">
              {{ isSaving ? 'Création...' : 'Créer le plan' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Record Installment Modal -->
      <div *ngIf="showInstallmentModal" class="modal-overlay" (click)="showInstallmentModal=false">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Enregistrer un versement</h3>
            <button (click)="showInstallmentModal=false">✕</button>
          </div>
          <p class="modal-sub">Pour : <strong>{{ selectedPlanForInstallment?.studentName }}</strong></p>
          <p class="modal-sub">Restant : <strong class="amount-due">{{ selectedPlanForInstallment?.amountRemaining | number }} DZD</strong></p>
          <div class="modal-body">
            <div class="form-group">
              <label>Montant versé (DZD)</label>
              <input type="number" [(ngModel)]="installmentForm.amount" class="form-input" placeholder="Ex: 5000" min="1" />
            </div>
            <div class="form-group">
              <label>Mode de paiement</label>
              <select [(ngModel)]="installmentForm.mode" class="form-input">
                <option value="cash">Espèces</option>
                <option value="virement">Virement</option>
                <option value="cheque">Chèque</option>
                <option value="mobile">Mobile Payment</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" (click)="showInstallmentModal=false">Annuler</button>
            <button class="btn-primary" (click)="recordInstallment()" [disabled]="!installmentForm.amount || isSaving">
              {{ isSaving ? 'Enregistrement...' : '✅ Valider & Générer reçu' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .page-wrapper { animation: fadeIn 0.4s ease-out; display: flex; flex-direction: column; gap: 1.5rem; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

    .page-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
    .header-left { display: flex; align-items: center; gap: 1rem; }
    .header-icon { font-size: 2rem; }
    .page-title { font-size: 1.6rem; font-weight: 800; margin: 0;
      background: linear-gradient(135deg, #fff 0%, #fde68a 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .page-subtitle { margin: 0.2rem 0 0; color: rgba(255,255,255,0.55); font-size: 0.85rem; }

    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
    .stat-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 1.25rem; display: flex; align-items: center; gap: 1rem; }
    .stat-icon { font-size: 1.5rem; }
    .stat-value { display: block; font-size: 1.4rem; font-weight: 800; color: #fff; }
    .stat-label { display: block; font-size: 0.78rem; color: rgba(255,255,255,0.5); }

    .glass-card { background: rgba(255,255,255,0.04); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; overflow: hidden; }
    .card-header { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.08); }
    .card-title { font-size: 1rem; font-weight: 700; color: #fff; margin: 0; }

    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { padding: 0.9rem 1.25rem; text-align: left; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: rgba(255,255,255,0.45); border-bottom: 1px solid rgba(255,255,255,0.08); }
    .data-table td { padding: 0.85rem 1.25rem; font-size: 0.875rem; color: rgba(255,255,255,0.8); border-bottom: 1px solid rgba(255,255,255,0.05); }
    .table-row:hover td { background: rgba(255,255,255,0.03); }
    .name-cell { font-weight: 600; color: #fff; }
    .paid-cell { color: #4ade80; font-weight: 600; }
    .overdue { color: #fbbf24; }
    .empty-row { text-align: center; color: rgba(255,255,255,0.35); padding: 2.5rem !important; }

    .progress-bar { height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; margin-bottom: 0.25rem; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, #10b981, #34d399); border-radius: 3px; transition: width 0.5s ease; }
    .progress-label { font-size: 0.72rem; color: rgba(255,255,255,0.5); }

    .receipt-chip { display: inline-block; padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.72rem; font-family: monospace; background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.3); color: #a5b4fc; }
    .code-chip { display: inline-block; padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.72rem; font-family: monospace; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12); color: rgba(255,255,255,0.6); }

    .loading-center { display: flex; justify-content: center; padding: 3rem; }
    .spinner { width: 32px; height: 32px; border: 3px solid rgba(255,255,255,0.1); border-top-color: #10b981; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .btn-primary { padding: 0.7rem 1.5rem; border-radius: 12px; background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; font-size: 0.875rem; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: inherit; }
    .btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(16,185,129,0.3); }
    .btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }

    .btn-secondary { padding: 0.7rem 1.25rem; border-radius: 12px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.7); font-size: 0.875rem; font-weight: 600; cursor: pointer; font-family: inherit; }

    .btn-sm { padding: 0.35rem 0.8rem; border-radius: 8px; font-size: 0.78rem; font-weight: 600; cursor: pointer; border: none; margin-right: 0.4rem; font-family: inherit; }
    .btn-success { background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3); color: #4ade80; }
    .btn-ghost { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: rgba(255,255,255,0.7); }
    .btn-ghost-sm { padding: 0.35rem 0.75rem; border-radius: 8px; font-size: 0.8rem; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: rgba(255,255,255,0.6); cursor: pointer; font-family: inherit; }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 1rem; }
    .modal-box { background: rgba(15,23,42,0.95); border: 1px solid rgba(255,255,255,0.15); border-radius: 20px; width: 100%; max-width: 480px; overflow: hidden; }
    .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .modal-header h3 { color: #fff; margin: 0; font-size: 1rem; font-weight: 700; }
    .modal-header button { background: none; border: none; color: rgba(255,255,255,0.5); cursor: pointer; font-size: 1.1rem; }
    .modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
    .modal-footer { display: flex; gap: 0.75rem; justify-content: flex-end; padding: 1.25rem 1.5rem; border-top: 1px solid rgba(255,255,255,0.08); }
    .modal-sub { margin: 0.5rem 1.5rem 0; color: rgba(255,255,255,0.6); font-size: 0.875rem; }
    .amount-due { color: #fbbf24; }

    .form-group { display: flex; flex-direction: column; gap: 0.4rem; }
    .form-group label { font-size: 0.82rem; font-weight: 600; color: rgba(255,255,255,0.6); }
    .form-input { padding: 0.7rem 1rem; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12); border-radius: 10px; color: white; font-size: 0.9rem; outline: none; transition: border 0.2s; font-family: inherit; }
    .form-input:focus { border-color: rgba(16,185,129,0.5); }
    .form-input::placeholder { color: rgba(255,255,255,0.3); }
    .form-input option { background: #1e293b; }

    @media (max-width: 768px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
  `]
})
export class PaymentsComponent implements OnInit {
  stats: PaymentStats | null = null;
  plans: PaymentPlan[] = [];
  students: Student[] = [];
  isLoading = false;
  isSaving = false;

  showPlanModal = false;
  showInstallmentModal = false;
  selectedPlan: PaymentPlan | null = null;
  selectedPlanForInstallment: PaymentPlan | null = null;
  selectedPlanInstallments: Installment[] = [];

  planForm = { studentId: '', totalAmount: null as number | null, description: '' };
  installmentForm = { amount: null as number | null, mode: 'cash' };

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.loadAll(); }

  loadAll(): void {
    this.isLoading = true;
    this.http.get<PaymentStats>(`${environment.apiUrl}/admin/payment-plans/stats`).subscribe({ next: (s) => this.stats = s, error: () => {} });
    this.http.get<PaymentPlan[]>(`${environment.apiUrl}/admin/payment-plans`).subscribe({
      next: (data) => { this.plans = data; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  openPlanModal(): void {
    this.planForm = { studentId: '', totalAmount: null, description: '' };
    this.http.get<Student[]>(`${environment.apiUrl}/admin/students`).subscribe({ next: (s) => this.students = s, error: () => {} });
    this.showPlanModal = true;
  }

  createPlan(): void {
    if (!this.planForm.studentId || !this.planForm.totalAmount) return;
    this.isSaving = true;
    this.http.post<PaymentPlan>(`${environment.apiUrl}/admin/payment-plans`, this.planForm).subscribe({
      next: () => { this.isSaving = false; this.showPlanModal = false; this.loadAll(); },
      error: (err) => { 
        this.isSaving = false; 
        alert('Erreur: ' + JSON.stringify(err.error || err.message));
      }
    });
  }

  openInstallmentModal(plan: PaymentPlan): void {
    this.selectedPlanForInstallment = plan;
    this.installmentForm = { amount: null, mode: 'cash' };
    this.showInstallmentModal = true;
  }

  recordInstallment(): void {
    if (!this.selectedPlanForInstallment || !this.installmentForm.amount) return;
    this.isSaving = true;
    this.http.post<Installment>(
      `${environment.apiUrl}/admin/payment-plans/${this.selectedPlanForInstallment.id}/installments`,
      this.installmentForm
    ).subscribe({
      next: () => { this.isSaving = false; this.showInstallmentModal = false; this.loadAll(); },
      error: () => { this.isSaving = false; }
    });
  }

  viewInstallments(plan: PaymentPlan): void {
    this.selectedPlan = plan;
    this.http.get<Installment[]>(`${environment.apiUrl}/admin/payment-plans/${plan.id}/installments`).subscribe({
      next: (data) => this.selectedPlanInstallments = data,
      error: () => {}
    });
  }

  getProgress(plan: PaymentPlan): number {
    if (!plan.totalAmount) return 0;
    return Math.round((plan.amountPaid / plan.totalAmount) * 100);
  }

  getStudentName(s: Student): string {
    return [s.prenom || s.firstName, s.nom || s.lastName].filter(Boolean).join(' ') || s.email || s.id;
  }

  approveInstallment(installment: Installment): void {
    if (!this.selectedPlan) return;
    this.http.put<Installment>(`${environment.apiUrl}/admin/payment-plans/installments/${installment.id}/approve`, {}).subscribe({
      next: () => {
        this.loadAll();
        if (this.selectedPlan) {
          this.viewInstallments(this.selectedPlan);
        }
      },
      error: () => alert("Erreur lors de l'approbation.")
    });
  }

  printReceipt(installment: Installment): void {
    if (!this.selectedPlan) return;
    
    const dateObj = new Date(installment.paymentDate);
    const formattedDate = dateObj.toLocaleDateString('fr-FR');
    const formattedTime = dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    const htmlContent = `
      <html>
      <head>
        <title>Reçu - ${installment.receiptNumber}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { margin: 0 0 10px 0; color: #1f2937; }
          .header p { margin: 0; color: #6b7280; font-size: 14px; }
          .receipt-details { margin-bottom: 40px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 15px; }
          .label { font-weight: bold; color: #4b5563; width: 40%; }
          .value { width: 60%; text-align: right; }
          .amount-highlight { font-size: 24px; font-weight: bold; color: #10b981; }
          .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #9ca3af; }
          .code-box { background: #f3f4f6; padding: 10px; text-align: center; font-family: monospace; letter-spacing: 2px; margin-top: 20px; border-radius: 6px; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>REÇU DE PAIEMENT</h1>
          <p>Auto-École SaaS - Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
        </div>
        
        <div class="receipt-details">
          <div class="row">
            <div class="label">Numéro de reçu :</div>
            <div class="value"><strong>${installment.receiptNumber}</strong></div>
          </div>
          <div class="row">
            <div class="label">Date de paiement :</div>
            <div class="value">${formattedDate} à ${formattedTime}</div>
          </div>
          <div class="row">
            <div class="label">Élève :</div>
            <div class="value">${this.selectedPlan.studentName}</div>
          </div>
          <div class="row">
            <div class="label">Mode de paiement :</div>
            <div class="value" style="text-transform: capitalize;">${installment.mode}</div>
          </div>
          <div class="row">
            <div class="label">Montant versé :</div>
            <div class="value amount-highlight">${installment.amount.toLocaleString('fr-FR')} DZD</div>
          </div>
          <div class="row">
            <div class="label">Plan de paiement :</div>
            <div class="value">Total: ${this.selectedPlan.totalAmount.toLocaleString('fr-FR')} DZD<br>
              <span style="font-size:12px; color:#666;">(Reste à payer : ${this.selectedPlan.amountRemaining.toLocaleString('fr-FR')} DZD)</span>
            </div>
          </div>
        </div>

        <div style="text-align: center; margin-top: 40px;">
          <p><strong>Code de vérification</strong></p>
          <div class="code-box">${installment.verificationCode}</div>
        </div>

        <div class="footer">
          <p>Ce reçu est une preuve de paiement électronique. Veuillez le conserver.</p>
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    }
  }
}
