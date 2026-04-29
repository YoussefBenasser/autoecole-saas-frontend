import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  // ... rest of the component definition remains identical ...
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink],
  template: `
    <div class="register-wrapper">
      <!-- Top Navigation Bar -->
      <header class="top-nav-bar">
        <a routerLink="/" class="nav-back-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <span>Retour à l'accueil</span>
        </a>
        <div class="nav-actions">
          <span class="nav-text">Déjà un compte ?</span>
          <a routerLink="/login" class="nav-login-btn">Se connecter</a>
        </div>
      </header>

      <!-- Left: Image panel -->
      <div class="image-panel">
        <div class="image-overlay"></div>
        <div class="brand-area">
          <a routerLink="/" class="brand-link">
            <span class="brand-logo"></span>
            <span class="brand-name">AutoÉcole SaaS</span>
          </a>
        </div>
        <div class="image-text">
          <h2>Rejoignez-nous</h2>
          <p>Créez votre compte et commencez à gérer votre auto-école en quelques minutes.</p>
        </div>
      </div>

      <!-- Right: Content panel -->
      <div class="content-panel">
        <router-outlet></router-outlet>

        <ng-container *ngIf="isRegisterPage">
          <div class="form-container">
            <div class="mobile-brand">
              <a routerLink="/" class="brand-link">
                <span class="brand-logo small"></span>
                <span class="brand-name">AutoÉcole SaaS</span>
              </a>
            </div>

            <div class="form-header">
              <h1>Créer un compte</h1>
              <p>Choisissez votre type de compte pour commencer</p>
            </div>

            <div class="register-options">
              <a routerLink="/register/student" class="option-card">
                <div class="option-icon student">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/>
                  </svg>
                </div>
                <div class="option-info">
                  <h3>Élève</h3>
                  <p>Suivez vos leçons, votre progression et vos résultats d'examens.</p>
                </div>
                <svg class="option-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </a>

              <a routerLink="/register/monitor" class="option-card">
                <div class="option-icon monitor">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M16 7a4 4 0 1 1 0-8 4 4 0 0 1 0 8zM1 20.6v-2a6 6 0 0 1 6-6h3"/>
                  </svg>
                </div>
                <div class="option-info">
                  <h3>Moniteur</h3>
                  <p>Gérez vos élèves et planifiez les sessions de conduite.</p>
                </div>
                <svg class="option-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </a>

              <a routerLink="/register/tenant" class="option-card">
                <div class="option-icon tenant">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/>
                    <polyline points="7 3 7 8 15 8"/>
                  </svg>
                </div>
                <div class="option-info">
                  <h3>École</h3>
                  <p>Créez et gérez votre plateforme de formation complète.</p>
                </div>
                <svg class="option-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </a>
            </div>

            <div class="form-footer">
              <span>Vous avez déjà un compte ?</span>
              <a routerLink="/login" class="login-link">Se connecter</a>
            </div>
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');

    :host { display: block; min-height: 100vh; font-family: 'Inter', system-ui, sans-serif; }

    .register-wrapper { display: flex; min-height: 100vh; position: relative; }

    /* ── TOP NAV BAR ── */
    .top-nav-bar {
      position: absolute; top: 0; left: 0; right: 0;
      display: flex; justify-content: space-between; align-items: center;
      padding: 1.5rem 2.5rem; z-index: 10;
    }
    .nav-back-link {
      display: inline-flex; align-items: center; gap: 0.5rem;
      color: rgba(255, 255, 255, 0.8); text-decoration: none; font-weight: 600; font-size: 0.95rem;
      transition: color 0.2s, transform 0.2s;
    }
    .nav-back-link svg { width: 18px; height: 18px; }
    .nav-back-link:hover { color: #fff; transform: translateX(-3px); }
    
    .nav-actions { display: flex; align-items: center; gap: 1rem; }
    .nav-text { color: rgba(255, 255, 255, 0.6); font-size: 0.9rem; display: none; }
    .nav-login-btn {
      padding: 0.5rem 1rem; border-radius: 8px;
      background: rgba(255, 255, 255, 0.1); color: #fff; text-decoration: none;
      font-weight: 600; font-size: 0.9rem; border: 1px solid rgba(255, 255, 255, 0.2);
      transition: background 0.2s, border-color 0.2s;
    }
    .nav-login-btn:hover { background: rgba(255, 255, 255, 0.2); border-color: rgba(255, 255, 255, 0.4); }

    @media (min-width: 600px) { .nav-text { display: block; } }

    /* ── IMAGE PANEL ── */
    .image-panel {
      flex: 0 0 48%;
      position: relative;
      background: url('/images/register-bg.jpg') center/cover no-repeat;
      display: flex; flex-direction: column; justify-content: space-between;
      padding: 2rem 2.5rem;
    }
    .image-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(160deg, rgba(15,22,40,0.75) 0%, rgba(10,12,30,0.5) 50%, rgba(15,22,40,0.8) 100%);
    }
    .brand-area { position: relative; z-index: 2; }
    .brand-link {
      display: inline-flex; align-items: center; gap: .6rem;
      text-decoration: none; color: #fff;
    }
    .brand-logo {
      width: 42px; height: 42px; border-radius: 14px;
      background: linear-gradient(135deg, #ff7a6c, #ffb86c);
      box-shadow: 0 8px 20px rgba(0,0,0,0.3);
    }
    .brand-logo.small { width: 34px; height: 34px; border-radius: 10px; }
    .brand-name { font-size: 1.1rem; font-weight: 700; }
    .image-text {
      position: relative; z-index: 2; color: #fff;
      max-width: 420px; padding-bottom: 2rem;
    }
    .image-text h2 {
      font-size: 2.2rem; font-weight: 800; margin: 0 0 .75rem;
      line-height: 1.15; text-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }
    .image-text p {
      font-size: 1rem; line-height: 1.65; opacity: .9;
      text-shadow: 0 2px 10px rgba(0,0,0,0.2);
    }

    /* ── CONTENT PANEL ── */
    .content-panel {
      flex: 1;
      display: flex; align-items: center; justify-content: center;
      background: linear-gradient(160deg, #0f1628, #1a1035 50%, #0d1a2d);
      padding: 2rem;
      overflow-y: auto;
      color: #fff;
    }
    .form-container { width: min(480px, 100%); }
    .mobile-brand { display: none; margin-bottom: 2rem; }

    .form-header { margin-bottom: 2.5rem; }
    .form-header h1 {
      font-size: 2rem; font-weight: 800; margin: 0 0 .5rem; color: #fff;
    }
    .form-header p { margin: 0; color: rgba(255,255,255,.65); font-size: .95rem; }

    /* ── OPTION CARDS ── */
    .register-options {
      display: flex; flex-direction: column; gap: 1rem;
      margin-bottom: 2.5rem;
    }
    .option-card {
      display: flex; align-items: center; gap: 1.25rem;
      padding: 1.25rem 1.5rem;
      border-radius: 16px;
      background: rgba(255,255,255,.05);
      border: 1px solid rgba(255,255,255,.1);
      text-decoration: none; color: #fff;
      transition: all .3s ease;
      cursor: pointer;
    }
    .option-card:hover {
      background: rgba(255,255,255,.1);
      border-color: rgba(255,255,255,.2);
      transform: translateX(6px);
      box-shadow: 0 12px 35px rgba(0,0,0,0.25);
    }

    .option-icon {
      width: 52px; height: 52px; border-radius: 14px;
      display: grid; place-items: center; flex-shrink: 0;
    }
    .option-icon svg { width: 26px; height: 26px; }

    .option-icon.student {
      background: rgba(99,102,241,.15); border: 1px solid rgba(99,102,241,.3);
      color: #818cf8;
    }
    .option-icon.monitor {
      background: rgba(34,197,94,.15); border: 1px solid rgba(34,197,94,.3);
      color: #4ade80;
    }
    .option-icon.tenant {
      background: rgba(255,184,108,.15); border: 1px solid rgba(255,184,108,.3);
      color: #ffb86c;
    }

    .option-info { flex: 1; }
    .option-info h3 { margin: 0 0 .3rem; font-size: 1.1rem; font-weight: 700; }
    .option-info p { margin: 0; font-size: .85rem; opacity: .65; line-height: 1.45; }

    .option-arrow {
      width: 20px; height: 20px; flex-shrink: 0;
      color: rgba(255,255,255,.3);
      transition: color .3s, transform .3s;
    }
    .option-card:hover .option-arrow {
      color: #ffb86c;
      transform: translateX(4px);
    }

    /* ── FOOTER ── */
    .form-footer {
      text-align: center; font-size: .9rem;
      color: rgba(255,255,255,.55);
      display: flex; align-items: center; justify-content: center; gap: .4rem;
      border-top: 1px solid rgba(255,255,255,.08);
      padding-top: 1.75rem;
    }
    .login-link {
      color: #ffb86c; text-decoration: none; font-weight: 700;
      transition: color .2s;
    }
    .login-link:hover { color: #ff7a6c; }

    @media (max-width: 900px) {
      .image-panel { display: none; }
      .mobile-brand { display: block; }
      .content-panel { padding: 1.5rem; }
    }

    @media (max-width: 480px) {
      .form-header h1 { font-size: 1.7rem; }
      .option-card { padding: 1rem 1.15rem; gap: 1rem; }
      .option-icon { width: 44px; height: 44px; }
      .option-icon svg { width: 22px; height: 22px; }
    }
  `]
})
export class RegisterComponent implements OnInit {
  isRegisterPage = true;

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isRegisterPage = event.url === '/register' || event.url === '/register/';
    });
  }

  ngOnInit() {
    this.isRegisterPage = this.router.url === '/register' || this.router.url === '/register/';
  }
}
