import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="login-wrapper">
      <!-- Top Navigation Bar -->
      <header class="top-nav-bar">
        <a routerLink="/" class="nav-back-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <span>Retour à l'accueil</span>
        </a>
        <div class="nav-actions">
          <span class="nav-text">Pas encore de compte ?</span>
          <a routerLink="/register" class="nav-register-btn">S'inscrire</a>
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
          <h2>Bienvenue de retour</h2>
          <p>Connectez-vous pour gérer vos élèves, moniteurs et planning en toute simplicité.</p>
        </div>
      </div>

      <!-- Right: Form panel -->
      <div class="form-panel">
        <div class="form-container">
          <div class="mobile-brand">
            <a routerLink="/" class="brand-link">
              <span class="brand-logo small"></span>
              <span class="brand-name">AutoÉcole SaaS</span>
            </a>
          </div>

          <div class="form-header">
            <h1>Se connecter</h1>
            <p>Entrez vos identifiants pour accéder à votre espace.</p>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form" autocomplete="off">
            <div class="field">
              <label for="email">Adresse e-mail</label>
              <div class="input-wrapper">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="M22 7l-10 6L2 7"/></svg>
                <input id="email" type="email" formControlName="email" placeholder="exemple@domaine.com"
                  [class.invalid]="email?.invalid && (email?.dirty || email?.touched)" autocomplete="username"/>
              </div>
              <div class="field-error" *ngIf="email?.invalid && (email?.dirty || email?.touched)">
                <span *ngIf="email?.errors?.['required']">L'e-mail est requis.</span>
                <span *ngIf="email?.errors?.['email']">Veuillez saisir un e-mail valide.</span>
              </div>
            </div>

            <div class="field">
              <label for="password">Mot de passe</label>
              <div class="input-wrapper">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 1 1 8 0v4"/></svg>
                <input id="password" [type]="showPassword ? 'text' : 'password'" formControlName="password"
                  placeholder="••••••••" [class.invalid]="password?.invalid && (password?.dirty || password?.touched)" autocomplete="current-password"/>
                <button type="button" class="toggle-pw" (click)="togglePassword()">
                  <svg *ngIf="!showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="18" height="18"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  <svg *ngIf="showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="18" height="18"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                </button>
              </div>
              <div class="field-error" *ngIf="password?.invalid && (password?.dirty || password?.touched)">
                <span *ngIf="password?.errors?.['required']">Le mot de passe est requis.</span>
                <span *ngIf="password?.errors?.['minlength']">Minimum 6 caractères.</span>
              </div>
            </div>

            <div class="actions">
              <label class="remember">
                <input type="checkbox" formControlName="remember" /> Se souvenir de moi
              </label>
              <a class="forgot" href="#" (click)="$event.preventDefault()">Mot de passe oublié ?</a>
            </div>

            <div class="error-message" *ngIf="errorMessage">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              {{ errorMessage }}
            </div>
            <div class="info-message" *ngIf="infoMessage">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              {{ infoMessage }}
            </div>

            <button class="resend-link" type="button" (click)="onResendSetupLink()" [disabled]="isLoading">
              Renvoyer le lien de configuration
            </button>

            <button class="submit" type="submit" [disabled]="isLoading || loginForm.invalid">
              <span *ngIf="!isLoading">Se connecter</span>
              <span *ngIf="isLoading" class="spinner"></span>
            </button>
          </form>

          <div class="form-footer">
            <span>Vous n'avez pas de compte ?</span>
            <a routerLink="/register" class="register-link">S'inscrire</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');

    :host { display: block; min-height: 100vh; font-family: 'Inter', system-ui, sans-serif; }

    .login-wrapper {
      display: flex; min-height: 100vh; position: relative;
    }

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
    .nav-register-btn {
      padding: 0.5rem 1rem; border-radius: 8px;
      background: rgba(255, 255, 255, 0.1); color: #fff; text-decoration: none;
      font-weight: 600; font-size: 0.9rem; border: 1px solid rgba(255, 255, 255, 0.2);
      transition: background 0.2s, border-color 0.2s;
    }
    .nav-register-btn:hover { background: rgba(255, 255, 255, 0.2); border-color: rgba(255, 255, 255, 0.4); }

    @media (min-width: 600px) { .nav-text { display: block; } }

    /* ── IMAGE PANEL ── */
    .image-panel {
      flex: 0 0 48%;
      position: relative;
      background: url('/images/login-bg.jpg') center/cover no-repeat;
      display: flex; flex-direction: column; justify-content: space-between;
      padding: 2rem 2.5rem;
    }
    .image-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(160deg, rgba(15,22,40,0.75) 0%, rgba(10,12,30,0.55) 50%, rgba(15,22,40,0.8) 100%);
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
    .brand-name { font-size: 1.1rem; font-weight: 700; letter-spacing: .01em; }
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

    /* ── FORM PANEL ── */
    .form-panel {
      flex: 1;
      display: flex; align-items: center; justify-content: center;
      background: linear-gradient(160deg, #0f1628, #1a1035 50%, #0d1a2d);
      padding: 2rem;
      overflow-y: auto;
    }
    .form-container { width: min(440px, 100%); }

    .mobile-brand { display: none; margin-bottom: 2rem; }

    .form-header { margin-bottom: 2rem; }
    .form-header h1 {
      font-size: 2rem; font-weight: 800; margin: 0 0 .5rem; color: #fff;
    }
    .form-header p { margin: 0; color: rgba(255,255,255,.7); font-size: .95rem; }

    .login-form { display: grid; gap: 1.25rem; }

    .field { display: grid; gap: .45rem; }
    .field label { font-weight: 600; font-size: .88rem; color: rgba(255,255,255,.75); }

    .input-wrapper {
      position: relative; display: flex; align-items: center;
    }
    .input-icon {
      position: absolute; left: .85rem;
      width: 18px; height: 18px; color: rgba(255,255,255,.4);
      pointer-events: none;
    }
    .input-wrapper input {
      width: 100%;
      padding: .85rem 1rem .85rem 2.6rem;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,.12);
      background: rgba(255,255,255,.06);
      color: #fff; font-size: .95rem; outline: none;
      transition: border .25s, box-shadow .25s, background .25s;
    }
    .input-wrapper input:focus {
      border-color: rgba(255,122,108,.5);
      box-shadow: 0 0 0 3px rgba(255,122,108,.1);
      background: rgba(255,255,255,.08);
    }
    .input-wrapper input.invalid { border-color: rgba(255,100,100,.7); }
    .input-wrapper input::placeholder { color: rgba(255,255,255,.3); }

    .toggle-pw {
      position: absolute; right: .75rem;
      background: none; border: none; color: rgba(255,255,255,.5); cursor: pointer;
      padding: .2rem; display: grid; place-items: center;
    }
    .toggle-pw:hover { color: rgba(255,255,255,.8); }

    .field-error { color: #ff8c8c; font-size: .8rem; }

    .actions {
      display: flex; justify-content: space-between; align-items: center;
      flex-wrap: wrap; gap: .5rem;
    }
    .remember {
      display: flex; align-items: center; gap: .45rem;
      font-size: .85rem; color: rgba(255,255,255,.7); cursor: pointer;
    }
    .remember input { width: 1rem; height: 1rem; accent-color: #ff7a6c; cursor: pointer; }
    .forgot {
      font-size: .85rem; text-decoration: none; color: #ffb86c;
      transition: color .2s;
    }
    .forgot:hover { color: #ff7a6c; }

    .error-message {
      display: flex; align-items: flex-start; gap: .5rem;
      padding: .75rem 1rem; border-radius: 12px;
      background: rgba(255,80,80,.1); border: 1px solid rgba(255,80,80,.25);
      color: #ff8c8c; font-size: .88rem; line-height: 1.4;
    }
    .error-message svg { flex-shrink: 0; margin-top: 1px; }

    .info-message {
      display: flex; align-items: flex-start; gap: .5rem;
      padding: .75rem 1rem; border-radius: 12px;
      background: rgba(59,130,246,.1); border: 1px solid rgba(59,130,246,.25);
      color: rgba(147,197,253,.95); font-size: .88rem; line-height: 1.4;
    }
    .info-message svg { flex-shrink: 0; margin-top: 1px; }

    .resend-link {
      width: 100%; padding: .7rem 1rem;
      border: 1px solid rgba(255,255,255,.15); border-radius: 12px;
      background: rgba(255,255,255,.05); color: rgba(255,255,255,.8);
      font-weight: 600; font-size: .9rem; cursor: pointer;
      transition: all .2s;
    }
    .resend-link:hover:not(:disabled) {
      background: rgba(255,255,255,.1); border-color: rgba(255,255,255,.25);
      transform: translateY(-1px);
    }
    .resend-link:disabled { opacity: .5; cursor: not-allowed; }

    .submit {
      width: 100%; padding: .95rem 1rem;
      border: none; border-radius: 12px;
      background: linear-gradient(135deg, #ff7a6c, #ffb86c);
      color: #1a1a1a; font-size: 1rem; font-weight: 700;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: transform .18s, box-shadow .18s;
      box-shadow: 0 12px 30px rgba(255,120,110,.25);
    }
    .submit:not(:disabled):hover {
      transform: translateY(-2px);
      box-shadow: 0 16px 40px rgba(255,120,110,.35);
    }
    .submit:disabled { opacity: .6; cursor: not-allowed; }

    .spinner {
      width: 20px; height: 20px;
      border: 2.5px solid rgba(26,26,26,.3);
      border-top-color: #1a1a1a; border-radius: 50%;
      animation: spin .7s linear infinite;
    }

    .form-footer {
      margin-top: 2rem; text-align: center;
      font-size: .9rem; color: rgba(255,255,255,.6);
      display: flex; align-items: center; justify-content: center; gap: .4rem;
    }
    .register-link {
      color: #ffb86c; text-decoration: none; font-weight: 700;
      transition: color .2s;
    }
    .register-link:hover { color: #ff7a6c; }

    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 900px) {
      .image-panel { display: none; }
      .mobile-brand { display: block; }
      .form-panel { padding: 1.5rem; }
    }

    @media (max-width: 480px) {
      .form-header h1 { font-size: 1.7rem; }
      .actions { flex-direction: column; align-items: flex-start; }
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  showPassword = false;
  errorMessage = '';
  infoMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      remember: [false]
    });

    if (this.authService.isLoggedIn()) {
      this.authService.redirectToDashboard();
    }
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.infoMessage = '';

    const loginPayload = {
      email: this.email?.value,
      password: this.password?.value
    };
    console.debug('Login attempt', loginPayload);

    this.authService.login(loginPayload).subscribe({
      next: () => {
        this.isLoading = false;
        this.authService.redirectToDashboard();
      },
      error: (err) => {
        this.isLoading = false;

        if (err?.status === 403) {
          this.errorMessage = 'Compte non activé ou accès refusé. Veuillez vérifier votre email, définir votre mot de passe via le lien reçu, ou contacter l\'administrateur.';
          this.infoMessage = 'Si vous n\'avez jamais configuré votre mot de passe, utilisez le lien "Renvoyer le lien de configuration".';
        } else if (err?.status === 404) {
          this.errorMessage = 'Aucun compte trouvé pour cet email. Vérifiez l\'email ou créez un compte.';
        } else {
          this.errorMessage = err?.error?.message || 'Identifiants incorrects. Veuillez réessayer.';
        }
      }
    });
  }

  onResendSetupLink(): void {
    if (!this.email?.value || this.email.invalid) {
      this.errorMessage = 'Entrez une adresse e-mail valide pour renvoyer le lien.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.infoMessage = '';

    this.authService.resendSetupLink(this.email.value).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.infoMessage = 'Lien de configuration renvoyé. Vérifiez votre boîte de réception.';
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Impossible de renvoyer le lien. Veuillez réessayer.';
      }
    });
  }
}
