import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ExtendedSessionResponse as Session } from '../../../core/models/session.model';

interface Monitor {
  id: string;
  prenom?: string;
  nom?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  user?: {
    firstName: string;
    lastName: string;
    prenom?: string;
    nom?: string;
  };
}

interface Student {
  id: string;
  name?: string;
  fullName?: string;
  full_name?: string;
  nom?: string;
  prenom?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  user?: {
    firstName?: string;
    lastName?: string;
    prenom?: string;
    nom?: string;
  };
}

@Component({
  selector: 'app-tenant-sessions',
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </div>
          <div>
            <h1 class="page-title">Séances de Conduite</h1>
            <p class="page-subtitle">Gérez le planning des moniteurs et des élèves</p>
          </div>
        </div>
        <button (click)="openModal()" class="btn-primary">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="btn-icon">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Ajouter une séance
        </button>
      </div>

      <!-- KPI Cards -->
      <div class="kpi-row">
        <div class="kpi-card">
          <div class="kpi-icon" style="background: rgba(79,70,229,0.15);">📅</div>
          <div class="kpi-info">
            <span class="kpi-value">{{ sessions.length }}</span>
            <span class="kpi-label">Total séances</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background: rgba(56,189,248,0.15);">🔵</div>
          <div class="kpi-info">
            <span class="kpi-value">{{ getCountByStatus('PLANNED') }}</span>
            <span class="kpi-label">Planifiées</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background: rgba(34,197,94,0.15);">✅</div>
          <div class="kpi-info">
            <span class="kpi-value">{{ getCountByStatus('COMPLETED') }}</span>
            <span class="kpi-label">Terminées</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background: rgba(245,158,11,0.15);">👨‍🏫</div>
          <div class="kpi-info">
            <span class="kpi-value">{{ monitors.length }}</span>
            <span class="kpi-label">Moniteurs</span>
          </div>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="filter-tabs">
        <button class="tab-btn" [class.active]="currentFilter === 'all'" (click)="currentFilter = 'all'">
          Toutes
          <span class="tab-count">{{ sessions.length }}</span>
        </button>
        <button class="tab-btn" [class.active]="currentFilter === 'PLANNED'" (click)="currentFilter = 'PLANNED'">
          Planifiées
          <span class="tab-count">{{ getCountByStatus('PLANNED') }}</span>
        </button>
        <button class="tab-btn" [class.active]="currentFilter === 'COMPLETED'" (click)="currentFilter = 'COMPLETED'">
          Terminées
          <span class="tab-count">{{ getCountByStatus('COMPLETED') }}</span>
        </button>
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Chargement des séances...</p>
      </div>

      <!-- Sessions Timeline -->
      <div *ngIf="!isLoading && filteredSessions.length > 0" class="sessions-list">
        <div *ngFor="let s of filteredSessions; let i = index" class="session-card" [style.animation-delay]="(i * 0.05) + 's'">
          <div class="session-time-col">
            <div class="time-badge">
              <span class="time-main">{{ s.startTime.substring(0,5) || '—' }}</span>
              <span class="time-sep">→</span>
              <span class="time-main">{{ s.endTime.substring(0,5) || '—' }}</span>
            </div>
            <div class="date-badge">{{ s.sessionDate }}</div>
          </div>
          <div class="session-connector">
            <div class="connector-dot" [class.completed]="s.status === 'COMPLETED'"></div>
            <div class="connector-line"></div>
          </div>
          <div class="session-content">
            <div class="session-row-top">
              <div class="session-monitor">
                <div class="avatar-sm avatar-amber">
                  {{ (s.monitorName || s.monitorId || 'M').charAt(0) }}
                </div>
                <div>
                  <span class="label-small">Moniteur</span>
                  <span class="name-text">{{ s.monitorName || 'Moniteur ' + (s.monitorId?.substring(0, 6) || '') }}</span>
                </div>
              </div>
              <span class="status-badge" [class.status-completed]="s.status === 'COMPLETED'" [class.status-planned]="s.status !== 'COMPLETED'">
                {{ s.status === 'COMPLETED' ? '✓ Terminée' : '◉ Planifiée' }}
              </span>
            </div>
            <div class="session-students">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="students-icon">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
              <span *ngFor="let student of s.studentNames; let last = last" class="student-name">
                {{ student || 'Élève' }}{{ !last ? ', ' : '' }}
              </span>
              <span *ngIf="!s.studentNames || s.studentNames.length === 0" class="student-name">Aucun élève assigné</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div *ngIf="!isLoading && filteredSessions.length === 0" class="empty-container">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="empty-icon">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
        <p>Aucune séance trouvée.</p>
      </div>

      <!-- Modal -->
      <div *ngIf="isModalOpen" class="modal-overlay" (click)="closeModal()">
        <div class="modal-container" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-header-left">
              <div class="modal-icon">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3>Ajouter une séance</h3>
            </div>
            <button (click)="closeModal()" class="modal-close">&times;</button>
          </div>
          <form (ngSubmit)="onSubmit()" #sessionForm="ngForm" class="modal-body">
            <div class="form-row">
              <div class="form-group">
                <label>Date</label>
                <input type="date" name="sessionDate" [(ngModel)]="newSession.sessionDate" required
                       class="form-input" [min]="today" />
              </div>
              <div class="form-group-row">
                <div class="form-group">
                  <label>Début</label>
                  <input type="time" name="startTime" [(ngModel)]="newSession.startTime" required class="form-input" />
                </div>
                <div class="form-group">
                  <label>Fin</label>
                  <input type="time" name="endTime" [(ngModel)]="newSession.endTime" required class="form-input" />
                </div>
              </div>
            </div>
            <div class="form-group">
              <label>Moniteur</label>
              <select name="monitorId" [(ngModel)]="newSession.monitorId" required class="form-input">
                <option value="" disabled>Sélectionner un moniteur</option>
                <option *ngFor="let m of monitors" [value]="m.id">
                  {{ getMonitorDisplayName(m) }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Élèves</label>
              <div class="student-checklist">
                <div *ngIf="students.length === 0" class="no-students-msg">Aucun élève disponible</div>
                <label *ngFor="let s of students" class="student-check-item" [class.checked]="isStudentSelected(s.id)">
                  <input type="checkbox" [checked]="isStudentSelected(s.id)" (change)="toggleStudent(s.id)" />
                  <span class="check-avatar">{{ getStudentDisplayName(s).charAt(0) }}</span>
                  <span class="check-name">{{ getStudentDisplayName(s) }}</span>
                </label>
              </div>
            </div>
            <div class="modal-actions">
              <button type="button" (click)="closeModal()" class="btn-ghost">Annuler</button>
              <button type="submit" [disabled]="!sessionForm.form.valid || isSubmitting || selectedStudentIds.length === 0" class="btn-primary">
                <span *ngIf="!isSubmitting">Créer la séance</span>
                <span *ngIf="isSubmitting" class="btn-loading">
                  <div class="spinner-sm"></div>
                  Création...
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

    @keyframes slideIn {
      from { opacity: 0; transform: translateX(-12px); }
      to { opacity: 1; transform: translateX(0); }
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
      background: linear-gradient(135deg, #4f46e5, #8b5cf6);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 20px rgba(79, 70, 229, 0.3);
    }

    .header-icon svg { width: 26px; height: 26px; color: white; }

    .page-title {
      font-size: 1.75rem;
      font-weight: 800;
      margin: 0;
      background: linear-gradient(135deg, #ffffff 0%, #c4b5fd 100%);
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

    /* Filter Tabs */
    .filter-tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      background: rgba(255, 255, 255, 0.04);
      border-radius: 14px;
      padding: 0.35rem;
      border: 1px solid rgba(255, 255, 255, 0.08);
      width: fit-content;
    }

    .tab-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 1.25rem;
      border: none;
      border-radius: 11px;
      background: transparent;
      color: rgba(255, 255, 255, 0.55);
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.25s ease;
      font-family: inherit;
    }

    .tab-btn:hover { color: rgba(255, 255, 255, 0.8); }

    .tab-btn.active {
      background: rgba(79, 70, 229, 0.2);
      color: #a78bfa;
      box-shadow: 0 2px 8px rgba(79, 70, 229, 0.15);
    }

    .tab-count {
      font-size: 0.7rem;
      padding: 0.1rem 0.5rem;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.6);
      font-weight: 700;
    }

    .tab-btn.active .tab-count {
      background: rgba(79, 70, 229, 0.3);
      color: #c4b5fd;
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
      border-top-color: #4f46e5;
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

    /* Sessions Timeline List */
    .sessions-list {
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    .session-card {
      display: grid;
      grid-template-columns: 140px 40px 1fr;
      gap: 0;
      animation: slideIn 0.4s ease-out both;
    }

    .session-time-col {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      padding: 1.25rem 0;
      gap: 0.35rem;
    }

    .time-badge {
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    .time-main {
      font-size: 0.95rem;
      font-weight: 700;
      color: white;
    }

    .time-sep {
      color: rgba(255, 255, 255, 0.3);
      font-size: 0.8rem;
    }

    .date-badge {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.45);
      font-weight: 500;
    }

    /* Connector */
    .session-connector {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-top: 1.5rem;
    }

    .connector-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: rgba(79, 70, 229, 0.4);
      border: 2px solid rgba(79, 70, 229, 0.8);
      flex-shrink: 0;
      z-index: 1;
    }

    .connector-dot.completed {
      background: rgba(34, 197, 94, 0.4);
      border-color: #22c55e;
      box-shadow: 0 0 8px rgba(34, 197, 94, 0.3);
    }

    .connector-line {
      width: 2px;
      flex: 1;
      background: rgba(255, 255, 255, 0.08);
    }

    /* Session Content */
    .session-content {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 1.25rem 1.5rem;
      margin: 0.5rem 0 0.5rem 0.75rem;
      transition: all 0.3s ease;
    }

    .session-content:hover {
      background: rgba(255, 255, 255, 0.07);
      border-color: rgba(79, 70, 229, 0.2);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    }

    .session-row-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.75rem;
    }

    .session-monitor {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .avatar-sm {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 700;
      color: white;
      flex-shrink: 0;
    }

    .avatar-amber {
      background: linear-gradient(135deg, #f59e0b, #ef4444);
      box-shadow: 0 4px 10px rgba(245, 158, 11, 0.25);
    }

    .label-small {
      display: block;
      font-size: 0.7rem;
      color: rgba(255, 255, 255, 0.4);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .name-text {
      display: block;
      font-size: 0.9rem;
      font-weight: 600;
      color: white;
    }

    /* Status Badge */
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.35rem 0.9rem;
      border-radius: 20px;
      font-size: 0.78rem;
      font-weight: 600;
    }

    .status-completed {
      background: rgba(34, 197, 94, 0.15);
      color: #4ade80;
      border: 1px solid rgba(34, 197, 94, 0.2);
    }

    .status-planned {
      background: rgba(56, 189, 248, 0.15);
      color: #38bdf8;
      border: 1px solid rgba(56, 189, 248, 0.2);
    }

    /* Students row */
    .session-students {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding-top: 0.65rem;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }

    .students-icon {
      width: 16px;
      height: 16px;
      color: rgba(255, 255, 255, 0.3);
      flex-shrink: 0;
    }

    .student-name {
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.6);
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
      background: linear-gradient(135deg, #4f46e5, #8b5cf6);
      border: none;
      border-radius: 14px;
      color: white;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 6px 20px rgba(79, 70, 229, 0.3);
      font-family: inherit;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px) scale(1.03);
      box-shadow: 0 10px 30px rgba(79, 70, 229, 0.4);
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
      max-width: 520px;
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
      background: linear-gradient(135deg, #4f46e5, #8b5cf6);
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

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-group-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }

    .form-group { margin-bottom: 1.25rem; }

    .student-checklist {
      max-height: 200px;
      overflow-y: auto;
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .student-checklist::-webkit-scrollbar {
      width: 6px;
    }

    .student-checklist::-webkit-scrollbar-track {
      background: transparent;
    }

    .student-checklist::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.15);
      border-radius: 3px;
    }

    .no-students-msg {
      padding: 1rem;
      text-align: center;
      color: rgba(255, 255, 255, 0.4);
      font-size: 0.85rem;
    }

    .student-check-item {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      padding: 0.55rem 0.75rem;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 1px solid transparent;
    }

    .student-check-item:hover {
      background: rgba(255, 255, 255, 0.06);
    }

    .student-check-item.checked {
      background: rgba(79, 70, 229, 0.12);
      border-color: rgba(79, 70, 229, 0.3);
    }

    .student-check-item input[type="checkbox"] {
      display: none;
    }

    .check-avatar {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
      font-weight: 700;
      color: white;
      flex-shrink: 0;
    }

    .student-check-item.checked .check-avatar {
      background: linear-gradient(135deg, #22c55e, #16a34a);
      box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
    }

    .check-name {
      font-size: 0.85rem;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.7);
    }

    .student-check-item.checked .check-name {
      color: white;
    }

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
      border-color: rgba(79, 70, 229, 0.5);
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
    }

    .form-input option { background: #1e293b; color: white; }

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
      .session-card { grid-template-columns: 1fr; }
      .session-time-col { align-items: flex-start; flex-direction: row; gap: 0.75rem; padding: 0.75rem 0 0; }
      .session-connector { display: none; }
      .session-content { margin-left: 0; }
      .form-row { grid-template-columns: 1fr; }
    }
  `]
})
export class SessionsComponent implements OnInit {
  sessions: Session[] = [];
  students: Student[] = [];
  monitors: Monitor[] = [];
  isLoading = true;
  currentFilter = 'all';

  isModalOpen = false;
  isSubmitting = false;
  today = new Date().toISOString().split('T')[0];

  selectedStudentIds: string[] = [];

  newSession = {
    monitorId: '',
    sessionDate: '',
    startTime: '08:00',
    endTime: '10:00'
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadData();
  }

  get filteredSessions(): Session[] {
    if (this.currentFilter === 'all') return this.sessions;
    return this.sessions.filter(s => s.status === this.currentFilter);
  }

  getCountByStatus(status: string): number {
    return this.sessions.filter(s => s.status === status).length;
  }

  loadData() {
    this.isLoading = true;

    forkJoin({
      sessions: this.http.get<Session[]>(`${environment.apiUrl}/sessions`),
      students: this.http.get<Student[]>(`${environment.apiUrl}/admin/students`),
      monitors: this.http.get<Monitor[]>(`${environment.apiUrl}/admin/monitors`)
    }).subscribe({
      next: ({ sessions, students, monitors }) => {
        this.students = students;
        this.monitors = monitors;
        this.sessions = sessions
          .map((session) => this.enrichSession(session))
          .sort((a,b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime());
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load tenant session data', err);
        this.isLoading = false;
      }
    });
  }

  private enrichSession(session: Session): Session {
    const monitor = this.monitors.find((m) => m.id === session.monitorId);
    const monitorName = monitor ? this.getMonitorDisplayName(monitor) : undefined;
    const studentNames = (session.studentIds || []).map((id) => {
      const student = this.students.find((s) => s.id === id);
      return student ? this.getStudentDisplayName(student) : id.substring(0, 8);
    });

    return {
      ...session,
      monitorName: monitorName,
      studentNames: studentNames.filter(Boolean)
    };
  }

  openModal() {
    this.newSession = {
      monitorId: '',
      sessionDate: this.today,
      startTime: '08:00',
      endTime: '10:00'
    };
    this.selectedStudentIds = [];
    this.isModalOpen = true;
  }

  isStudentSelected(studentId: string): boolean {
    return this.selectedStudentIds.includes(studentId);
  }

  toggleStudent(studentId: string): void {
    const idx = this.selectedStudentIds.indexOf(studentId);
    if (idx >= 0) {
      this.selectedStudentIds.splice(idx, 1);
    } else {
      this.selectedStudentIds.push(studentId);
    }
  }

  closeModal() {
    this.isModalOpen = false;
  }

  private formatTimeForApi(time: string): string {
    if (!time) return '00:00:00';
    const parts = time.split(':');
    if (parts.length === 2) return `${parts[0]}:${parts[1]}:00`;
    if (parts.length >= 3) return `${parts[0]}:${parts[1]}:${parts[2].substring(0, 2)}`;
    return time;
  }

  onSubmit() {
    if (!this.newSession.monitorId || this.selectedStudentIds.length === 0 || !this.newSession.sessionDate) return;
    this.isSubmitting = true;

    const payload = {
      monitorId: this.newSession.monitorId,
      sessionDate: this.newSession.sessionDate,
      startTime: this.formatTimeForApi(this.newSession.startTime),
      endTime: this.formatTimeForApi(this.newSession.endTime),
      studentIds: this.selectedStudentIds
    };

    this.http.post<any>(`${environment.apiUrl}/sessions`, payload).subscribe({
      next: (createdSession) => {
        // After session creation, verify students are assigned.
        // If the backend response shows missing students, assign them individually.
        const createdId = createdSession?.id;
        const returnedStudentIds: string[] = createdSession?.studentIds || [];
        const missingStudents = this.selectedStudentIds.filter(
          (sid) => !returnedStudentIds.includes(sid)
        );

        if (createdId && missingStudents.length > 0) {
          // Call POST /sessions/{id}/students/{studentId} for each missing student
          const assignCalls = missingStudents.map((studentId) =>
            this.http.post(`${environment.apiUrl}/sessions/${createdId}/students/${studentId}`, {})
          );
          forkJoin(assignCalls).subscribe({
            next: () => {
              this.isSubmitting = false;
              this.closeModal();
              this.loadData();
            },
            error: (err) => {
              console.error('Error assigning students to session', err);
              this.isSubmitting = false;
              this.closeModal();
              this.loadData();
            }
          });
        } else {
          this.isSubmitting = false;
          this.closeModal();
          this.loadData();
        }
      },
      error: (err) => {
        console.error('Error creating session', err);
        this.isSubmitting = false;
      }
    });
  }

  getMonitorDisplayName(monitor: Monitor): string {
    if (!monitor) {
      return 'Moniteur inconnu';
    }

    // Try root level properties first (English)
    if (monitor.firstName || monitor.lastName) {
      const fullName = `${monitor.firstName || ''} ${monitor.lastName || ''}`.trim();
      if (fullName) return fullName;
    }

    // Try root level properties (French)
    if (monitor.prenom || monitor.nom) {
      const fullName = `${monitor.prenom || ''} ${monitor.nom || ''}`.trim();
      if (fullName) return fullName;
    }

    // Try nested user object
    if (monitor.user) {
      if (monitor.user.firstName || monitor.user.lastName) {
        const fullName = `${monitor.user.firstName || ''} ${monitor.user.lastName || ''}`.trim();
        if (fullName) return fullName;
      }
      if (monitor.user.prenom || monitor.user.nom) {
        const fullName = `${monitor.user.prenom || ''} ${monitor.user.nom || ''}`.trim();
        if (fullName) return fullName;
      }
    }

    return 'Moniteur sans nom';
  }

  getStudentDisplayName(student: Student): string {
    if (!student) {
      return 'Élève inconnu';
    }

    // Try root level fullName/full_name properties
    if (student.fullName) return student.fullName;
    if (student.full_name) return student.full_name;
    if (student.name) return student.name;

    // Try root level properties (English)
    if (student.firstName || student.lastName) {
      const fullName = `${student.firstName || ''} ${student.lastName || ''}`.trim();
      if (fullName) return fullName;
    }

    // Try root level properties (French)
    if (student.prenom || student.nom) {
      const fullName = `${student.prenom || ''} ${student.nom || ''}`.trim();
      if (fullName) return fullName;
    }

    // Try nested user object
    if (student.user) {
      if (student.user.firstName || student.user.lastName) {
        const fullName = `${student.user.firstName || ''} ${student.user.lastName || ''}`.trim();
        if (fullName) return fullName;
      }
      if (student.user.prenom || student.user.nom) {
        const fullName = `${student.user.prenom || ''} ${student.user.nom || ''}`.trim();
        if (fullName) return fullName;
      }
    }

    return 'Élève sans nom';
  }
}
