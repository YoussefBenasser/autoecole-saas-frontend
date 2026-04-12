import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

interface School {
  id: string;
  name: string;
  address: string;
  contactEmail: string;
}

@Component({
  selector: 'app-school-selection',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="container">
        <div class="header">
          <h1>Choisissez votre auto-école</h1>
          <p>Sélectionnez une école et envoyez une demande d'inscription. L'école vous contactera après validation.</p>
        </div>

        <div class="loading" *ngIf="isLoading">Chargement des écoles...</div>

        <div class="error" *ngIf="errorMessage">{{ errorMessage }}</div>

        <div class="schools-grid" *ngIf="!isLoading">
          <div class="school-card" *ngFor="let school of schools">
            <div class="school-info">
              <h2>{{ school.name }}</h2>
              <p class="address" *ngIf="school.address">📍 {{ school.address }}</p>
              <p class="email" *ngIf="school.contactEmail">✉️ {{ school.contactEmail }}</p>
            </div>
            <button
              class="request-btn"
              [disabled]="sentRequests.has(school.id) || sending === school.id"
              (click)="sendRequest(school.id)">
              <span *ngIf="sending === school.id">Envoi...</span>
              <span *ngIf="sentRequests.has(school.id) && sending !== school.id">✓ Demande envoyée</span>
              <span *ngIf="!sentRequests.has(school.id) && sending !== school.id">Demander à rejoindre</span>
            </button>
          </div>
        </div>

        <div class="empty" *ngIf="!isLoading && schools.length === 0">
          Aucune école disponible pour le moment.
        </div>

        <div class="footer-note" *ngIf="sentRequests.size > 0">
          Votre demande est en attente de validation par l'école. Vous serez notifié par email.
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: #f4f6fb;
      font-family: system-ui, sans-serif;
    }

    .page {
      padding: 2rem;
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
    }

    .header {
      margin-bottom: 2rem;
    }

    .header h1 {
      font-size: 2rem;
      color: #1a1a2e;
      margin: 0 0 0.5rem;
    }

    .header p {
      color: #555;
      margin: 0;
    }

    .loading, .empty {
      text-align: center;
      color: #888;
      padding: 3rem;
    }

    .error {
      background: #fee;
      border: 1px solid #fcc;
      color: #c00;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
    }

    .schools-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.25rem;
    }

    .school-card {
      background: #fff;
      border-radius: 14px;
      padding: 1.5rem;
      box-shadow: 0 4px 16px rgba(0,0,0,0.07);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 1.25rem;
    }

    .school-info h2 {
      font-size: 1.15rem;
      margin: 0 0 0.5rem;
      color: #1a1a2e;
    }

    .school-info p {
      margin: 0.25rem 0;
      font-size: 0.9rem;
      color: #666;
    }

    .request-btn {
      width: 100%;
      padding: 0.75rem;
      border: none;
      border-radius: 10px;
      background: linear-gradient(135deg, #818cf8, #06b6d4);
      color: #fff;
      font-weight: 700;
      font-size: 0.95rem;
      cursor: pointer;
      transition: opacity 0.2s;
    }

    .request-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      background: #ccc;
      color: #666;
    }

    .footer-note {
      margin-top: 2rem;
      text-align: center;
      color: #888;
      font-size: 0.9rem;
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
    this.http.get<School[]>(`${environment.apiUrl}/join-requests/schools`).subscribe({
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
