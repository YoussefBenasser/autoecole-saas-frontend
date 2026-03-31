import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-setup-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <div class="logo">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          </div>
          <h2>Configuration du mot de passe</h2>
          <p>Choisissez un mot de passe sécurisé pour votre compte administrateur.</p>
        </div>

        <form [formGroup]="setupForm" (ngSubmit)="onSubmit()" class="auth-form">
          <div *ngIf="error" class="error-alert">
            {{ error }}
          </div>
          <div *ngIf="success" class="success-alert">
            Mot de passe configuré avec succès ! Redirection...
          </div>

          <div class="form-group">
            <label for="password">Nouveau mot de passe</label>
            <div class="input-container">
              <input 
                type="password" 
                id="password" 
                formControlName="password" 
                placeholder="Votre mot de passe secret"
                [class.has-error]="isFieldInvalid('password')"
              >
            </div>
            <div class="error-message" *ngIf="isFieldInvalid('password')">
              Le mot de passe est requis (min. 6 caractères).
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirmer le mot de passe</label>
            <div class="input-container">
              <input 
                type="password" 
                id="confirmPassword" 
                formControlName="confirmPassword" 
                placeholder="Veuillez confirmer le mot de passe"
                [class.has-error]="isFieldInvalid('confirmPassword') || setupForm.errors?.['mismatch']"
              >
            </div>
            <div class="error-message" *ngIf="isFieldInvalid('confirmPassword') || setupForm.errors?.['mismatch']">
              Les mots de passe ne correspondent pas.
            </div>
          </div>

          <button type="submit" class="submit-btn" [disabled]="setupForm.invalid || isLoading || !token">
            <span *ngIf="!isLoading">Valider</span>
            <span *ngIf="isLoading" class="spinner"></span>
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      .auth-container {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, rgba(18, 27, 50, 0.9), rgba(10, 12, 25, 0.9)),
          url('https://templatemo.com/templates/templatemo_583_festava_live/assets/images/slide-01.jpg') center/cover no-repeat;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        padding: 2rem;
      }
      .auth-card {
        background: rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        padding: 3rem;
        width: 100%;
        max-width: 480px;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
      }
      .auth-header {
        text-align: center;
        margin-bottom: 2.5rem;
      }
      .logo {
        width: 60px;
        height: 60px;
        margin: 0 auto 1.5rem;
        background: linear-gradient(135deg, #ff7a6c 0%, #ffb86c 100%);
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 10px 25px rgba(255, 120, 110, 0.3);
      }
      .logo svg {
        width: 30px;
        height: 30px;
        color: #1a1a1a;
      }
      h2 {
        color: white;
        font-size: 1.8rem;
        font-weight: 700;
        margin: 0 0 0.5rem;
      }
      p {
        color: rgba(255, 255, 255, 0.7);
        margin: 0;
        font-size: 0.95rem;
      }
      .form-group {
        margin-bottom: 1.5rem;
      }
      label {
        display: block;
        color: rgba(255, 255, 255, 0.9);
        font-size: 0.9rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
      }
      .input-container input {
        width: 100%;
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.15);
        padding: 0.8rem 1rem;
        border-radius: 10px;
        color: white;
        font-size: 1rem;
        transition: all 0.3s ease;
      }
      .input-container input:focus {
        outline: none;
        border-color: #ffb86c;
        background: rgba(0, 0, 0, 0.5);
      }
      .input-container input.has-error {
        border-color: #ef4444;
      }
      .error-message {
        color: #ef4444;
        font-size: 0.8rem;
        margin-top: 0.4rem;
      }
      .error-alert, .success-alert {
        padding: 1rem;
        border-radius: 10px;
        margin-bottom: 1.5rem;
        font-size: 0.9rem;
        text-align: center;
      }
      .error-alert {
        background: rgba(239, 68, 68, 0.15);
        color: #fca5a5;
        border: 1px solid rgba(239, 68, 68, 0.3);
      }
      .success-alert {
        background: rgba(34, 197, 94, 0.15);
        color: #86efac;
        border: 1px solid rgba(34, 197, 94, 0.3);
      }
      .submit-btn {
        width: 100%;
        padding: 0.9rem;
        background: linear-gradient(135deg, #ff7a6c 0%, #ffb86c 100%);
        color: #1a1a1a;
        border: none;
        border-radius: 10px;
        font-size: 1rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.3s ease;
        margin-top: 1rem;
      }
      .submit-btn:hover:not([disabled]) {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(255, 120, 110, 0.3);
      }
      .submit-btn[disabled] {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .spinner {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 2px solid rgba(26, 26, 26, 0.2);
        border-top-color: #1a1a1a;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `
  ]
})
export class SetupPasswordComponent implements OnInit {
  setupForm: FormGroup;
  isLoading = false;
  error = '';
  success = false;
  token: string | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.setupForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token');
    if (!this.token) {
      this.error = "Token manquant ou invalide. Veuillez vérifier le lien reçu par email.";
    }
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  isFieldInvalid(field: string): boolean {
    const control = this.setupForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit() {
    if (this.setupForm.invalid || !this.token) return;

    this.isLoading = true;
    this.error = '';

    const password = this.setupForm.value.password;

    this.http.post(`${environment.apiUrl}/auth/setup-password?token=${this.token}`, { password }, { responseType: 'text' })
      .subscribe({
        next: () => {
          this.success = true;
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (err) => {
          this.error = err.error || "Une erreur s'est produite lors de la configuration du mot de passe.";
          this.isLoading = false;
        }
      });
  }
}
