import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { ExamResponse as Exam } from '../../../core/models/exam.model';

interface Student {
  id: string;
  user?: {
    firstName: string;
    lastName: string;
  };
}

@Component({
  selector: 'app-exams',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-wrapper">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-left">
          <div class="header-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
            </svg>
          </div>
          <div>
            <h1 class="page-title">Examens</h1>
            <p class="page-subtitle">Planification et suivi des examens de conduite et code</p>
          </div>
        </div>
        <button (click)="openModal()" class="btn-primary">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="btn-icon">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Planifier un examen
        </button>
      </div>

      <!-- KPI Cards -->
      <div class="kpi-row">
        <div class="kpi-card">
          <div class="kpi-icon" style="background: rgba(245,158,11,0.15);">📋</div>
          <div class="kpi-info">
            <span class="kpi-value">{{ exams.length }}</span>
            <span class="kpi-label">Total examens</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background: rgba(34,197,94,0.15);">🏆</div>
          <div class="kpi-info">
            <span class="kpi-value">{{ getCountByResult('PASSED') }}</span>
            <span class="kpi-label">Réussis</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background: rgba(239,68,68,0.15);">❌</div>
          <div class="kpi-info">
            <span class="kpi-value">{{ getCountByResult('FAILED') }}</span>
            <span class="kpi-label">Échoués</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background: rgba(56,189,248,0.15);">⏳</div>
          <div class="kpi-info">
            <span class="kpi-value">{{ getPendingCount() }}</span>
            <span class="kpi-label">En attente</span>
          </div>
        </div>
      </div>

      <!-- Pass Rate Progress -->
      <div class="progress-section" *ngIf="exams.length > 0">
        <div class="progress-header">
          <span class="progress-label">Taux de réussite global</span>
          <span class="progress-value" [style.color]="passRate >= 50 ? '#4ade80' : '#fca5a5'">{{ passRate }}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" [style.width]="passRate + '%'" [class.fill-success]="passRate >= 50" [class.fill-danger]="passRate < 50"></div>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="filter-tabs">
        <button class="tab-btn" [class.active]="currentFilter === 'all'" (click)="currentFilter = 'all'">
          Tous <span class="tab-count">{{ exams.length }}</span>
        </button>
        <button class="tab-btn" [class.active]="currentFilter === 'code'" (click)="currentFilter = 'code'">
          Code <span class="tab-count">{{ getCountByType('code') }}</span>
        </button>
        <button class="tab-btn" [class.active]="currentFilter === 'driving'" (click)="currentFilter = 'driving'">
          Conduite <span class="tab-count">{{ getCountByType('driving') }}</span>
        </button>
        <button class="tab-btn" [class.active]="currentFilter === 'passed'" (click)="currentFilter = 'passed'">
          Réussis <span class="tab-count">{{ getCountByResult('PASSED') }}</span>
        </button>
        <button class="tab-btn" [class.active]="currentFilter === 'failed'" (click)="currentFilter = 'failed'">
          Échoués <span class="tab-count">{{ getCountByResult('FAILED') }}</span>
        </button>
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Chargement des examens...</p>
      </div>

      <!-- Exam Cards -->
      <div *ngIf="!isLoading && filteredExams.length > 0" class="exams-grid">
        <div *ngFor="let e of filteredExams; let i = index" class="exam-card" [style.animation-delay]="(i * 0.05) + 's'">
          <div class="exam-card-top">
            <span class="type-badge" [class.type-code]="e.type === 'code'" [class.type-driving]="e.type === 'driving'">
              <span class="type-emoji">{{ e.type === 'code' ? '📝' : '🚗' }}</span>
              {{ e.type === 'code' ? 'Code' : 'Conduite' }}
            </span>
            <span class="result-badge"
                  [class.result-passed]="e.result === 'PASSED'"
                  [class.result-failed]="e.result === 'FAILED'"
                  [class.result-pending]="!e.result">
              {{ e.result === 'PASSED' ? '✓ Reçu' : e.result === 'FAILED' ? '✗ Échoué' : '◉ ' + (e.status || 'En attente') }}
            </span>
          </div>
          <div class="exam-student">
            <div class="avatar-sm avatar-amber">
              {{ getStudentInitials(e.studentId) }}
            </div>
            <div>
              <span class="student-label">Candidat</span>
              <span class="student-name">{{ getStudentLabel(e.studentId) }}</span>
            </div>
          </div>
          <div class="exam-date-row">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="date-icon">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <span>{{ e.date | date:'dd MMMM yyyy' }}</span>
          </div>
          <div class="exam-score" *ngIf="e.score !== undefined && e.score !== null">
            <span class="score-label">Score</span>
            <span class="score-value">{{ e.score }}/40</span>
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div *ngIf="!isLoading && filteredExams.length === 0" class="empty-container">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="empty-icon">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
        </svg>
        <p>Aucun examen trouvé.</p>
      </div>

      <!-- Modal -->
      <div *ngIf="isModalOpen" class="modal-overlay" (click)="closeModal()">
        <div class="modal-container" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-header-left">
              <div class="modal-icon">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                </svg>
              </div>
              <h3>Planifier un examen</h3>
            </div>
            <button (click)="closeModal()" class="modal-close">&times;</button>
          </div>
          <form (ngSubmit)="onSubmit()" #examForm="ngForm" class="modal-body">
            <div class="form-group">
              <label>Élève</label>
              <select name="studentId" [(ngModel)]="newExam.studentId" required class="form-input">
                <option value="" disabled selected>Sélectionner un élève</option>
                <option *ngFor="let student of allStudents" [value]="student.id">
                  {{ student.user?.firstName }} {{ student.user?.lastName }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Type d'examen</label>
              <div class="type-selector">
                <button type="button" class="type-option" [class.selected]="newExam.type === 'code'" (click)="newExam.type = 'code'">
                  <span class="type-option-emoji">📝</span>
                  <span>Code de la route</span>
                </button>
                <button type="button" class="type-option" [class.selected]="newExam.type === 'driving'" (click)="newExam.type = 'driving'">
                  <span class="type-option-emoji">🚗</span>
                  <span>Conduite pratique</span>
                </button>
              </div>
            </div>
            <div class="form-group">
              <label>Date prévue</label>
              <input type="date" name="date" [(ngModel)]="newExam.date" required class="form-input" />
            </div>
            <div class="modal-actions">
              <button type="button" (click)="closeModal()" class="btn-ghost">Annuler</button>
              <button type="submit" [disabled]="!examForm.form.valid || isSubmitting || !newExam.type" class="btn-primary">
                <span *ngIf="!isSubmitting">Planifier</span>
                <span *ngIf="isSubmitting" class="btn-loading">
                  <div class="spinner-sm"></div>
                  Progression...
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .page-wrapper {
      animation: fadeIn 0.5s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes cardIn {
      from { opacity: 0; transform: translateY(16px) scale(0.97); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* Page Header */
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2rem;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .header-icon {
      width: 52px;
      height: 52px;
      border-radius: 16px;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 20px rgba(245, 158, 11, 0.3);
    }

    .header-icon svg { width: 26px; height: 26px; color: white; }

    .page-title {
      font-size: 1.75rem;
      font-weight: 800;
      margin: 0;
      background: linear-gradient(135deg, #ffffff 0%, #fde68a 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .page-subtitle {
      margin: 0.25rem 0 0 0;
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.9rem;
    }

    /* KPI Row */
    .kpi-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .kpi-card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: all 0.3s ease;
    }

    .kpi-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
      border-color: rgba(255, 255, 255, 0.18);
    }

    .kpi-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.3rem;
      flex-shrink: 0;
    }

    .kpi-info { display: flex; flex-direction: column; }
    .kpi-value { font-size: 1.5rem; font-weight: 800; color: #ffffff; }
    .kpi-label { font-size: 0.8rem; color: rgba(255, 255, 255, 0.55); font-weight: 500; }

    /* Progress Bar */
    .progress-section {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 1.25rem 1.5rem;
      margin-bottom: 1.5rem;
    }

    .progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.6rem;
    }

    .progress-label {
      font-size: 0.9rem;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.7);
    }

    .progress-value {
      font-size: 1.1rem;
      font-weight: 800;
    }

    .progress-track {
      width: 100%;
      height: 8px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      border-radius: 10px;
      transition: width 0.8s ease-out;
    }

    .fill-success {
      background: linear-gradient(90deg, #22c55e, #4ade80);
    }

    .fill-danger {
      background: linear-gradient(90deg, #ef4444, #fca5a5);
    }

    /* Filter Tabs */
    .filter-tabs {
      display: flex;
      gap: 0.35rem;
      margin-bottom: 1.5rem;
      background: rgba(255, 255, 255, 0.04);
      border-radius: 14px;
      padding: 0.35rem;
      border: 1px solid rgba(255, 255, 255, 0.08);
      overflow-x: auto;
    }

    .tab-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.55rem 1rem;
      border: none;
      border-radius: 11px;
      background: transparent;
      color: rgba(255, 255, 255, 0.55);
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.25s ease;
      font-family: inherit;
      white-space: nowrap;
    }

    .tab-btn:hover { color: rgba(255, 255, 255, 0.8); }

    .tab-btn.active {
      background: rgba(245, 158, 11, 0.2);
      color: #fbbf24;
      box-shadow: 0 2px 8px rgba(245, 158, 11, 0.15);
    }

    .tab-count {
      font-size: 0.68rem;
      padding: 0.1rem 0.45rem;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.6);
      font-weight: 700;
    }

    .tab-btn.active .tab-count {
      background: rgba(245, 158, 11, 0.3);
      color: #fde68a;
    }

    /* Loading */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 4rem 0;
      color: rgba(255, 255, 255, 0.5);
    }

    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid rgba(255, 255, 255, 0.1);
      border-top-color: #f59e0b;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .spinner-sm {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    /* Exams Grid */
    .exams-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.25rem;
    }

    .exam-card {
      background: rgba(255, 255, 255, 0.04);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 1.5rem;
      transition: all 0.3s ease;
      animation: cardIn 0.5s ease-out both;
    }

    .exam-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3), 0 0 30px rgba(245, 158, 11, 0.06);
      border-color: rgba(245, 158, 11, 0.2);
    }

    .exam-card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
    }

    .type-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.3rem 0.75rem;
      border-radius: 20px;
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
    }

    .type-emoji { font-size: 0.9rem; }

    .type-code {
      background: rgba(245, 158, 11, 0.15);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.2);
    }

    .type-driving {
      background: rgba(79, 70, 229, 0.15);
      color: #a78bfa;
      border: 1px solid rgba(79, 70, 229, 0.2);
    }

    .result-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.3rem 0.75rem;
      border-radius: 20px;
      font-size: 0.78rem;
      font-weight: 600;
    }

    .result-passed {
      background: rgba(34, 197, 94, 0.15);
      color: #4ade80;
      border: 1px solid rgba(34, 197, 94, 0.2);
    }

    .result-failed {
      background: rgba(239, 68, 68, 0.15);
      color: #fca5a5;
      border: 1px solid rgba(239, 68, 68, 0.2);
    }

    .result-pending {
      background: rgba(56, 189, 248, 0.15);
      color: #7dd3fc;
      border: 1px solid rgba(56, 189, 248, 0.2);
    }

    .exam-student {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .avatar-sm {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: 700;
      color: white;
      flex-shrink: 0;
    }

    .avatar-amber {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      box-shadow: 0 4px 10px rgba(245, 158, 11, 0.25);
    }

    .student-label {
      display: block;
      font-size: 0.7rem;
      color: rgba(255, 255, 255, 0.4);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .student-name {
      display: block;
      font-size: 0.95rem;
      font-weight: 600;
      color: white;
    }

    .exam-date-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: rgba(255, 255, 255, 0.55);
      font-size: 0.85rem;
      padding-top: 0.75rem;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }

    .date-icon {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
      color: rgba(255, 255, 255, 0.35);
    }

    .exam-score {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 0.75rem;
      padding: 0.6rem 0.85rem;
      background: rgba(255, 255, 255, 0.04);
      border-radius: 10px;
    }

    .score-label {
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.5);
      font-weight: 600;
    }

    .score-value {
      font-size: 1rem;
      font-weight: 800;
      color: #fbbf24;
    }

    /* Empty */
    .empty-container {
      text-align: center;
      padding: 4rem 2rem;
      color: rgba(255, 255, 255, 0.4);
    }

    .empty-icon {
      width: 56px;
      height: 56px;
      margin: 0 auto 1rem;
      color: rgba(255, 255, 255, 0.2);
    }

    /* Buttons */
    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      border: none;
      border-radius: 14px;
      color: white;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 6px 20px rgba(245, 158, 11, 0.3);
      font-family: inherit;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px) scale(1.03);
      box-shadow: 0 10px 30px rgba(245, 158, 11, 0.4);
    }

    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-icon { width: 18px; height: 18px; }

    .btn-ghost {
      padding: 0.75rem 1.25rem;
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 14px;
      color: rgba(255, 255, 255, 0.7);
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
    }

    .btn-ghost:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.25);
    }

    .btn-loading {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    /* Modal */
    .modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(8px);
      animation: fadeIn 0.2s ease-out;
    }

    .modal-container {
      width: 100%;
      max-width: 480px;
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.98), rgba(15, 23, 42, 0.98));
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
      animation: modalIn 0.3s ease-out;
    }

    @keyframes modalIn {
      from { opacity: 0; transform: scale(0.95) translateY(20px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.5rem 1.75rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.03);
    }

    .modal-header-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .modal-header h3 { margin: 0; font-size: 1.15rem; font-weight: 700; color: white; }

    .modal-icon {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .modal-icon svg { width: 20px; height: 20px; color: white; }

    .modal-close {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      color: rgba(255, 255, 255, 0.6);
      font-size: 1.3rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .modal-close:hover { background: rgba(255, 255, 255, 0.12); color: white; }

    .modal-body { padding: 1.75rem; }

    .form-group { margin-bottom: 1.25rem; }

    .form-group label {
      display: block;
      font-size: 0.85rem;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.65);
      margin-bottom: 0.5rem;
    }

    .form-input {
      width: 100%;
      padding: 0.75rem 1rem;
      background: rgba(0, 0, 0, 0.25);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      color: white;
      font-size: 0.9rem;
      outline: none;
      transition: all 0.3s ease;
      font-family: inherit;
    }

    .form-input::placeholder { color: rgba(255, 255, 255, 0.3); }

    .form-input:focus {
      border-color: rgba(245, 158, 11, 0.5);
      box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.12);
    }

    .form-input option { background: #1e293b; color: white; }

    /* Type Selector */
    .type-selector {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }

    .type-option {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.35rem;
      padding: 1rem;
      background: rgba(0, 0, 0, 0.2);
      border: 2px solid rgba(255, 255, 255, 0.1);
      border-radius: 14px;
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.25s ease;
      font-family: inherit;
    }

    .type-option:hover {
      border-color: rgba(255, 255, 255, 0.2);
      background: rgba(255, 255, 255, 0.05);
    }

    .type-option.selected {
      border-color: rgba(245, 158, 11, 0.6);
      background: rgba(245, 158, 11, 0.1);
      color: #fbbf24;
    }

    .type-option-emoji { font-size: 1.5rem; }

    .modal-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
      margin-top: 1.75rem;
      padding-top: 1.25rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

    @media (max-width: 768px) {
      .page-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
      .kpi-row { grid-template-columns: repeat(2, 1fr); }
      .exams-grid { grid-template-columns: 1fr; }
      .filter-tabs { overflow-x: auto; }
    }
  `]
})
export class ExamsComponent implements OnInit {
  exams: Exam[] = [];
  allStudents: Student[] = [];
  isLoading = true;
  currentFilter = 'all';

  isModalOpen = false;
  isSubmitting = false;
  newExam = { studentId: '', type: '', date: '' };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadStudents();
    this.loadExams();
  }

  get filteredExams(): Exam[] {
    switch (this.currentFilter) {
      case 'code': return this.exams.filter(e => e.type === 'code');
      case 'driving': return this.exams.filter(e => e.type === 'driving');
      case 'passed': return this.exams.filter(e => e.result === 'PASSED');
      case 'failed': return this.exams.filter(e => e.result === 'FAILED');
      default: return this.exams;
    }
  }

  get passRate(): number {
    const withResult = this.exams.filter(e => e.result);
    if (withResult.length === 0) return 0;
    const passed = withResult.filter(e => e.result === 'PASSED').length;
    return Math.round((passed / withResult.length) * 100);
  }

  getCountByResult(result: string): number {
    return this.exams.filter(e => e.result === result).length;
  }

  getCountByType(type: string): number {
    return this.exams.filter(e => e.type === type).length;
  }

  getPendingCount(): number {
    return this.exams.filter(e => !e.result).length;
  }

  loadExams() {
    this.isLoading = true;
    this.http.get<Exam[]>(`${environment.apiUrl}/exams/upcoming`).subscribe({
      next: (data) => { this.exams = data; this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }

  loadStudents() {
    this.http.get<Student[]>(`${environment.apiUrl}/admin/students`).subscribe({
      next: (data) => this.allStudents = data,
      error: (err) => console.error('Failed to load students', err)
    });
  }

  openModal() {
    this.newExam = { studentId: '', type: '', date: '' };
    if (!this.allStudents.length) {
      this.loadStudents();
    }
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  onSubmit() {
    if (!this.newExam.studentId || !this.newExam.type || !this.newExam.date) return;
    this.isSubmitting = true;
    this.http.post(`${environment.apiUrl}/exams/register`, this.newExam).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.closeModal();
        this.loadExams();
      },
      error: (err) => {
        console.error('Error scheduling exam', err);
        this.isSubmitting = false;
      }
    });
  }

  getStudentLabel(studentId: string): string {
    const student = this.allStudents.find((item) => item.id === studentId);
    if (!student) {
      return `Candidat ${studentId.slice(0, 6)}`;
    }
    const name = `${student.user?.firstName || ''} ${student.user?.lastName || ''}`.trim();
    return name || `Candidat ${student.id.slice(0, 6)}`;
  }

  getStudentInitials(studentId: string): string {
    const student = this.allStudents.find((item) => item.id === studentId);
    if (!student) return studentId.charAt(0).toUpperCase();
    return ((student.user?.firstName?.charAt(0) || '') + (student.user?.lastName?.charAt(0) || '')).toUpperCase() || studentId.charAt(0).toUpperCase();
  }
}
