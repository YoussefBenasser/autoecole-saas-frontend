import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-student-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-layout-top">
      <!-- Top Navigation Bar -->
      <header class="top-navbar">
        <!-- Logo Section -->
        <div class="logo-container">
          <div class="logo-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 14l9-5-9-5-9 5 9 5zm0 7l-9-5 9-5 9 5-9 5z"/>
            </svg>
          </div>
          <div class="logo-text">
            <h1 class="brand-name">Auto-École</h1>
            <p class="brand-subtitle">Espace Élève</p>
          </div>
        </div>

        <!-- Navigation Links -->
        <nav class="horizontal-nav">
          <a *ngFor="let item of navItems" [routerLink]="item.path"
             routerLinkActive="nav-item-active"
             class="nav-item">
            <div class="nav-icon" [innerHTML]="item.icon"></div>
            <span class="nav-label">{{ item.label }}</span>
          </a>
        </nav>

        <!-- User Profile -->
        <div class="nav-actions">
          <div class="user-profile">
            <div class="user-avatar">
              {{ initials }}
            </div>
            <div class="user-info">
              <p class="user-email">{{ email }}</p>
              <p class="user-role">Élève</p>
            </div>
          </div>
          <button (click)="logout()" class="logout-icon-btn" title="Déconnexion">
            <svg class="logout-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
          </button>
        </div>
      </header>

      <!-- Main Content -->
      <main class="main-content">
        <div class="page-container">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100vh;
        overflow: hidden;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        background: linear-gradient(135deg, rgba(18, 27, 50, 0.9), rgba(10, 12, 25, 0.9)),
          url('https://templatemo.com/templates/templatemo_583_festava_live/assets/images/slide-01.jpg') center/cover no-repeat;
        color: #ffffff;
      }

      .admin-layout-top {
        display: flex;
        flex-direction: column;
        height: 100vh;
        overflow: hidden;
      }

      .top-navbar {
        height: 80px;
        background: rgba(0, 0, 0, 0.35);
        backdrop-filter: blur(14px);
        border-bottom: 1px solid rgba(255, 255, 255, 0.12);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 2rem;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        flex-shrink: 0;
        z-index: 50;
      }

      .logo-container {
        display: flex;
        align-items: center;
        gap: 1rem;
        width: 250px;
      }

      .logo-icon {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }

      .logo-icon svg {
        width: 22px;
        height: 22px;
        color: white;
      }

      .logo-text {
        display: flex;
        flex-direction: column;
      }

      .brand-name {
        font-size: 1.25rem;
        font-weight: 800;
        margin: 0 0 0.15rem 0;
        background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .brand-subtitle {
        font-size: 0.75rem;
        color: rgba(255, 255, 255, 0.7);
        margin: 0;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .horizontal-nav {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex: 1;
        justify-content: center;
      }

      .nav-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.6rem 1rem;
        border-radius: 12px;
        text-decoration: none;
        color: rgba(255, 255, 255, 0.7);
        font-weight: 600;
        font-size: 0.9rem;
        transition: all 0.2s ease;
        position: relative;
      }

      .nav-item:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #ffffff;
      }

      .nav-item-active {
        background: rgba(99, 102, 241, 0.15);
        color: #818cf8;
      }

      .nav-item-active::before {
        content: '';
        position: absolute;
        bottom: -0.25rem;
        left: 50%;
        transform: translateX(-50%);
        width: 60%;
        height: 3px;
        background: linear-gradient(90deg, #6366f1 0%, #818cf8 100%);
        border-radius: 2px 2px 0 0;
      }

      .nav-icon {
        width: 18px;
        height: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .nav-icon ::ng-deep svg {
        width: 18px;
        height: 18px;
        color: currentColor;
      }

      .nav-label {
        white-space: nowrap;
      }

      .nav-actions {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        width: 250px;
        justify-content: flex-end;
      }

      .user-profile {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem;
        border-radius: 12px;
      }

      .user-avatar {
        width: 38px;
        height: 38px;
        border-radius: 10px;
        background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 0.875rem;
        color: #fff;
        flex-shrink: 0;
      }

      .user-info {
        display: flex;
        flex-direction: column;
      }

      .user-email {
        font-size: 0.85rem;
        font-weight: 600;
        color: #ffffff;
        margin: 0;
        max-width: 120px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .user-role {
        font-size: 0.7rem;
        color: #818cf8;
        margin: 0;
        font-weight: 600;
      }

      .logout-icon-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 42px;
        height: 42px;
        border-radius: 12px;
        border: none;
        background: rgba(255, 120, 110, 0.1);
        color: #fca5a5;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .logout-icon-btn:hover {
        background: rgba(255, 120, 110, 0.25);
        color: #fef2f2;
        transform: translateY(-2px);
        box-shadow: 0 4px 10px rgba(220, 38, 38, 0.2);
      }

      .logout-icon {
        width: 20px;
        height: 20px;
      }

      .main-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        position: relative;
      }

      .page-container {
        flex: 1;
        overflow-y: auto;
        padding: 2.5rem;
        max-width: 1400px;
        width: 100%;
        margin: 0 auto;
      }

      .page-container ::ng-deep svg.animate-spin {
        width: 32px !important;
        height: 32px !important;
        margin: 0 auto;
      }

      @media (max-width: 1024px) {
        .logo-container, .nav-actions {
          width: auto;
        }
        .user-email, .user-role {
          display: none;
        }
        .nav-label {
          display: none;
        }
      }

      @media (max-width: 768px) {
        .top-navbar {
           display: grid;
           grid-template-columns: 1fr auto;
           grid-template-rows: auto auto;
           padding: 1rem;
           height: auto;
           gap: 1rem;
        }
        .logo-container { grid-column: 1 / 2; grid-row: 1; width: auto; }
        .nav-actions { grid-column: 2 / 3; grid-row: 1; width: auto; gap: 0.5rem; }
        .horizontal-nav {
           grid-column: 1 / 3;
           grid-row: 2;
           width: 100%;
           overflow-x: auto;
           justify-content: space-around;
           padding-top: 0.5rem;
           border-top: 1px solid rgba(255,255,255,0.1);
        }
        .nav-label { display: block; font-size: 0.75rem; }
        .nav-item { flex-direction: column; gap: 0.25rem; min-width: 80px; }
        .nav-item-active::before { display: none; }
        .nav-item-active { background: rgba(99, 102, 241, 0.2); }
        .page-container {
          padding: 1rem;
        }
      }
    `
  ]
})
export class StudentLayoutComponent {
  email = '';
  initials = '';

  navItems = [
    { path: '/student/dashboard', label: 'Tableau de bord', icon: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>' },
    { path: '/student/choose-school', label: 'Choisir une école', icon: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>' },
    { path: '/student/sessions', label: 'Mes Séances', icon: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>' },
    { path: '/student/exams', label: 'Mes Examens', icon: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>' },
    { path: '/student/theoretical-exam', label: 'Examen Code', icon: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>' },
  ];

  constructor(private authService: AuthService) {
    this.email = this.authService.getEmail() || 'eleve@ecole.com';
    this.initials = this.email.substring(0, 2).toUpperCase();
  }

  logout(): void {
    this.authService.logout();
  }
}
