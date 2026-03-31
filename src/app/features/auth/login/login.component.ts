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

    <div class="login-page">
      <div class="login-card">
        <div class="login-header">
          <h1>Bienvenue</h1>
          <p>Connectez-vous pour accéder à votre espace de gestion.</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form" autocomplete="off">
          <div class="field">
            <label for="email">Adresse e-mail</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="exemple@domaine.com"
              [class.invalid]="email?.invalid && (email?.dirty || email?.touched)"
              autocomplete="username"
            />
            <div class="field-error" *ngIf="email?.invalid && (email?.dirty || email?.touched)">
              <span *ngIf="email?.errors?.['required']">L'e-mail est requis.</span>
              <span *ngIf="email?.errors?.['email']">Veuillez saisir un e-mail valide.</span>
            </div>
          </div>

          <div class="field">
            <label for="password">Mot de passe</label>
            <div class="password-wrapper">
              <input
                id="password"
                [type]="showPassword ? 'text' : 'password'"
                formControlName="password"
                placeholder="••••••••"
                [class.invalid]="password?.invalid && (password?.dirty || password?.touched)"
                autocomplete="current-password"
              />
              <button type="button" class="toggle-password" (click)="togglePassword()" aria-label="Afficher/masquer le mot de passe">
                {{ showPassword ? 'Masquer' : 'Afficher' }}
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

          <div class="error-message" *ngIf="errorMessage">{{ errorMessage }}</div>
          <div class="info-message" *ngIf="infoMessage">{{ infoMessage }}</div>

          <button class="resend-link" type="button" (click)="onResendSetupLink()" [disabled]="isLoading">
            Renvoyer le lien de configuration
          </button>

          <button class="submit" type="submit" [disabled]="isLoading || loginForm.invalid">
            <span *ngIf="!isLoading">Se connecter</span>
            <span *ngIf="isLoading" class="spinner" aria-label="Chargement"></span>
          </button>
        </form>

        <div class="footer">
          <div class="footer-content">
            <span>Besoin d'aide ? Contactez le support.</span>
            <div class="register-section">
              <span>Vous n'avez pas de compte ?</span>
              <a routerLink="/register" class="register-link">S'inscrire</a>
            </div>
          </div>
        </div>
      </div>
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

      .login-page {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 2rem;
        padding-top: 6rem; /* Add top padding to account for fixed header */
      }

      .login-card {
        width: min(520px, 100%);
        padding: 2.25rem 2rem;
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.12);
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
        backdrop-filter: blur(14px);
        border: 1px solid rgba(255, 255, 255, 0.18);
      }

      .login-header {
        margin-bottom: 1.75rem;
      }

      .login-header h1 {
        font-size: 2.25rem;
        margin: 0 0 0.5rem;
        letter-spacing: 0.02em;
      }

      .login-header p {
        margin: 0;
        opacity: 0.85;
        line-height: 1.5;
      }

      .login-form {
        display: grid;
        gap: 1.25rem;
      }

      .field {
        display: grid;
        gap: 0.5rem;
      }

      label {
        font-weight: 600;
        font-size: 0.95rem;
        opacity: 0.9;
      }

      input {
        padding: 0.9rem 1rem;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.35);
        background: rgba(0, 0, 0, 0.35);
        color: #ffffff;
        outline: none;
        font-size: 1rem;
        transition: border 0.2s ease, box-shadow 0.2s ease;
      }

      input:focus {
        border-color: rgba(255, 255, 255, 0.75);
        box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.18);
      }

      input.invalid {
        border-color: rgba(255, 100, 100, 0.9);
      }

      .password-wrapper {
        position: relative;
      }

      .toggle-password {
        position: absolute;
        right: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
        background: transparent;
        border: none;
        color: rgba(255, 255, 255, 0.75);
        font-weight: 600;
        cursor: pointer;
        padding: 0.25rem 0.5rem;
      }

      .field-error {
        color: rgba(255, 140, 140, 0.95);
        font-size: 0.85rem;
      }

      .actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .remember {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9rem;
        opacity: 0.9;
      }

      .remember input {
        width: 1.05rem;
        height: 1.05rem;
        accent-color: #ff6b6b;
      }

      .forgot {
        font-size: 0.9rem;
        text-decoration: none;
        color: rgba(255, 255, 255, 0.8);
        transition: color 0.2s;
      }

      .forgot:hover {
        color: #ffffff;
      }

      .error-message {
        padding: 0.75rem 1rem;
        border-radius: 12px;
        background: rgba(255, 80, 80, 0.18);
        border: 1px solid rgba(255, 80, 80, 0.35);
        color: rgba(255, 255, 255, 0.9);
        font-size: 0.95rem;
      }

      .info-message {
        padding: 0.75rem 1rem;
        border-radius: 12px;
        background: rgba(59, 130, 246, 0.18);
        border: 1px solid rgba(59, 130, 246, 0.35);
        color: rgba(255, 255, 255, 0.95);
        font-size: 0.95rem;
        margin-top: 0.75rem;
      }

      .resend-link {
        width: 100%;
        padding: 0.65rem 1rem;
        margin-top: 0.75rem;
        border: 1px solid rgba(255, 255, 255, 0.4);
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.09);
        color: #ffffff;
        font-weight: 600;
        cursor: pointer;
        text-align: center;
        transition: transform 0.15s ease, box-shadow 0.15s ease;
      }

      .resend-link:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.25);
      }

      .resend-link:disabled {
        opacity: 0.65;
        cursor: not-allowed;
      }

      .submit {
        width: 100%;
        padding: 0.95rem 1rem;
        border: none;
        border-radius: 12px;
        background: linear-gradient(135deg, #ff7a6c 0%, #ffb86c 100%);
        color: #1a1a1a;
        font-size: 1.05rem;
        font-weight: 700;
        cursor: pointer;
        transition: transform 0.15s ease, box-shadow 0.15s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
      }

      .submit:disabled {
        opacity: 0.65;
        cursor: not-allowed;
      }

      .submit:not(:disabled):hover {
        transform: translateY(-1px);
        box-shadow: 0 15px 30px rgba(0, 0, 0, 0.33);
      }

      .spinner {
        width: 18px;
        height: 18px;
        border: 2px solid rgba(26, 26, 26, 0.4);
        border-top-color: rgba(26, 26, 26, 1);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      .footer {
        margin-top: 1.75rem;
        text-align: center;
        opacity: 0.85;
        font-size: 0.9rem;
      }

      .footer-content {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        align-items: center;
      }

      .register-section {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
        justify-content: center;
      }

      .register-link {
        color: #ff7a6c;
        text-decoration: none;
        font-weight: 600;
        transition: color 0.2s;
      }

      .register-link:hover {
        color: #ffb86c;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      @media (max-width: 480px) {
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

        .login-card {
          padding: 1.75rem 1.5rem;
        }

        .login-header h1 {
          font-size: 1.9rem;
        }

        .actions {
          flex-direction: column;
          align-items: flex-start;
        }

        .forgot {
          margin-top: 0.25rem;
        }

        .footer-content {
          gap: 0.75rem;
        }

        .register-section {
          flex-direction: column;
          gap: 0.25rem;
        }
      }
    `
  ]
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

