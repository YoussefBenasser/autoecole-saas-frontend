import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SessionResponse } from '../../../core/models/session.model';

interface ExamItem {
  id: string;
  date: string;
  type: string;
  status: string;
  result?: string;
  score?: number;
}

interface PaymentItem {
  id: number;
  amount: number;
  date: string;
  status?: string;
  studentName?: string;
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
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <div *ngIf="isLoading" class="flex justify-center py-20">
        <svg class="w-8 h-8 animate-spin" style="color: var(--color-accent)" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      </div>

      <div *ngIf="!isLoading" class="dashboard-content">
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
                  {{ nextExam.type?.toLowerCase() === 'driving' ? 'Examen Pratique' : 'Examen Théorique (Code)' }}
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
        <div *ngIf="payments.length > 0" class="payments-section">
          <div class="payments-header">
            <div class="header-left">
              <div class="payments-icon">💳</div>
              <h2 class="payments-title">Mes Paiements</h2>
            </div>
            <span class="payments-badge">
              {{ payments.length }} transaction(s)
            </span>
          </div>
          
          <div class="payments-table-wrapper">
            <table class="payments-table">
              <thead>
                <tr>
                  <th>Montant</th>
                  <th>Date</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let p of payments" class="payment-row">
                  <td class="amount-cell">{{ p.amount | number }} DZD</td>
                  <td class="date-cell">{{ p.date | date:'dd/MM/yyyy' }}</td>
                  <td class="status-cell">
                    <span class="status-badge"
                          [ngClass]="p.status === 'PAID' ? 'status-paid' : 'status-pending'">
                      {{ p.status === 'PAID' ? '✓ Payé' : '⏳ En attente' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
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
  `]
})
export class DashboardComponent implements OnInit {
  profile: any = null;
  studentId: string | null = null;
  sessions: SessionResponse[] = [];
  nextSession: SessionResponse | null = null;
  nextExam: ExamItem | null = null;
  sessionsCount = 0;
  payments: PaymentItem[] = [];
  mockTests: MockTestItem[] = [];
  isLoading = true;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/profile/me`).subscribe({
      next: (profile) => {
        this.profile = profile;
        this.studentId = profile.studentId || null;
        if (profile.studentId) {
          this.loadStudentData(profile.studentId);
        } else {
          this.isLoading = false;
        }
      },
      error: () => this.isLoading = false
    });
  }

  loadStudentData(studentId: string) {
    forkJoin({
      sessions: this.http.get<SessionResponse[]>(`${environment.apiUrl}/student/sessions?studentId=${studentId}`).pipe(catchError(() => of([]))),
      exams: this.http.get<ExamItem[]>(`${environment.apiUrl}/exams/student/${studentId}`).pipe(catchError(() => of([]))),
      payments: this.http.get<PaymentItem[]>(`${environment.apiUrl}/student/payments?studentId=${studentId}`).pipe(catchError(() => of([]))),
      mockTests: this.http.get<MockTestItem[]>(`${environment.apiUrl}/student/mock-tests/student/${studentId}`).pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ sessions, exams, payments, mockTests }) => {
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

        this.payments = payments;
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
}
