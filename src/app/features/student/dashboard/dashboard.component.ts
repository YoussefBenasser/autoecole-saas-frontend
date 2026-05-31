import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SessionResponse } from '../../../core/models/session.model';

interface School {
  id: string;
  name: string;
  address: string;
  contactEmail?: string;
  email?: string;
}

interface ExamItem {
  id: string;
  date: string;
  type: string;
  status: string;
  result?: string;
  score?: number;
}

interface PaymentPlan {
  id: string;
  totalAmount: number;
  amountPaid: number;
  amountRemaining: number;
}

interface PaymentInstallment {
  id: string;
  amount: number;
  paymentDate: string;
  mode: string;
  status: string;
  receiptNumber?: string;
  verificationCode?: string;
}

interface MockTestItem {
  id: string;
  studentId: string;
  score: number;
  totalQuestions: number;
  passed: boolean;
  takenAt: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, DecimalPipe],
  template: `
    <div class="dashboard-container">

      <!-- ══ SCHOOL SELECTION SCREEN ══ -->
      <div *ngIf="!isLoading && !hasTenant" class="school-gate">

        <!-- PENDING banner -->
        <div *ngIf="requestStatus === 'PENDING'" class="pending-banner">
          <div class="pending-icon">⏳</div>
          <div>
            <h2 class="pending-title">Demande en attente</h2>
            <p class="pending-text">Votre demande a été envoyée. Attendez la validation de l'école.</p>
          </div>
        </div>

        <!-- REJECTED banner -->
        <div *ngIf="requestStatus === 'REJECTED'" class="rejected-banner">
          <div class="rejected-icon">❌</div>
          <div>
            <h2 class="rejected-title">Demande refusée</h2>
            <p class="rejected-text">Votre demande a été refusée. Vous pouvez choisir une autre école.</p>
          </div>
        </div>

        <!-- School selection (shown when no pending request, or after rejection) -->
        <div *ngIf="requestStatus !== 'PENDING'">
          <div class="gate-header">
            <div class="gate-icon">🏫</div>
            <h1 class="gate-title">Choisissez votre auto-école</h1>
            <p class="gate-subtitle">Sélectionnez une école pour commencer. L'école devra valider votre demande.</p>
          </div>

          <div *ngIf="schoolsLoading" class="gate-loading">
            <svg class="spin-icon" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
          </div>

          <div *ngIf="schoolsError" class="gate-error">{{ schoolsError }}</div>

          <div *ngIf="!schoolsLoading" class="schools-table-wrapper">
            <table class="schools-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Adresse</th>
                  <th>Email</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let school of schools" class="school-row">
                  <td class="school-name-cell">{{ school.name }}</td>
                  <td class="school-addr-cell">{{ school.address || '—' }}</td>
                  <td class="school-email-cell">{{ school.contactEmail || school.email || '—' }}</td>
                  <td class="school-action-cell">
                    <button
                      class="request-btn"
                      [disabled]="sentRequest === school.id || sending === school.id"
                      [class.sent]="sentRequest === school.id"
                      [class.sending]="sending === school.id"
                      (click)="sendRequest(school.id)">
                      <span *ngIf="sending === school.id">⏳ Envoi...</span>
                      <span *ngIf="sentRequest === school.id && sending !== school.id">✓ Envoyée</span>
                      <span *ngIf="sentRequest !== school.id && sending !== school.id">Demander</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            <div *ngIf="schools.length === 0" class="gate-empty">Aucune école disponible pour le moment.</div>
          </div>
        </div>
      </div>

      <!-- ══ NORMAL DASHBOARD ══ -->
      <div *ngIf="isLoading" class="flex justify-center py-20">
        <svg class="w-8 h-8 animate-spin" style="color: var(--color-accent)" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      </div>

      <div *ngIf="!isLoading && hasTenant" class="dashboard-content">
        <div class="header-section">
          <h1 class="main-title">Bienvenue !</h1>
          <p class="subtitle">Voici un aperçu de votre progression et de vos prochaines échéances.</p>
        </div>

        <div class="cards-grid">
          <!-- Next Session Card -->
          <div class="card session-card">
            <div class="card-header">
              <div class="card-icon session-icon">🚗</div>
              <h3 class="card-title">Prochaine séance</h3>
            </div>
            <div class="card-content">
              <div *ngIf="nextSession" class="session-info">
                <p class="date-display">{{ nextSession.sessionDate | date:'dd/MM/yyyy' }}</p>
                <p class="time-display">{{ formatTime(nextSession.startTime) }} – {{ formatTime(nextSession.endTime) }}</p>
                <p class="monitor-line" *ngIf="nextSession.monitorId">
                  Moniteur : <span class="monitor-name">{{ getMonitorLabel(nextSession) }}</span>
                </p>
              </div>
              <p *ngIf="!nextSession" class="empty-state">Aucune séance planifiée.</p>
            </div>
            <div class="card-footer">
              <a routerLink="/student/sessions" class="card-link session-link">
                Voir le planning <span class="arrow">→</span>
              </a>
            </div>
          </div>

          <!-- Next Exam Card -->
          <div class="card exam-card">
            <div class="card-header">
              <div class="card-icon exam-icon">📝</div>
              <h3 class="card-title">Prochain examen</h3>
            </div>
            <div class="card-content">
              <div *ngIf="nextExam" class="exam-info">
                <p class="date-display">{{ nextExam.date | date:'dd/MM/yyyy' }}</p>
                <p class="exam-type">
                  {{ nextExam.type.toLowerCase() === 'driving' ? 'Examen Pratique' : 'Examen Théorique (Code)' }}
                </p>
              </div>
              <p *ngIf="!nextExam" class="empty-state">Pas d'examen prévu pour le moment.</p>
            </div>
            <div class="card-footer">
              <a routerLink="/student/exams" class="card-link exam-link">
                Voir les détails <span class="arrow">→</span>
              </a>
            </div>
          </div>

          <!-- Progress Card -->
          <div class="card progress-card">
            <div class="card-header">
              <div class="card-icon progress-icon">📈</div>
              <h3 class="card-title">Progression</h3>
            </div>
            <div class="card-content">
              <p class="progress-count">{{ sessionsCount }} séance(s)</p>
              <div class="progress-bar">
                <div class="progress-fill" [style.width]="(sessionsCount * 5) + '%'"></div>
              </div>
              <p class="progress-note">Basé sur une estimation de 20 séances</p>
            </div>
          </div>

          <!-- Mock Test Card -->
          <div class="card mock-card">
            <div class="card-header">
              <div class="card-icon mock-icon">📝</div>
              <h3 class="card-title">Examen Code</h3>
            </div>
            <div class="card-content">
              <div *ngIf="mockTests.length > 0" class="mock-summary">
                <p class="mock-last-score">Dernier : <strong>{{ mockTests[0].score }}/{{ mockTests[0].totalQuestions }}</strong></p>
                <span class="mock-result-pill" [class.passed]="mockTests[0].passed" [class.failed]="!mockTests[0].passed">
                  {{ mockTests[0].passed ? '✅ Admis' : '❌ Refusé' }}
                </span>
              </div>
              <p *ngIf="mockTests.length === 0" class="empty-state">Aucun test passé.</p>
            </div>
            <div class="card-footer">
              <a routerLink="/student/theoretical-exam" class="card-link mock-link">
                Passer un test <span class="arrow">→</span>
              </a>
            </div>
          </div>
        </div>

        <!-- Sessions list -->
        <div *ngIf="studentId" class="sessions-section">
          <div class="sessions-header">
            <div class="header-left">
              <div class="sessions-icon">📅</div>
              <h2 class="sessions-title">Mes séances</h2>
            </div>
            <span class="sessions-badge" *ngIf="sessions.length > 0">{{ sessions.length }} séance(s)</span>
          </div>

          <div *ngIf="sessions.length > 0" class="sessions-table-wrapper">
            <table class="sessions-table">
              <thead>
                <tr>
                  <th>Date &amp; heure</th>
                  <th>Moniteur</th>
                  <th>Statut</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let s of sessions" class="session-row">
                  <td class="sessions-dt">
                    <div class="sessions-date">{{ s.sessionDate | date:'dd/MM/yyyy' }}</div>
                    <div class="sessions-time">{{ formatTime(s.startTime) }} – {{ formatTime(s.endTime) }}</div>
                  </td>
                  <td>{{ getMonitorLabel(s) }}</td>
                  <td>
                    <span class="session-status-pill" [ngClass]="'st-' + (s.status || '').toLowerCase()">
                      {{ sessionStatusLabel(s.status) }}
                    </span>
                  </td>
                  <td class="sessions-notes">{{ s.notes || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div *ngIf="sessions.length === 0" class="sessions-empty">
            <p>Aucune séance enregistrée pour le moment.</p>
            <a routerLink="/student/sessions" class="sessions-empty-link">Voir le planning →</a>
          </div>
        </div>

        <!-- Mock Tests History -->
        <div *ngIf="mockTests.length > 0" class="mock-tests-section">
          <div class="mock-tests-header">
            <div class="header-left">
              <div class="mock-tests-icon">📝</div>
              <h2 class="mock-tests-title">Historique des Tests Code</h2>
            </div>
            <span class="mock-tests-badge">{{ mockTests.length }} test(s)</span>
          </div>
          <div class="mock-tests-table-wrapper">
            <table class="mock-tests-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Score</th>
                  <th>Résultat</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let t of mockTests" class="mock-test-row">
                  <td class="mock-date-cell">{{ t.takenAt | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td class="mock-score-cell">
                    <strong>{{ t.score }}</strong>/{{ t.totalQuestions }}
                    <span class="mock-percent">({{ getTestPercent(t) }}%)</span>
                  </td>
                  <td>
                    <span class="mock-result-badge" [class.passed]="t.passed" [class.failed]="!t.passed">
                      {{ t.passed ? '✅ Admis' : '❌ Refusé' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Payments section -->
        <div *ngIf="myPlan" class="payments-section">
          <div class="payments-header">
            <div class="header-left">
              <div class="payments-icon">💳</div>
              <h2 class="payments-title">Mon Plan de Paiement</h2>
            </div>
            <span class="payments-badge" [class.status-paid]="myPlan.amountRemaining === 0">
              Reste: {{ myPlan.amountRemaining | number }} DNT
            </span>
          </div>
          
          <div style="padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.08);">
            <div style="color: #e2e8f0;">
              <p style="margin: 0;"><strong>Total:</strong> {{ myPlan.totalAmount | number }} DNT</p>
              <p style="margin: 0.25rem 0 0; color: #4ade80;"><strong>Payé:</strong> {{ myPlan.amountPaid | number }} DNT</p>
            </div>
            <button class="btn-sm btn-success" (click)="openPaymentModal()" style="padding: 0.5rem 1rem; border-radius: 6px; background: #3b82f6; color: white; border: none; cursor: pointer; font-weight: bold;">+ Déclarer un versement</button>
          </div>

          <div class="payments-table-wrapper" *ngIf="myInstallments.length > 0">
            <table class="payments-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Montant</th>
                  <th>Mode</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let p of myInstallments" class="payment-row">
                  <td class="date-cell">{{ p.paymentDate | date:'dd/MM/yyyy' }}</td>
                  <td class="amount-cell">{{ p.amount | number }} DNT</td>
                  <td>{{ p.mode }}</td>
                  <td class="status-cell">
                    <span class="status-badge"
                          [ngClass]="p.status === 'APPROVED' ? 'status-paid' : 'status-pending'">
                      {{ p.status === 'APPROVED' ? '✓ Approuvé' : '⏳ En attente' }}
                    </span>
                  </td>
                  <td>
                    <button class="btn-sm btn-ghost" *ngIf="p.status === 'APPROVED'" (click)="printReceipt(p)" style="padding: 0.25rem 0.5rem; background: transparent; color: #e2e8f0; border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; cursor: pointer;">🖨️ Imprimer</button>
                    <span *ngIf="p.status !== 'APPROVED'" style="color:#9ca3af; font-size:0.85rem;">Attente validation</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Payment Modal -->
        <div *ngIf="showPaymentModal" class="modal-overlay" (click)="showPaymentModal=false" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:1000;backdrop-filter: blur(4px);">
          <div class="modal-box" (click)="$event.stopPropagation()" style="background:#1e293b;padding:2rem;border-radius:12px;width:400px;color:#f8fafc;box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
            <h3 style="margin-top:0;font-size:1.5rem;font-weight:bold;margin-bottom:0.5rem;">Déclarer un versement</h3>
            <p style="margin-bottom:1.5rem;color:#94a3b8;font-size:0.9rem;">Ce versement devra être approuvé par l'école avant d'être comptabilisé.</p>
            <div style="margin-bottom:1rem;">
              <label style="display:block;margin-bottom:0.5rem;font-weight:bold;color:#cbd5e1;">Montant (DNT)</label>
              <input type="number" [(ngModel)]="paymentForm.amount" style="width:100%;padding:0.75rem;border:1px solid #475569;border-radius:6px;background:#0f172a;color:white;box-sizing:border-box;" />
            </div>
            <div style="margin-bottom:1.5rem;">
              <label style="display:block;margin-bottom:0.5rem;font-weight:bold;color:#cbd5e1;">Mode de paiement</label>
              <select [(ngModel)]="paymentForm.mode" style="width:100%;padding:0.75rem;border:1px solid #475569;border-radius:6px;background:#0f172a;color:white;box-sizing:border-box;">
                <option value="cash">Espèces</option>
                <option value="virement">Virement</option>
                <option value="cheque">Chèque</option>
              </select>
            </div>
            <div style="display:flex;justify-content:flex-end;gap:1rem;">
              <button (click)="showPaymentModal=false" style="padding:0.5rem 1rem;border:1px solid #475569;background:transparent;color:#cbd5e1;border-radius:6px;cursor:pointer;font-weight:600;">Annuler</button>
              <button (click)="submitPayment()" [disabled]="!paymentForm.amount" style="padding:0.5rem 1rem;border:none;background:#3b82f6;color:#fff;border-radius:6px;cursor:pointer;font-weight:600;">Envoyer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 0 2rem 2rem;
    }

    .dashboard-content {
      animation: fadeIn 0.3s ease-in-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Header Section */
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

    /* Cards Grid */
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    /* Card Styling with Glassmorphism */
    .card {
      padding: 1.75rem;
      border-radius: 1.25rem;
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.6) 100%);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }

    .card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(79, 70, 229, 0.05) 0%, transparent 100%);
      pointer-events: none;
    }

    .card:hover {
      border-color: rgba(255, 255, 255, 0.15);
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08);
      transform: translateY(-4px);
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.7) 100%);
    }

    /* Card Components */
    .card-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.25rem;
      position: relative;
      z-index: 1;
    }

    .card-icon {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .session-icon { background: linear-gradient(135deg, rgba(79, 70, 229, 0.2) 0%, rgba(79, 70, 229, 0.1) 100%); }
    .exam-icon { background: linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(168, 85, 247, 0.1) 100%); }
    .progress-icon { background: linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%); }
    .mock-icon { background: linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(251, 191, 36, 0.1) 100%); }

    .card-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #ffffff;
      margin: 0;
      letter-spacing: 0.01em;
    }

    .card-content {
      margin-bottom: 1rem;
      position: relative;
      z-index: 1;
    }

    .session-info,
    .exam-info {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .date-display {
      font-size: 1.4rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
    }

    .time-display,
    .exam-type {
      font-size: 0.9rem;
      color: var(--color-text-muted);
      margin: 0;
    }

    .monitor-line {
      font-size: 0.85rem;
      color: var(--color-text-muted);
      margin: 0.5rem 0 0;
    }

    .monitor-name {
      color: #e2e8f0;
      font-weight: 500;
    }

    .empty-state {
      font-size: 0.9rem;
      color: var(--color-text-muted);
      margin: 0;
      font-style: italic;
    }

    .card-footer {
      padding-top: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      position: relative;
      z-index: 1;
    }

    .card-link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s ease;
      position: relative;
    }

    .session-link { color: #818cf8; }
    .exam-link { color: #c084fc; }
    .mock-link { color: #fbbf24; }

    /* Mock summary in card */
    .mock-summary {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .mock-last-score {
      font-size: 1rem;
      color: #ffffff;
      margin: 0;
    }

    .mock-result-pill, .mock-result-badge {
      display: inline-flex;
      padding: 0.35rem 0.75rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .mock-result-pill.passed, .mock-result-badge.passed {
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05));
      color: #4ade80;
      border: 1px solid rgba(34, 197, 94, 0.2);
    }

    .mock-result-pill.failed, .mock-result-badge.failed {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05));
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.2);
    }

    .card-link:hover {
      opacity: 1;
      transform: translateX(2px);
    }

    .card-link .arrow {
      transition: transform 0.2s ease;
    }

    .card-link:hover .arrow {
      transform: translateX(4px);
    }

    /* Progress Card */
    .progress-count {
      font-size: 1.4rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 1rem;
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.1);
      overflow: hidden;
      margin-bottom: 0.75rem;
    }

    .progress-fill {
      height: 100%;
      border-radius: 999px;
      background: linear-gradient(90deg, #22c55e 0%, #14b8a6 100%);
      box-shadow: 0 0 10px rgba(34, 197, 94, 0.4);
      transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .progress-note {
      font-size: 0.8rem;
      color: var(--color-text-muted);
      margin: 0;
    }

    /* Sessions list */
    .sessions-section {
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.6) 100%);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 1.25rem;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      margin-bottom: 2rem;
      animation: slideUp 0.4s ease-out;
    }

    .sessions-header {
      padding: 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: linear-gradient(135deg, rgba(51, 65, 85, 0.4) 0%, rgba(51, 65, 85, 0.2) 100%);
    }

    .sessions-icon {
      width: 2rem;
      height: 2rem;
      border-radius: 0.625rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      background: linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(56, 189, 248, 0.1) 100%);
    }

    .sessions-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
      letter-spacing: 0.01em;
    }

    .sessions-badge {
      font-size: 0.8rem;
      padding: 0.5rem 1rem;
      border-radius: 999px;
      background: linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(56, 189, 248, 0.05) 100%);
      color: #38bdf8;
      font-weight: 600;
    }

    .sessions-table-wrapper {
      overflow-x: auto;
    }

    .sessions-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.95rem;
    }

    .sessions-table thead {
      background: rgba(51, 65, 85, 0.3);
    }

    .sessions-table th {
      padding: 1rem 1.5rem;
      text-align: left;
      font-weight: 600;
      color: var(--color-text-muted);
      font-size: 0.8rem;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .session-row {
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      transition: background 0.2s ease;
    }

    .session-row:hover {
      background: rgba(255, 255, 255, 0.03);
    }

    .sessions-table td {
      padding: 1rem 1.5rem;
      color: var(--color-text);
      vertical-align: top;
    }

    .sessions-dt {
      min-width: 140px;
    }

    .sessions-date {
      font-weight: 600;
      color: #ffffff;
    }

    .sessions-time {
      font-size: 0.8rem;
      color: var(--color-text-muted);
      margin-top: 0.25rem;
    }

    .sessions-notes {
      color: var(--color-text-muted);
      font-size: 0.9rem;
      max-width: 220px;
      word-break: break-word;
    }

    .session-status-pill {
      display: inline-flex;
      padding: 0.35rem 0.75rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .session-status-pill.st-planned {
      background: linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(56, 189, 248, 0.05));
      color: #38bdf8;
      border: 1px solid rgba(56, 189, 248, 0.2);
    }

    .session-status-pill.st-completed {
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05));
      color: #4ade80;
      border: 1px solid rgba(34, 197, 94, 0.2);
    }

    .session-status-pill.st-cancelled {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05));
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.2);
    }

    .sessions-empty {
      padding: 2rem 1.5rem;
      text-align: center;
      color: var(--color-text-muted);
      font-size: 0.95rem;
    }

    .sessions-empty-link {
      display: inline-block;
      margin-top: 0.75rem;
      color: #818cf8;
      font-weight: 600;
      text-decoration: none;
    }

    .sessions-empty-link:hover {
      opacity: 0.9;
    }

    /* Mock Tests History */
    .mock-tests-section {
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.6) 100%);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 1.25rem;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      margin-bottom: 2rem;
      animation: slideUp 0.4s ease-out;
    }

    .mock-tests-header {
      padding: 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: linear-gradient(135deg, rgba(51, 65, 85, 0.4) 0%, rgba(51, 65, 85, 0.2) 100%);
    }

    .mock-tests-icon {
      width: 2rem;
      height: 2rem;
      border-radius: 0.625rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      background: linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(251, 191, 36, 0.1) 100%);
    }

    .mock-tests-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
      letter-spacing: 0.01em;
    }

    .mock-tests-badge {
      font-size: 0.8rem;
      padding: 0.5rem 1rem;
      border-radius: 999px;
      background: linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(251, 191, 36, 0.05) 100%);
      color: #fbbf24;
      font-weight: 600;
    }

    .mock-tests-table-wrapper {
      overflow-x: auto;
    }

    .mock-tests-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.95rem;
    }

    .mock-tests-table thead {
      background: rgba(51, 65, 85, 0.3);
    }

    .mock-tests-table th {
      padding: 1rem 1.5rem;
      text-align: left;
      font-weight: 600;
      color: var(--color-text-muted);
      font-size: 0.8rem;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .mock-test-row {
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      transition: background 0.2s ease;
    }

    .mock-test-row:hover {
      background: rgba(255, 255, 255, 0.03);
    }

    .mock-tests-table td {
      padding: 1rem 1.5rem;
      color: var(--color-text);
    }

    .mock-date-cell {
      color: var(--color-text-muted);
    }

    .mock-score-cell {
      font-weight: 600;
      color: #ffffff;
    }

    .mock-percent {
      font-weight: 400;
      color: var(--color-text-muted);
      font-size: 0.85rem;
    }

    /* Payments Section */
    .payments-section {
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.6) 100%);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 1.25rem;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      animation: slideUp 0.4s ease-out;
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .payments-header {
      padding: 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: linear-gradient(135deg, rgba(51, 65, 85, 0.4) 0%, rgba(51, 65, 85, 0.2) 100%);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .payments-icon {
      width: 2rem;
      height: 2rem;
      border-radius: 0.625rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%);
    }

    .payments-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
      letter-spacing: 0.01em;
    }

    .payments-badge {
      font-size: 0.8rem;
      padding: 0.5rem 1rem;
      border-radius: 999px;
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%);
      color: #34d399;
      font-weight: 600;
    }

    .payments-table-wrapper {
      overflow-x: auto;
    }

    .payments-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.95rem;
    }

    .payments-table thead {
      background: rgba(51, 65, 85, 0.3);
    }

    .payments-table th {
      padding: 1rem 1.5rem;
      text-align: left;
      font-weight: 600;
      color: var(--color-text-muted);
      font-size: 0.8rem;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .payment-row {
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      transition: background 0.2s ease;
    }

    .payment-row:hover {
      background: rgba(255, 255, 255, 0.03);
    }

    .payments-table td {
      padding: 1rem 1.5rem;
      color: var(--color-text);
    }

    .amount-cell {
      font-weight: 600;
      color: #22c55e;
    }

    .date-cell {
      color: var(--color-text-muted);
    }

    .status-cell {
      text-align: right;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.5rem 1rem;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 600;
      white-space: nowrap;
      backdrop-filter: blur(4px);
    }

    .status-paid {
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.05) 100%);
      color: #4ade80;
      border: 1px solid rgba(34, 197, 94, 0.2);
    }

    .status-pending {
      background: linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(251, 191, 36, 0.05) 100%);
      color: #fbbf24;
      border: 1px solid rgba(251, 191, 36, 0.2);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .dashboard-container {
        padding: 0 1rem 1rem;
      }

      .main-title {
        font-size: 1.6rem;
      }

      .cards-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .payments-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .payments-badge {
        align-self: flex-start;
      }

      .sessions-table {
        min-width: 100%;
      }
    }

    /* ══ SCHOOL GATE STYLES ══ */
    .school-gate {
      padding: 2rem 0;
      animation: fadeIn 0.3s ease-in-out;
    }

    .gate-header {
      text-align: center;
      margin-bottom: 2.5rem;
    }

    .gate-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .gate-title {
      font-size: 2rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 0.75rem;
    }

    .gate-subtitle {
      color: var(--color-text-muted);
      font-size: 1rem;
      margin: 0;
    }

    .gate-loading {
      display: flex;
      justify-content: center;
      padding: 3rem;
    }

    .spin-icon {
      width: 2rem;
      height: 2rem;
      animation: spin 1s linear infinite;
      color: var(--color-accent);
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .gate-error {
      padding: 1rem 1.5rem;
      border-radius: 1rem;
      background: rgba(239,68,68,0.1);
      border: 1px solid rgba(239,68,68,0.2);
      color: #f87171;
      margin-bottom: 1.5rem;
    }

    .gate-empty {
      text-align: center;
      padding: 2rem;
      color: var(--color-text-muted);
    }

    .schools-table-wrapper {
      border-radius: 1.25rem;
      overflow: hidden;
      background: linear-gradient(135deg, rgba(30,41,59,0.8) 0%, rgba(51,65,85,0.6) 100%);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.1);
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }

    .schools-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.95rem;
    }

    .schools-table thead {
      background: linear-gradient(135deg, rgba(51,65,85,0.4) 0%, rgba(51,65,85,0.2) 100%);
    }

    .schools-table th {
      padding: 1rem 1.5rem;
      text-align: left;
      color: var(--color-text-muted);
      font-size: 0.8rem;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }

    .school-row {
      border-top: 1px solid rgba(255,255,255,0.05);
      transition: background 0.2s ease;
    }

    .school-row:hover { background: rgba(255,255,255,0.03); }

    .schools-table td { padding: 1rem 1.5rem; color: var(--color-text); }

    .school-name-cell { font-weight: 600; color: #ffffff; }
    .school-addr-cell, .school-email-cell { color: var(--color-text-muted); font-size: 0.9rem; }
    .school-action-cell { text-align: right; }

    .request-btn {
      padding: 0.6rem 1.25rem;
      border: none;
      border-radius: 0.75rem;
      background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%);
      color: #fff;
      font-weight: 600;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(79,70,229,0.2);
    }

    .request-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(79,70,229,0.3);
    }

    .request-btn.sending, .request-btn.sent {
      background: linear-gradient(135deg, rgba(79,70,229,0.4) 0%, rgba(6,182,212,0.4) 100%);
      cursor: default;
    }

    .request-btn.sent {
      background: linear-gradient(135deg, rgba(34,197,94,0.3) 0%, rgba(34,197,94,0.2) 100%);
      color: #4ade80;
    }

    .request-btn:disabled { opacity: 0.6; cursor: not-allowed; }

    /* Pending / Rejected banners */
    .pending-banner {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding: 2rem;
      border-radius: 1.25rem;
      background: linear-gradient(135deg, rgba(251,191,36,0.1), rgba(251,191,36,0.05));
      border: 1px solid rgba(251,191,36,0.25);
      margin-bottom: 2rem;
      animation: fadeIn 0.3s ease-in-out;
    }

    .pending-icon { font-size: 3rem; flex-shrink: 0; }

    .pending-title {
      font-size: 1.4rem;
      font-weight: 700;
      color: #fbbf24;
      margin: 0 0 0.5rem;
    }

    .pending-text { color: var(--color-text-muted); margin: 0; }

    .rejected-banner {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding: 2rem;
      border-radius: 1.25rem;
      background: linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.05));
      border: 1px solid rgba(239,68,68,0.25);
      margin-bottom: 2rem;
      animation: fadeIn 0.3s ease-in-out;
    }

    .rejected-icon { font-size: 3rem; flex-shrink: 0; }

    .rejected-title {
      font-size: 1.4rem;
      font-weight: 700;
      color: #f87171;
      margin: 0 0 0.5rem;
    }

    .rejected-text { color: var(--color-text-muted); margin: 0; }
  `]
})
export class DashboardComponent implements OnInit {
  profile: any = null;
  studentId: string | null = null;
  hasTenant = false;
  requestStatus: string | null = null;
  schools: School[] = [];
  schoolsLoading = false;
  schoolsError = '';
  sending: string | null = null;
  sentRequest: string | null = null;

