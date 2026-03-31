import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink],
  template: `
    <header class="login-header-bar">
      <div class="header-content">
        <a routerLink="/" class="home-link" aria-label="Retour à l'accueil">
          <svg class="home-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
          </svg>
          <span>Accueil</span>
        </a>
      </div>
    </header>

    <div class="register-page">
      <router-outlet></router-outlet>

      <!-- Show register selector when no child route is active -->
      <ng-container *ngIf="isRegisterPage">
        <div class="register-card">
          <div class="register-header">
            <h1>Bienvenue</h1>
            <p>Choisissez votre type de compte pour commencer</p>
          </div>

          <div class="register-options">
            <!-- Student Option -->
            <div class="option-card student">
              <div class="icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
                </svg>
              </div>
              <h3>Élève</h3>
              <p>Inscrivez-vous en tant qu'élève pour suivre vos leçons et votre progression.</p>
              <a routerLink="/register/student" class="btn">S'inscrire</a>
            </div>

            <!-- Monitor Option -->
            <div class="option-card monitor">
              <div class="icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M16 7a4 4 0 1 1 0-8 4 4 0 0 1 0 8zM1 20.6v-2a6 6 0 0 1 6-6h3" />
                </svg>
              </div>
              <h3>Moniteur</h3>
              <p>Inscrivez-vous en tant que moniteur pour gérer vos élèves et planifier les sessions.</p>
              <a routerLink="/register/monitor" class="btn">S'inscrire</a>
            </div>

            <!-- Tenant Option -->
            <div class="option-card tenant">
              <div class="icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
              </div>
              <h3>École</h3>
              <p>Créez un compte école pour gérer votre plateforme de formation.</p>
              <a routerLink="/register/tenant" class="btn">S'inscrire</a>
            </div>
          </div>

          <div class="footer">
            <span>Vous avez déjà un compte? <a routerLink="/login" class="link">Se connecter</a></span>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
        background: linear-gradient(rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.55)),
          url('https://templatemo.com/templates/templatemo_583_festava_live/assets/images/slide-01.jpg') center/cover no-repeat;
        color: #ffffff;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }

      .login-header-bar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1000;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding: 1rem 2rem;
      }

      .header-content {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        justify-content: flex-start;
        align-items: center;
      }

      .home-link {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #ffffff;
        text-decoration: none;
        font-weight: 600;
        font-size: 0.95rem;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        transition: background-color 0.2s ease, color 0.2s ease;
      }

      .home-link:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #ff7a6c;
      }

      .home-icon {
        width: 1.25rem;
        height: 1.25rem;
      }

      .register-page {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 2rem;
        padding-top: 6rem; /* Add top padding to account for fixed header */
      }

      .register-card {
        width: min(1000px, 100%);
        padding: 2.5rem;
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.12);
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
        backdrop-filter: blur(14px);
        border: 1px solid rgba(255, 255, 255, 0.18);
      }

      .register-header {
        text-align: center;
        margin-bottom: 2.5rem;
      }

      .register-header h1 {
        font-size: 2.5rem;
        margin: 0 0 0.5rem;
        letter-spacing: 0.02em;
      }

      .register-header p {
        margin: 0;
        opacity: 0.85;
        font-size: 1.05rem;
      }

      .register-options {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1.75rem;
        margin-bottom: 2rem;
      }

      .option-card {
        border-radius: 18px;
        padding: 2rem;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(10px);
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 1rem;
        transition: all 0.3s ease;
      }

      .option-card:hover {
        background: rgba(255, 255, 255, 0.12);
        border-color: rgba(255, 255, 255, 0.25);
        transform: translateY(-4px);
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.25);
      }

      .option-card.student .icon {
        background: rgba(79, 70, 229, 0.25);
        border: 2px solid rgba(79, 70, 229, 0.5);
        color: #818cf8;
      }

      .option-card.monitor .icon {
        background: rgba(34, 197, 94, 0.25);
        border: 2px solid rgba(34, 197, 94, 0.5);
        color: #22c55e;
      }

      .option-card.tenant .icon {
        background: rgba(245, 158, 11, 0.25);
        border: 2px solid rgba(245, 158, 11, 0.5);
        color: #f59e0b;
      }

      .icon {
        width: 60px;
        height: 60px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.8rem;
      }

      .icon svg {
        width: 32px;
        height: 32px;
      }

      .option-card h3 {
        margin: 0;
        font-size: 1.3rem;
        font-weight: 700;
      }

      .option-card p {
        margin: 0;
        opacity: 0.8;
        font-size: 0.95rem;
        line-height: 1.5;
      }

      .btn {
        border: none;
        border-radius: 999px;
        padding: 0.8rem 1.5rem;
        font-weight: 700;
        font-size: 0.95rem;
        cursor: pointer;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        margin-top: 0.5rem;
      }

      .option-card.student .btn {
        background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%);
        color: #ffffff;
      }

      .option-card.student .btn:hover {
        box-shadow: 0 8px 20px rgba(129, 140, 248, 0.3);
        transform: translateY(-2px);
      }

      .option-card.monitor .btn {
        background: linear-gradient(135deg, #22c55e 0%, #10b981 100%);
        color: #ffffff;
      }

      .option-card.monitor .btn:hover {
        box-shadow: 0 8px 20px rgba(34, 197, 94, 0.3);
        transform: translateY(-2px);
      }

      .option-card.tenant .btn {
        background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
        color: #ffffff;
      }

      .option-card.tenant .btn:hover {
        box-shadow: 0 8px 20px rgba(245, 158, 11, 0.3);
        transform: translateY(-2px);
      }

      .footer {
        text-align: center;
        border-top: 1px solid rgba(255, 255, 255, 0.15);
        padding-top: 1.5rem;
        opacity: 0.85;
        font-size: 0.95rem;
      }

      .footer .link {
        color: #818cf8;
        text-decoration: none;
        font-weight: 600;
        transition: color 0.2s ease;
      }

      .footer .link:hover {
        color: #06b6d4;
        text-decoration: underline;
      }

      @media (max-width: 768px) {
        .login-header-bar {
          padding: 0.75rem 1rem;
        }

        .home-link {
          font-size: 0.9rem;
          padding: 0.4rem 0.75rem;
        }

        .home-icon {
          width: 1.1rem;
          height: 1.1rem;
        }

        .register-card {
          padding: 1.5rem;
        }

        .register-header h1 {
          font-size: 1.8rem;
        }

        .register-options {
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        .option-card {
          padding: 1.5rem;
        }
      }
    `
  ]
})
export class RegisterComponent {
  isRegisterPage = true;

  constructor() {
    // This component acts as a parent router container
    // When a child route is active, the router-outlet shows the child component
    // When no child route is active, isRegisterPage should be true to show the selector
  }
}
