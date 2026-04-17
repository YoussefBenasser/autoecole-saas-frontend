import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

interface School {
  id: string;
  name: string;
  address: string;
  email?: string;
  contactEmail?: string;
}

@Component({
  selector: 'app-school-selection',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="school-selection-container">
      <div class="header-section">
        <h1 class="main-title">Choisissez votre auto-école</h1>
        <p class="subtitle">Sélectionnez une école et envoyez une demande d'inscription. L'école vous contactera après validation.</p>
      </div>

      <div *ngIf="isLoading" class="loading-state">
        <svg class="spinner" style="color: var(--color-accent)" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        <p class="loading-text">Chargement des écoles...</p>
      </div>

      <div *ngIf="errorMessage" class="error-card">
        <span class="error-icon">⚠️</span>
        <p class="error-text">{{ errorMessage }}</p>
      </div>

      <div class="schools-table-wrapper" *ngIf="!isLoading">
        <table class="schools-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Adresse</th>
              <th>Email</th>
              <th class="action-column"></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let school of schools" class="school-row">
              <td class="name-cell">
                <div class="school-name">{{ school.name }}</div>
              </td>
              <td class="address-cell">{{ school.address || '—' }}</td>
              <td class="email-cell">{{ school.contactEmail || school.email || '—' }}</td>
              <td class="action-cell">
                <button
                  class="request-btn"
                  [disabled]="sentRequests.has(school.id) || sending === school.id"
                  [class.sending]="sending === school.id"
                  [class.sent]="sentRequests.has(school.id) && sending !== school.id"
                  (click)="sendRequest(school.id)">
                  <span *ngIf="sending === school.id" class="btn-text">⏳ Envoi...</span>
                  <span *ngIf="sentRequests.has(school.id) && sending !== school.id" class="btn-text">✓ Envoyée</span>
                  <span *ngIf="!sentRequests.has(school.id) && sending !== school.id" class="btn-text">Demander</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="empty-state" *ngIf="!isLoading && schools.length === 0">
        <div class="empty-icon">🏫</div>
        <h3 class="empty-title">Aucune école disponible</h3>
        <p class="empty-text">Aucune école n'est disponible pour le moment.</p>
      </div>

      <div class="footer-note" *ngIf="sentRequests.size > 0">
        <span class="note-icon">ℹ️</span>
        <p>Votre demande est en attente de validation par l'école. Vous serez notifié par email.</p>
      </div>
    </div>
  `,
  styles: [`
    .school-selection-container {
      padding: 2rem;
      animation: fadeIn 0.3s ease-in-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Header */
    .header-section {
      margin-bottom: 2.5rem;
      animation: slideDown 0.4s ease-out;
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .main-title {
      font-size: 2rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 0.5rem;
      letter-spacing: -0.01em;
    }

    .subtitle {
      font-size: 0.95rem;
      color: var(--color-text-muted);
      margin: 0;
      opacity: 0.9;
    }

    /* Loading State */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
    }

    .spinner {
      width: 2rem;
      height: 2rem;
      margin-bottom: 1rem;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .loading-text {
      color: var(--color-text-muted);
      font-size: 0.95rem;
      margin: 0;
    }

    /* Error Card */
    .error-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
      border-radius: 1rem;
      margin-bottom: 1.5rem;
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05));
      border: 1px solid rgba(239, 68, 68, 0.2);
      animation: slideDown 0.3s ease-out;
    }

    .error-icon {
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .error-text {
      margin: 0;
      color: #f87171;
      font-size: 0.95rem;
    }

    /* Table Wrapper */
    .schools-table-wrapper {
      border-radius: 1.25rem;
      overflow: hidden;
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.6) 100%);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      overflow-x: auto;
      animation: slideUp 0.4s ease-out;
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Table Styling */
    .schools-table {
      width: 100%;
      border-collapse: collapse;
      min-width: 600px;
      font-size: 0.95rem;
    }

    .schools-table thead {
      background: linear-gradient(135deg, rgba(51, 65, 85, 0.4) 0%, rgba(51, 65, 85, 0.2) 100%);
    }

    .schools-table th {
      padding: 1rem 1.5rem;
      text-align: left;
      color: var(--color-text-muted);
      font-size: 0.8rem;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .schools-table thead th:last-child {
      text-align: right;
    }

    .school-row {
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      transition: background 0.2s ease;
    }

    .school-row:hover {
      background: rgba(255, 255, 255, 0.03);
    }

    .schools-table td {
      padding: 1rem 1.5rem;
      color: var(--color-text);
    }

    .name-cell {
      font-weight: 600;
      color: #ffffff;
    }

    .school-name {
      margin: 0;
    }

    .address-cell,
    .email-cell {
      color: var(--color-text-muted);
      font-size: 0.9rem;
    }

    .action-column,
    .action-cell {
      text-align: right;
      width: 150px;
    }

    /* Request Button */
    .request-btn {
      padding: 0.65rem 1.25rem;
      border: none;
      border-radius: 0.75rem;
      background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%);
      color: #ffffff;
      font-weight: 600;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
      white-space: nowrap;
    }

    .request-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(79, 70, 229, 0.3);
    }

    .request-btn:active:not(:disabled) {
      transform: translateY(0);
    }

    .request-btn.sending,
    .request-btn.sent {
      background: linear-gradient(135deg, rgba(79, 70, 229, 0.4) 0%, rgba(6, 182, 212, 0.4) 100%);
      cursor: default;
    }

    .request-btn.sent {
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.3) 0%, rgba(34, 197, 94, 0.2) 100%);
      color: #4ade80;
    }

    .request-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-text {
      display: inline-block;
    }

    /* Empty State */
    .empty-state {
      padding: 3rem;
      text-align: center;
      border-radius: 1.25rem;
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.6) 100%);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      animation: slideUp 0.4s ease-out;
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      display: block;
    }

    .empty-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 0.5rem;
    }

    .empty-text {
      color: var(--color-text-muted);
      margin: 0;
      font-size: 0.95rem;
    }

    /* Footer Note */
    .footer-note {
      margin-top: 2rem;
      padding: 1rem 1.5rem;
      border-radius: 1rem;
      background: linear-gradient(135deg, rgba(56, 189, 248, 0.1), rgba(56, 189, 248, 0.05));
      border: 1px solid rgba(56, 189, 248, 0.2);
      display: flex;
      align-items: center;
      gap: 1rem;
      animation: slideUp 0.4s ease-out;
    }

    .note-icon {
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    .footer-note p {
      margin: 0;
      color: #38bdf8;
      font-size: 0.9rem;
    }

    @media (max-width: 768px) {
      .school-selection-container {
        padding: 1rem;
      }

      .main-title {
        font-size: 1.5rem;
      }

      .action-column,
      .action-cell {
        width: 130px;
      }

      .request-btn {
        padding: 0.55rem 1rem;
        font-size: 0.8rem;
      }
    }
  `]
})
export class SchoolSelectionComponent implements OnInit {
  schools: School[] = [];
  isLoading = true;
  errorMessage = '';
  sending: string | null = null;
  sentRequests = new Set<string>();

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.http.get<School[]>(`${environment.apiUrl}/public/schools`).subscribe({
      next: (schools) => {
        this.schools = schools;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les écoles. Veuillez réessayer.';
        this.isLoading = false;
      }
    });
  }

  sendRequest(schoolId: string): void {
    this.sending = schoolId;
    const params = new HttpParams().set('tenantId', schoolId);

    this.http.post(`${environment.apiUrl}/join-requests/request`, null, {
      params,
      responseType: 'text'
    }).subscribe({
      next: () => {
        this.sentRequests.add(schoolId);
        this.sending = null;
      },
      error: (err) => {
        this.sending = null;
        this.errorMessage = err?.error || 'Erreur lors de l\'envoi de la demande.';
      }
    });
  }
}