  sessions: SessionResponse[] = [];
  nextSession: SessionResponse | null = null;
  nextExam: ExamItem | null = null;
  sessionsCount = 0;
  myPlan: PaymentPlan | null = null;
  myInstallments: PaymentInstallment[] = [];
  mockTests: MockTestItem[] = [];
  
  showPaymentModal = false;
  paymentForm = { amount: null, mode: 'cash' };
  isLoading = true;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/profile/me`).subscribe({
      next: (profile) => {
        this.profile = profile;
        this.studentId = profile.studentId || null;
        this.hasTenant = !!profile.tenantId;
        this.requestStatus = profile.joinRequestStatus || null;

        if (this.hasTenant && profile.studentId) {
          this.loadStudentData(profile.studentId);
        } else {
          this.isLoading = false;
          if (this.requestStatus !== 'PENDING') {
            this.loadSchools();
          }
        }
      },
      error: () => this.isLoading = false
    });
  }

  loadSchools() {
    this.schoolsLoading = true;
    this.http.get<School[]>(`${environment.apiUrl}/public/schools`).subscribe({
      next: (schools) => {
        this.schools = schools;
        this.schoolsLoading = false;
      },
      error: () => {
        this.schoolsError = 'Impossible de charger les écoles. Veuillez réessayer.';
        this.schoolsLoading = false;
      }
    });
  }

  sendRequest(schoolId: string) {
    this.sending = schoolId;
    const params = new HttpParams().set('tenantId', schoolId);
    this.http.post(`${environment.apiUrl}/join-requests/request`, null, { params, responseType: 'text' }).subscribe({
      next: () => {
        this.sentRequest = schoolId;
        this.sending = null;
        this.requestStatus = 'PENDING';
      },
      error: (err) => {
        this.sending = null;
        this.schoolsError = err?.error || 'Erreur lors de l\'envoi de la demande.';
      }
    });
  }

  loadStudentData(studentId: string) {
    forkJoin({
      sessions: this.http.get<SessionResponse[]>(`${environment.apiUrl}/student/sessions?studentId=${studentId}`).pipe(catchError(() => of([]))),
      exams: this.http.get<ExamItem[]>(`${environment.apiUrl}/exams/student/${studentId}`).pipe(catchError(() => of([]))),
      plans: this.http.get<PaymentPlan[]>(`${environment.apiUrl}/student/payment-plans/my?studentId=${studentId}`).pipe(catchError(() => of([]))),
      installments: this.http.get<PaymentInstallment[]>(`${environment.apiUrl}/student/payment-plans/my/installments?studentId=${studentId}`).pipe(catchError(() => of([]))),
      mockTests: this.http.get<MockTestItem[]>(`${environment.apiUrl}/student/mock-tests/student/${studentId}`).pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ sessions, exams, plans, installments, mockTests }) => {
        this.sessionsCount = sessions.length;
        this.sessions = [...sessions].sort((a, b) => {
          const dc = new Date(a.sessionDate + 'T00:00:00').getTime() - new Date(b.sessionDate + 'T00:00:00').getTime();
          if (dc !== 0) return dc;
          return (a.startTime || '').localeCompare(b.startTime || '');
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const upcoming = sessions.filter(s => {
          const d = new Date(s.sessionDate + 'T00:00:00');
          return d >= today && s.status === 'PLANNED';
        }).sort((a, b) => {
          const dc = new Date(a.sessionDate + 'T00:00:00').getTime() - new Date(b.sessionDate + 'T00:00:00').getTime();
          if (dc !== 0) return dc;
          return (a.startTime || '').localeCompare(b.startTime || '');
        });
        this.nextSession = upcoming[0] || null;

        const now = new Date();
        const upcomingExams = exams.filter(e => e.status === 'SCHEDULED' && new Date(e.date) >= now)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        this.nextExam = upcomingExams[0] || null;

        this.myPlan = plans && plans.length > 0 ? plans[0] : null;
        this.myInstallments = installments || [];

        this.mockTests = (mockTests || []).sort((a: MockTestItem, b: MockTestItem) => 
          new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime()
        );
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  formatTime(timeStr: string): string {
    if (!timeStr) return '—';
    const parts = timeStr.split(':');
    return `${parts[0]}:${parts[1] || '00'}`;
  }

  getMonitorLabel(s: SessionResponse): string {
    if (s.monitorId) {
      return 'Moniteur ' + s.monitorId.substring(0, 8) + '…';
    }
    return '—';
  }

  sessionStatusLabel(status: string): string {
    switch (status) {
      case 'PLANNED': return 'Planifiée';
      case 'COMPLETED': return 'Terminée';
      case 'CANCELLED': return 'Annulée';
      default: return status || '—';
    }
  }

  getTestPercent(test: MockTestItem): number {
    if (!test.totalQuestions) return 0;
    return Math.round((test.score / test.totalQuestions) * 100);
  }

  openPaymentModal() {
    this.paymentForm = { amount: null, mode: 'cash' };
    this.showPaymentModal = true;
  }

  submitPayment() {
    if (!this.myPlan || !this.paymentForm.amount) return;
    this.http.post<PaymentInstallment>(
      `${environment.apiUrl}/student/payment-plans/${this.myPlan.id}/installments`,
      this.paymentForm
    ).subscribe({
      next: (inst) => {
        this.myInstallments.push(inst);
        this.showPaymentModal = false;
        alert('Versement déclaré avec succès. En attente d\'approbation.');
      },
      error: () => alert('Erreur lors de la déclaration du versement.')
    });
  }

  printReceipt(installment: PaymentInstallment): void {
    if (!this.myPlan) return;
    
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
            <div class="value">${this.profile?.firstName} ${this.profile?.lastName}</div>
          </div>
          <div class="row">
            <div class="label">Mode de paiement :</div>
            <div class="value" style="text-transform: capitalize;">${installment.mode}</div>
          </div>
          <div class="row">
            <div class="label">Montant versé :</div>
            <div class="value amount-highlight">${installment.amount.toLocaleString('fr-FR')} DNT</div>
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
