import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-super-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <!-- Logo Section -->
        <div class="sidebar-header">
          <div class="logo-container">
            <div class="logo-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 14l9-5-9-5-9 5 9 5z"/>
              </svg>
            </div>
            <div class="logo-text">
              <h1 class="brand-name">Auto-École</h1>
              <p class="brand-subtitle">Super Admin</p>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="sidebar-nav">
          <a routerLink="/super-admin/dashboard"
             routerLinkActive="nav-item-active"
             class="nav-item">
            <div class="nav-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
              </svg>
            </div>
            <span class="nav-label">Tableau de bord</span>
          </a>

          <a routerLink="/super-admin/tenants"
             routerLinkActive="nav-item-active"
             class="nav-item">
            <div class="nav-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>
            <span class="nav-label">Écoles partenaires</span>
          </a>

          <a routerLink="/super-admin/students"
             routerLinkActive="nav-item-active"
             class="nav-item">
            <div class="nav-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
            </div>
            <span class="nav-label">Tous les Élèves</span>
          </a>

          <a routerLink="/super-admin/monitors"
             routerLinkActive="nav-item-active"
             class="nav-item">
            <div class="nav-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
            </div>
            <span class="nav-label">Moniteurs</span>
          </a>
        </nav>

        <!-- User Profile & Logout -->
        <div class="sidebar-footer">
          <div class="user-profile">
            <div class="user-avatar">
              {{ initials }}
            </div>
            <div class="user-info">
              <p class="user-email">{{ email }}</p>
              <p class="user-role">Super Admin</p>
            </div>
          </div>

          <button (click)="logout()" class="logout-button">
            <svg class="logout-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            <span class="logout-text">Déconnexion</span>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <!-- Top Header -->
        <header class="top-header">
          <div class="header-content">
            <h2 class="page-title">Panneau Super Admin</h2>
            <div class="status-indicator">
              <div class="status-dot"></div>
              <span class="status-text">Superviseur</span>
            </div>
          </div>
        </header>

        <!-- Page Content -->
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

      .admin-layout {
        display: flex;
        height: 100vh;
        overflow: hidden;
      }

      /* Sidebar Styles */
      .sidebar {
        width: 280px;
        background: rgba(0, 0, 0, 0.35);
        backdrop-filter: blur(14px);
        border-right: 1px solid rgba(255, 255, 255, 0.12);
        display: flex;
        flex-direction: column;
        box-shadow: 4px 0 20px rgba(0, 0, 0, 0.3);
      }

      .sidebar-header {
        padding: 2rem 1.5rem;
        border-bottom: 1px solid rgba(226, 232, 240, 0.8);
      }

      .logo-container {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .logo-icon {
        width: 48px;
        height: 48px;
        border-radius: 14px;
        background: linear-gradient(135deg, #ff7a6c 0%, #ffb86c 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        box-shadow: 0 8px 18px rgba(0, 0, 0, 0.35);
      }

      .logo-icon svg {
        width: 24px;
        height: 24px;
        color: white;
      }

      .logo-text {
        flex: 1;
      }

      .brand-name {
        font-size: 1.25rem;
        font-weight: 800;
        margin: 0 0 0.25rem 0;
        background: linear-gradient(135deg, #ff7a6c 0%, #ffb86c 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .brand-subtitle {
        font-size: 0.875rem;
        color: rgba(255, 255, 255, 0.7);
        margin: 0;
        font-weight: 600;
      }

      .sidebar-nav {
        flex: 1;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .nav-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.875rem 1rem;
        border-radius: 12px;
        text-decoration: none;
        color: rgba(255, 255, 255, 0.8);
        font-weight: 600;
        font-size: 0.9rem;
        transition: all 0.2s ease;
        position: relative;
      }

      .nav-item:hover {
        background: rgba(255, 255, 255, 0.12);
        color: #ffffff;
        transform: translateX(4px);
      }

      .nav-item-active {
        background: rgba(255, 255, 255, 0.15);
        color: #ffffff;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      }

      .nav-item-active::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 4px;
        height: 60%;
        background: linear-gradient(135deg, #ff7a6c 0%, #ffb86c 100%);
        border-radius: 0 2px 2px 0;
      }

      .nav-icon {
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .nav-icon svg {
        width: 18px;
        height: 18px;
      }

      .nav-label {
        flex: 1;
        white-space: nowrap;
      }

      .sidebar-footer {
        padding: 1.5rem;
        border-top: 1px solid rgba(226, 232, 240, 0.8);
      }

      .user-profile {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1rem;
        background: rgba(0, 0, 0, 0.25);
        border-radius: 12px;
        margin-bottom: 1rem;
      }

      .user-avatar {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: linear-gradient(135deg, #ff7a6c 0%, #ffb86c 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 0.875rem;
        color: #1a1a1a;
        flex-shrink: 0;
      }

      .user-info {
        flex: 1;
        min-width: 0;
      }

      .user-email {
        font-size: 0.875rem;
        font-weight: 600;
        color: #ffffff;
        margin: 0 0 0.25rem 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .user-role {
        font-size: 0.75rem;
        color: rgba(255, 255, 255, 0.7);
        margin: 0;
        font-weight: 500;
      }

      .logout-button {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.875rem 1rem;
        border-radius: 12px;
        border: none;
        background: rgba(255, 120, 110, 0.1);
        color: #ff7a6c;
        font-weight: 600;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .logout-button:hover {
        background: rgba(255, 120, 110, 0.2);
        color: #ffb86c;
        transform: translateY(-1px);
      }

      .logout-icon {
        width: 18px;
        height: 18px;
      }

      .logout-text {
        flex: 1;
        text-align: left;
      }

      /* Main Content Styles */
      .main-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .top-header {
        background: rgba(0, 0, 0, 0.35);
        backdrop-filter: blur(14px);
        border-bottom: 1px solid rgba(255, 255, 255, 0.12);
        padding: 1.5rem 2rem;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      }

      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .page-title {
        font-size: 1.25rem;
        font-weight: 700;
        color: #ffffff;
        margin: 0;
      }

      .status-indicator {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 600;
        color: #ffffff;
      }

      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #10b981;
        animation: pulse 2s infinite;
      }

      .status-text {
        text-transform: uppercase;
        letter-spacing: 0.025em;
      }

      .page-container {
        flex: 1;
        overflow-y: auto;
        padding: 2rem;
      }

      /* Animations */
      @keyframes pulse {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }

      /* Responsive Design */
      @media (max-width: 1024px) {
        .sidebar {
          width: 260px;
        }

        .logo-icon {
          width: 44px;
          height: 44px;
        }

        .logo-icon svg {
          width: 22px;
          height: 22px;
        }

        .brand-name {
          font-size: 1.1rem;
        }
      }

      @media (max-width: 768px) {
        .admin-layout {
          flex-direction: column;
        }

        .sidebar {
          width: 100%;
          height: auto;
          position: sticky;
          top: 0;
          z-index: 30;
        }

        .sidebar-header {
          padding: 1.5rem;
        }

        .sidebar-nav {
          padding: 1rem;
          flex-direction: row;
          overflow-x: auto;
          gap: 0.25rem;
        }

        .nav-item {
          flex-shrink: 0;
          padding: 0.75rem;
          min-width: 120px;
        }

        .nav-label {
          font-size: 0.8rem;
        }

        .sidebar-footer {
          padding: 1rem;
        }

        .user-profile {
          padding: 0.75rem;
        }

        .top-header {
          display: none;
        }

        .page-container {
          padding: 1rem;
        }
      }

      @media (max-width: 480px) {
        .sidebar-nav {
          padding: 0.75rem;
        }

        .nav-item {
          min-width: 100px;
          padding: 0.625rem 0.75rem;
        }

        .nav-icon {
          width: 16px;
          height: 16px;
        }

        .nav-icon svg {
          width: 14px;
          height: 14px;
        }

        .nav-label {
          font-size: 0.75rem;
        }

        .page-container {
          padding: 0.75rem;
        }
      }
    `
  ]
})
export class SuperAdminLayoutComponent {
  email = '';
  initials = '';

  constructor(private authService: AuthService) {
    this.email = this.authService.getEmail() || 'admin@system.com';
    this.initials = this.email.substring(0, 2).toUpperCase();
  }

  logout(): void {
    this.authService.logout();
  }
}
