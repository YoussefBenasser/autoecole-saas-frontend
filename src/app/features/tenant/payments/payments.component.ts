import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';

interface PaymentStats {
  totalRevenue: number;
  numberOfPayments: number;
  averagePayment: number;
  studentsFullyPaid: number;
}

interface Contract {
  id: string;
  studentName: string;
  totalPrice: number;
}

interface Payment {
  id: number;
  amount: number;
  date: string;
  studentName?: string;
  status?: string;
  contractId?: string;
}

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['../dashboard/dashboard.component.css'],
  template: `
    <div class="dashboard-container relative min-h-[500px]">
      <div class="header">
        <div class="header-content">
          <div>
            <h1 class="header-title">Paiements</h1>
            <p class="header-subtitle">Aperçu financier et encaissements</p>
          </div>
          <div class="header-actions">
            <button (click)="openModal()" class="refresh-button">
              <span class="refresh-text">+ Enregistrer un paiement</span>
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="isLoading" class="flex justify-center py-20">
        <svg class="w-8 h-8 animate-spin" style="color: var(--color-success)" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      </div>

      <div *ngIf="!isLoading && stats" class="stats-overview">
        <!-- Total Revenue -->
        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-icon" style="background: rgba(34,197,94,0.15)">💰</div>
            <h3 class="stat-title">Revenus Totaux</h3>
          </div>
          <p class="stat-value">{{ stats.totalRevenue | number }} DZD</p>
        </div>

        <!-- Number of Payments -->
        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-icon" style="background: rgba(99,102,241,0.15)">🧾</div>
            <h3 class="stat-title">Transactions</h3>
          </div>
          <p class="stat-value">{{ stats.numberOfPayments | number }}</p>
        </div>

        <!-- Average Payment -->
        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-icon" style="background: rgba(245,158,11,0.15)">📊</div>
            <h3 class="stat-title">Paiement Moyen</h3>
          </div>
          <p class="stat-value">{{ stats.averagePayment | number:'1.0-2' }} DZD</p>
        </div>

        <!-- Fully Paid Students -->
        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-icon" style="background: rgba(6,182,212,0.15)">🎓</div>
            <h3 class="stat-title">Élèves à Jour</h3>
          </div>
          <p class="stat-value">{{ stats.studentsFullyPaid | number }}</p>
        </div>
      </div>

      <div *ngIf="!isLoading && !stats" class="text-center py-12 border rounded-2xl" style="background: var(--color-surface); border-color: var(--color-border)">
        <p style="color: var(--color-text-muted)">Aucune statistique de paiement disponible pour le moment.</p>
      </div>

      <!-- Payments List -->
      <div *ngIf="!isLoading" class="recent-tenants" style="margin-top: 2rem;">
        <div class="section-header">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h2 class="section-title">Historique des paiements</h2>
            <span class="status-badge approved">
              {{ payments.length }} paiement(s)
            </span>
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
              <tr *ngFor="let p of payments" style="border-top: 1px solid rgba(255, 255, 255, 0.08); transition: all 0.2s ease;">
                <td style="padding: 1rem 2rem; color: rgba(255, 255, 255, 0.9); font-size: 0.9rem;">{{ p.studentName || '—' }}</td>
                <td style="padding: 1rem 2rem; color: #22c55e; font-weight: 600; font-size: 0.9rem;">{{ p.amount | number }} DZD</td>
                <td style="padding: 1rem 2rem; color: rgba(255, 255, 255, 0.7); font-size: 0.9rem;">{{ p.date | date:'dd/MM/yyyy' }}</td>
                <td style="padding: 1rem 2rem;">
                  <span class="status-badge" [ngClass]="p.status === 'PAID' ? 'approved' : 'pending'">
                    {{ p.status === 'PAID' ? 'Payé' : 'En attente' }}
                  </span>
                </td>
              </tr>
              <tr *ngIf="payments.length === 0">
                <td colspan="4" class="empty">Aucun paiement enregistré.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Record Payment Modal Overlay -->
      <div *ngIf="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
        <div class="w-full max-w-md rounded-2xl shadow-xl overflow-hidden border animate-slide-up" style="background: var(--color-surface); border-color: var(--color-border)">
          <div class="px-6 py-4 border-b flex justify-between items-center" style="border-color: var(--color-border); background: var(--color-surface-2)">
            <h3 class="text-lg font-bold text-white">Enregistrer un paiement</h3>
            <button (click)="closeModal()" class="text-gray-400 hover:text-white transition-colors">
              <span class="text-xl">&times;</span>
            </button>
          </div>
          <form (ngSubmit)="onSubmit()" #paymentForm="ngForm" class="p-6">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-1" style="color: var(--color-text-muted)">Élève / Contrat</label>
                <select name="contractId" [(ngModel)]="newPayment.contractId" required
                        class="w-full px-4 py-2 rounded-lg border text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        style="background: rgba(0,0,0,0.2); border-color: var(--color-border)">
                  <option value="" disabled selected>Sélectionner un contrat</option>
                  <option *ngFor="let contract of contracts" [value]="contract.id">
                    {{ contract.studentName }} (Total: {{ contract.totalPrice }} DZD)
                  </option>
                </select>
                <p *ngIf="contracts.length === 0" class="text-xs mt-1 text-amber-500">Aucun contrat disponible. Veuillez créer un contrat d'abord.</p>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1" style="color: var(--color-text-muted)">Montant perçu (DZD)</label>
                <input type="number" name="amount" [(ngModel)]="newPayment.amount" required min="1" step="0.01"
                       class="w-full px-4 py-2 rounded-lg border text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                       style="background: rgba(0,0,0,0.2); border-color: var(--color-border)"
                       placeholder="Ex: 5000" />
              </div>
            </div>
            
            <div class="mt-8 flex gap-3 justify-end">
              <button type="button" (click)="closeModal()" class="px-4 py-2 rounded-lg text-sm font-medium transition-colors border hover:bg-white/5" style="border-color: var(--color-border); color: var(--color-text-muted)">
                Annuler
              </button>
              <button type="submit" [disabled]="!paymentForm.form.valid || isSubmitting"
                      class="px-5 py-2 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-50"
                      style="background: linear-gradient(135deg, #10b981, #059669)">
                <span *ngIf="!isSubmitting">Enregistrer</span>
                <span *ngIf="isSubmitting" class="flex items-center gap-2">
                  <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                  Traitement...
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class PaymentsComponent implements OnInit {
  stats: PaymentStats | null = null;
  contracts: Contract[] = [];
  payments: Payment[] = [];
  isLoading = true;

  isModalOpen = false;
  isSubmitting = false;
  newPayment = { contractId: '', amount: null as number | null };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll() {
    this.isLoading = true;
    this.http.get<PaymentStats>(`${environment.apiUrl}/admin/payments/stats`).subscribe({
      next: (data) => {
        this.stats = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });

    this.http.get<Payment[]>(`${environment.apiUrl}/admin/payments`).subscribe({
      next: (data) => {
        this.payments = data;
      },
      error: () => {}
    });
  }

  loadStats() {
    this.isLoading = true;
    this.http.get<PaymentStats>(`${environment.apiUrl}/admin/payments/stats`).subscribe({
      next: (data) => {
        this.stats = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });

    this.http.get<Payment[]>(`${environment.apiUrl}/admin/payments`).subscribe({
      next: (data) => {
        this.payments = data;
      },
      error: () => {}
    });
  }

  loadContracts() {
    this.http.get<Contract[]>(`${environment.apiUrl}/admin/contracts`).subscribe({
      next: (data) => this.contracts = data,
      error: (err) => console.error('Failed to load contracts', err)
    });
  }

  openModal() {
    this.newPayment = { contractId: '', amount: null };
    this.loadContracts(); // Fetch fresh list of contracts
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  onSubmit() {
    if (!this.newPayment.contractId || !this.newPayment.amount) return;
    this.isSubmitting = true;
    this.http.post(`${environment.apiUrl}/admin/payments`, this.newPayment).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.closeModal();
        this.loadStats(); // Refresh stats
      },
      error: (err) => {
        console.error('Error recording payment', err);
        this.isSubmitting = false;
      }
    });
  }
}
