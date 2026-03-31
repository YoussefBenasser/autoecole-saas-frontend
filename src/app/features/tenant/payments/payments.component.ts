import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Payment {
  id: number;
  amount: number;
  date: string;
  studentName?: string;
  method?: string;
  status?: string;
}

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-white">Paiements</h1>
        <p class="text-sm mt-1" style="color: var(--color-text-muted)">Suivi des paiements et reçus</p>
      </div>

      <!-- Total recap -->
      <div class="flex gap-4 mb-6">
        <div class="rounded-2xl p-5 border flex items-center gap-4 flex-1" style="background: var(--color-surface); border-color: var(--color-border)">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style="background: rgba(34,197,94,0.15)">💳</div>
          <div>
            <p class="text-xs" style="color: var(--color-text-muted)">Total encaissé</p>
            <p class="text-2xl font-bold text-white mt-0.5">{{ total | number }} DZD</p>
          </div>
        </div>
        <div class="rounded-2xl p-5 border flex items-center gap-4 flex-1" style="background: var(--color-surface); border-color: var(--color-border)">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style="background: rgba(79,70,229,0.15)">📄</div>
          <div>
            <p class="text-xs" style="color: var(--color-text-muted)">Nombre de paiements</p>
            <p class="text-2xl font-bold text-white mt-0.5">{{ payments.length }}</p>
          </div>
        </div>
      </div>

      <div *ngIf="isLoading" class="flex justify-center py-20">
        <svg class="w-8 h-8 animate-spin" style="color: var(--color-success)" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      </div>

      <div *ngIf="!isLoading" class="rounded-2xl overflow-hidden border" style="background: var(--color-surface); border-color: var(--color-border)">
        <table class="w-full text-sm">
          <thead>
            <tr style="background: var(--color-surface-2)">
              <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">Élève</th>
              <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">Montant</th>
              <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">Date</th>
              <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">Méthode</th>
              <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">Statut</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of payments" class="border-t hover:bg-white/5 transition-colors" style="border-color: var(--color-border)">
              <td class="px-5 py-4 font-medium text-white">{{ p.studentName || '—' }}</td>
              <td class="px-5 py-4 font-semibold" style="color: var(--color-success)">{{ p.amount | number }} DZD</td>
              <td class="px-5 py-4" style="color: var(--color-text-muted)">{{ p.date | date:'dd/MM/yyyy' }}</td>
              <td class="px-5 py-4" style="color: var(--color-text-muted)">{{ p.method || 'Espèces' }}</td>
              <td class="px-5 py-4">
                <span class="px-2 py-1 rounded-full text-xs font-semibold"
                      [style.background]="p.status === 'PAID' ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)'"
                      [style.color]="p.status === 'PAID' ? 'var(--color-success)' : 'var(--color-warning)'">
                  {{ p.status === 'PAID' ? 'Payé' : 'En attente' }}
                </span>
              </td>
            </tr>
            <tr *ngIf="payments.length === 0">
              <td colspan="5" class="px-5 py-12 text-center text-sm" style="color: var(--color-text-muted)">Aucun paiement enregistré.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class PaymentsComponent implements OnInit {
  payments: Payment[] = [];
  total = 0;
  isLoading = true;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<Payment[]>(`${environment.apiUrl}/payments`).subscribe({
      next: (data) => {
        this.payments = data;
        this.total = data.reduce((sum, p) => sum + (p.amount || 0), 0);
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }
}
