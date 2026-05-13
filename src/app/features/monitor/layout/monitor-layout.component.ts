import { Component, HostListener, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-monitor-layout',
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </div>
          <div class="logo-text">
            <h1 class="brand-name">Auto-École</h1>
            <p class="brand-subtitle">Espace Moniteur</p>
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

        <!-- User Actions -->
        <div class="nav-actions">
          
          <!-- Messages Icon & Popup -->
          <div class="nav-action-container" (click)="toggleMessages($event)">
            <button class="action-icon-btn" [class.active]="isMessagesOpen" title="Messages">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
              <span class="notification-badge" *ngIf="unreadMessageCount > 0">{{ unreadMessageCount }}</span>
            </button>
            <div class="action-dropdown" [class.show]="isMessagesOpen">
              <div class="dropdown-header">
                <h3>Messages</h3>
                <a routerLink="/monitor/chat" class="header-link">Tout voir</a>
              </div>
              <div class="dropdown-content empty-state">
                <div class="empty-icon-wrapper">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>
                </div>
                <p *ngIf="unreadMessageCount === 0">Aucun nouveau message</p>
                <p *ngIf="unreadMessageCount > 0">Vous avez {{ unreadMessageCount }} nouveau(x) message(s)</p>
              </div>
            </div>
          </div>

          <!-- User Profile Dropdown -->
          <div class="user-profile-container" (click)="toggleDropdown($event)">
            <div class="user-profile">
              <div class="user-avatar">
                {{ initials }}
              </div>
              <div class="user-info">
                <p class="user-email">{{ email }}</p>
                <p class="user-role">Moniteur</p>
              </div>
              <svg class="dropdown-chevron" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
            
            <div class="profile-dropdown" [class.show]="isDropdownOpen">
              <a routerLink="/monitor/profile" class="dropdown-item">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                Paramètres
              </a>
              <div class="dropdown-divider"></div>
              <button (click)="logout()" class="dropdown-item text-danger">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                Déconnexion
              </button>
            </div>
          </div>
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
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
        color: #ffffff;
      }

      .admin-layout-top {
        display: flex;
        flex-direction: column;
        height: 100vh;
        overflow: hidden;
        background-color: #020617;
        background-image: 
          radial-gradient(
            600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), 
            rgba(20, 184, 166, 0.15),
            transparent 40%
          ),
          linear-gradient(rgba(15, 23, 42, 0.2), rgba(15, 23, 42, 0.5)),
          url('../../../../assets/images/sport.jpg');
        background-size: auto, cover, cover;
        background-position: center, center, center;
        background-attachment: fixed;
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
        flex: 1;
      }

      .logo-icon {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        background: linear-gradient(135deg, #14b8a6 0%, #059669 100%);
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
        background: linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%);
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
        background: rgba(20, 184, 166, 0.15);
        color: #2dd4bf;
      }

      .nav-item-active::before {
        content: '';
        position: absolute;
        bottom: -0.25rem;
        left: 50%;
        transform: translateX(-50%);
        width: 60%;
        height: 3px;
        background: linear-gradient(90deg, #14b8a6 0%, #2dd4bf 100%);
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
        gap: 1.25rem;
        flex: 1;
        justify-content: flex-end;
      }

      /* Action Icons */
      .action-icon-btn {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.05);
        color: rgba(255, 255, 255, 0.8);
        text-decoration: none;
        transition: all 0.2s ease;
        border: none;
        cursor: pointer;
      }

      .action-icon-btn:hover {
        background: rgba(255, 255, 255, 0.15);
        color: #fff;
        transform: translateY(-2px);
      }

      .action-icon-btn svg {
        width: 20px;
        height: 20px;
      }

      /* Action Dropdowns (Messages) */
      .nav-action-container {
        position: relative;
      }

      .action-dropdown {
        position: absolute;
        top: calc(100% + 0.75rem);
        right: -40px;
        width: 340px;
        background: rgba(15, 23, 42, 0.95);
        backdrop-filter: blur(16px);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 16px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1);
        opacity: 0;
        visibility: hidden;
        transform: translateY(-10px);
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        z-index: 100;
        overflow: hidden;
      }

      .action-dropdown.show {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }

      .dropdown-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem 1.25rem;
        background: rgba(255,255,255,0.03);
        border-bottom: 1px solid rgba(255,255,255,0.08);
      }

      .dropdown-header h3 {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
        color: #fff;
      }

      .header-link {
        font-size: 0.8rem;
        color: #2dd4bf;
        text-decoration: none;
        font-weight: 500;
        transition: color 0.2s;
      }

      .header-link:hover {
        color: #5eead4;
        text-decoration: underline;
      }

      .dropdown-content {
        max-height: 380px;
        overflow-y: auto;
      }

      /* Empty States inside Dropdowns */
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem 1.5rem;
        text-align: center;
      }

      .empty-icon-wrapper {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: rgba(255,255,255,0.05);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1rem;
        color: rgba(255,255,255,0.4);
      }

      .empty-icon-wrapper svg {
        width: 24px;
        height: 24px;
      }

      .empty-state p {
        margin: 0;
        color: rgba(255,255,255,0.6);
        font-size: 0.9rem;
      }

      /* Profile Dropdown Container */
      .user-profile-container {
        position: relative;
        cursor: pointer;
      }

      .user-profile {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem;
        border-radius: 12px;
        transition: background 0.2s;
      }

      .user-profile:hover {
        background: rgba(255, 255, 255, 0.05);
      }

      .dropdown-chevron {
        width: 16px;
        height: 16px;
        color: rgba(255,255,255,0.5);
        margin-left: 0.25rem;
      }

      .profile-dropdown {
        position: absolute;
        top: calc(100% + 0.5rem);
        right: 0;
        width: 220px;
        background: rgba(15, 23, 42, 0.95);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 12px;
        padding: 0.5rem;
        box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        opacity: 0;
        visibility: hidden;
        transform: translateY(-10px);
        transition: all 0.2s ease;
        z-index: 100;
      }

      .profile-dropdown.show {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }

      .dropdown-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        color: #e2e8f0;
        text-decoration: none;
        font-size: 0.9rem;
        font-weight: 500;
        transition: all 0.2s;
        border: none;
        background: transparent;
        width: 100%;
        cursor: pointer;
        text-align: left;
      }

      .dropdown-item svg {
        width: 18px;
        height: 18px;
        color: rgba(255,255,255,0.5);
      }

      .dropdown-item:hover {
        background: rgba(255,255,255,0.05);
        color: #fff;
      }

      .dropdown-item:hover svg {
        color: #fff;
      }

      .dropdown-item.text-danger {
        color: #fca5a5;
      }
      .dropdown-item.text-danger svg {
        color: #fca5a5;
      }
      .dropdown-item.text-danger:hover {
        background: rgba(239, 68, 68, 0.1);
        color: #fef2f2;
      }

      .dropdown-divider {
        height: 1px;
        background: rgba(255,255,255,0.1);
        margin: 0.5rem 0;
      }

      .user-avatar {
        width: 38px;
        height: 38px;
        border-radius: 10px;
        background: linear-gradient(135deg, #14b8a6 0%, #059669 100%);
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
        color: #2dd4bf;
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
        .nav-item-active { background: rgba(20, 184, 166, 0.2); }
        .page-container {
          padding: 1rem;
        }
      }
    `
  ]
})
export class MonitorLayoutComponent implements OnInit, OnDestroy {
  email = '';
  initials = '';
  isDropdownOpen = false;
  isMessagesOpen = false;

  unreadMessageCount = 0;
  private messagePollInterval: any;

  navItems = [
    { path: '/monitor/dashboard', label: 'Tableau de bord', icon: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>' },
    { path: '/monitor/sessions', label: 'Mon Planning', icon: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>' }
  ];

  constructor(private authService: AuthService, private el: ElementRef, private http: HttpClient) {
    this.email = this.authService.getEmail() || 'moniteur@ecole.com';
    this.initials = this.email.substring(0, 2).toUpperCase();
  }

  ngOnInit() {
    this.loadUnreadMessages();
    this.messagePollInterval = setInterval(() => {
      this.loadUnreadMessages();
    }, 5000);
  }

  ngOnDestroy() {
    if (this.messagePollInterval) {
      clearInterval(this.messagePollInterval);
    }
  }

  loadUnreadMessages() {
    this.http.get<{count: number}>(`${environment.apiUrl}/messages/unread-count`).subscribe({
      next: (res) => {
        this.unreadMessageCount = res.count;
      },
      error: () => {}
    });
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.el.nativeElement.style.setProperty('--mouse-x', `${event.clientX}px`);
    this.el.nativeElement.style.setProperty('--mouse-y', `${event.clientY}px`);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    
    // Check if click was outside profile dropdown
    if (!this.el.nativeElement.querySelector('.user-profile-container')?.contains(target)) {
      this.isDropdownOpen = false;
    }
    
    // Check if click was outside messages dropdown
    const containers = Array.from(this.el.nativeElement.querySelectorAll('.nav-action-container'));
    const clickedInsideAction = containers.some((c: any) => c.contains(target));
    
    if (!clickedInsideAction) {
      this.isMessagesOpen = false;
    }
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
    this.isMessagesOpen = false;
  }

  toggleMessages(event: Event) {
    event.stopPropagation();
    this.isMessagesOpen = !this.isMessagesOpen;
    this.isDropdownOpen = false;
  }

  logout(): void {
    this.authService.logout();
  }
}
