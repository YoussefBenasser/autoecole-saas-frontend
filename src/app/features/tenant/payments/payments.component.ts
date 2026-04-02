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

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative min-h-[500px]">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-white">Paiements</h1>
          <p class="text-sm mt-1" style="color: var(--color-text-muted)">Aperçu financier et encaissements</p>
        </div>
        <button (click)="openModal()" class="px-4 py-2 rounded-lg font-medium text-white shadow-sm transition-transform hover:scale-105"
                style="background: linear-gradient(135deg, #10b981, #059669)">
          + Enregistrer un paiement
        </button>
      </div>

      <div *ngIf="isLoading" class="flex justify-center py-20">
        <svg class="w-8 h-8 animate-spin" style="color: var(--color-success)" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      </div>

      <div *ngIf="!isLoading && stats" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Revenue -->
        <div class="rounded-2xl p-6 border relative overflow-hidden group" style="background: var(--color-surface); border-color: var(--color-border)">
          <div class="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none" style="background: linear-gradient(135deg, #22c55e, #10b981);"></div>
          <div class="flex items-center gap-4 mb-4">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm" style="background: rgba(34,197,94,0.15)">💰</div>
            <div>
              <p class="text-sm font-medium" style="color: var(--color-text-muted)">Revenus Totaux</p>
            </div>
          </div>
          <p class="text-3xl font-bold text-white">{{ stats.totalRevenue | number }} TND</p>
        </div>

        <!-- Number of Payments -->
        <div class="rounded-2xl p-6 border relative overflow-hidden group" style="background: var(--color-surface); border-color: var(--color-border)">
          <div class="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none" style="background: linear-gradient(135deg, #6366f1, #4f46e5);"></div>
          <div class="flex items-center gap-4 mb-4">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm" style="background: rgba(99,102,241,0.15)">🧾</div>
            <div>
              <p class="text-sm font-medium" style="color: var(--color-text-muted)">Transactions</p>
            </div>
          </div>
          <p class="text-3xl font-bold text-white">{{ stats.numberOfPayments | number }}</p>
        </div>

        <!-- Average Payment -->
        <div class="rounded-2xl p-6 border relative overflow-hidden group" style="background: var(--color-surface); border-color: var(--color-border)">
          <div class="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none" style="background: linear-gradient(135deg, #f59e0b, #d97706);"></div>
          <div class="flex items-center gap-4 mb-4">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm" style="background: rgba(245,158,11,0.15)">📊</div>
            <div>
              <p class="text-sm font-medium" style="color: var(--color-text-muted)">Paiement Moyen</p>
            </div>
          </div>
          <p class="text-3xl font-bold text-white">{{ stats.averagePayment | number:'1.0-2' }} TND</p>
        </div>

        <!-- Fully Paid Students -->
        <div class="rounded-2xl p-6 border relative overflow-hidden group" style="background: var(--color-surface); border-color: var(--color-border)">
          <div class="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none" style="background: linear-gradient(135deg, #06b6d4, #0891b2);"></div>
          <div class="flex items-center gap-4 mb-4">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm" style="background: rgba(6,182,212,0.15)">🎓</div>
            <div>
              <p class="text-sm font-medium" style="color: var(--color-text-muted)">Élèves à Jour</p>
            </div>
          </div>
          <p class="text-3xl font-bold text-white">{{ stats.studentsFullyPaid | number }}</p>
        </div>
      </div>

      <div *ngIf="!isLoading && !stats" class="text-center py-12 border rounded-2xl" style="background: var(--color-surface); border-color: var(--color-border)">
        <p style="color: var(--color-text-muted)">Aucune statistique de paiement disponible pour le moment.</p>
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
                    {{ contract.studentName }} (Total: {{ contract.totalPrice }} TND)
                  </option>
                </select>
                <p *ngIf="contracts.length === 0" class="text-xs mt-1 text-amber-500">Aucun contrat disponible. Veuillez créer un contrat d'abord.</p>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1" style="color: var(--color-text-muted)">Montant perçu (TND)</label>
                <input type="number" name="amount" [(ngModel)]="newPayment.amount" required min="1" step="0.01"
                       class="w-full px-4 py-2 rounded-lg border text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                       style="background: rgba(0,0,0,0.2); border-color: var(--color-border)"
                       placeholder="Ex: 50.00" />
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
  isLoading = true;

  isModalOpen = false;
  isSubmitting = false;
  newPayment = { contractId: '', amount: null as number | null };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadStats();
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
