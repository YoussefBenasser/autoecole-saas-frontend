import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

function passwordsMatch(group: AbstractControl) {
  const pw = group.get('newPassword')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return pw === confirm ? null : { mismatch: true };
}

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="cp-wrapper">
      <!-- Animated background -->
      <div class="bg-orbs">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
      </div>

      <div class="cp-card">
        <!-- Icon -->
        <div class="card-icon">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>

        <div class="card-header">
          <h1>Changement de mot de passe</h1>
          <p>Votre compte a été activé avec un mot de passe provisoire. Veuillez définir votre propre mot de passe sécurisé pour continuer.</p>
        </div>

        <!-- Alert -->
        <div class="alert-banner">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Cette étape est obligatoire avant d'accéder à votre tableau de bord.</span>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="cp-form" autocomplete="off">
          <!-- Current password (provisional) -->
          <div class="field">
            <label for="currentPassword">Mot de passe provisoire actuel</label>
            <div class="input-wrapper">
              <svg class="input-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M8 11V7a4 4 0 118 0v4M5 11h14a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2z" />
              </svg>
              <input
                id="currentPassword"
                [type]="showCurrent ? 'text' : 'password'"
                formControlName="currentPassword"
                placeholder="Votre mot de passe provisoire"
                [class.invalid]="currentPassword?.invalid && (currentPassword?.dirty || currentPassword?.touched)"
              />
              <button type="button" class="toggle-pw" (click)="showCurrent = !showCurrent">
                <svg *ngIf="!showCurrent" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg *ngIf="showCurrent" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
            <div class="field-error" *ngIf="currentPassword?.invalid && (currentPassword?.dirty || currentPassword?.touched)">
              <span *ngIf="currentPassword?.errors?.['required']">Le mot de passe actuel est requis.</span>
            </div>
          </div>

          <!-- New & Confirm password group -->
          <div [formGroup]="$any(form.get('passwords'))">
          <!-- New password -->
          <div class="field">
            <label for="newPassword">Nouveau mot de passe</label>
            <div class="input-wrapper">
              <svg class="input-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <input
                id="newPassword"
                [type]="showNew ? 'text' : 'password'"
                formControlName="newPassword"
                placeholder="Minimum 8 caractères"
                [class.invalid]="newPassword?.invalid && (newPassword?.dirty || newPassword?.touched)"
              />
              <button type="button" class="toggle-pw" (click)="showNew = !showNew">
                <svg *ngIf="!showNew" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg *ngIf="showNew" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
            <div class="field-error" *ngIf="newPassword?.invalid && (newPassword?.dirty || newPassword?.touched)">
              <span *ngIf="newPassword?.errors?.['required']">Le nouveau mot de passe est requis.</span>
              <span *ngIf="newPassword?.errors?.['minlength']">Minimum 8 caractères requis.</span>
            </div>

            <!-- Strength bar -->
            <div class="strength-bar" *ngIf="newPassword?.value">
              <div class="strength-track">
                <div class="strength-fill" [style.width]="strengthPercent + '%'" [class]="strengthClass"></div>
              </div>
              <span class="strength-label" [class]="strengthClass">{{ strengthLabel }}</span>
            </div>
          </div>

          <!-- Confirm password -->
          <div class="field" style="margin-top: 1.25rem;">
            <label for="confirmPassword">Confirmer le nouveau mot de passe</label>
            <div class="input-wrapper">
              <svg class="input-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <input
                id="confirmPassword"
                [type]="showConfirm ? 'text' : 'password'"
                formControlName="confirmPassword"
                placeholder="Répétez le nouveau mot de passe"
                [class.invalid]="confirmPassword?.invalid && (confirmPassword?.dirty || confirmPassword?.touched)"
              />
              <button type="button" class="toggle-pw" (click)="showConfirm = !showConfirm">
                <svg *ngIf="!showConfirm" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg *ngIf="showConfirm" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
            <div class="field-error" *ngIf="confirmPassword?.dirty || confirmPassword?.touched">
              <span *ngIf="form.get('passwords')?.errors?.['mismatch']">Les mots de passe ne correspondent pas.</span>
            </div>
          </div>
          </div><!-- end passwords group -->

          <!-- Error / Success -->
          <div class="error-msg" *ngIf="errorMessage">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ errorMessage }}
          </div>
          <div class="success-msg" *ngIf="successMessage">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            {{ successMessage }}
          </div>

          <button type="submit" class="submit-btn" [disabled]="isLoading || form.invalid">
            <span *ngIf="!isLoading">Définir mon mot de passe</span>
            <span *ngIf="isLoading" class="spinner"></span>
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

    :host { display: block; min-height: 100vh; font-family: 'Inter', system-ui, sans-serif; }

    .cp-wrapper {
      min-height: 100vh;
      background: linear-gradient(160deg, #0d1117 0%, #161b22 50%, #0d1117 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      position: relative;
      overflow: hidden;
    }

    /* Animated background orbs */
    .bg-orbs { position: absolute; inset: 0; pointer-events: none; }
    .orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      animation: floatOrb 8s ease-in-out infinite;
    }
    .orb-1 { width: 400px; height: 400px; background: rgba(255, 122, 108, 0.12); top: -10%; left: -10%; animation-delay: 0s; }
    .orb-2 { width: 350px; height: 350px; background: rgba(59, 130, 246, 0.1); bottom: -5%; right: -5%; animation-delay: -3s; }
    .orb-3 { width: 280px; height: 280px; background: rgba(168, 85, 247, 0.08); top: 40%; left: 60%; animation-delay: -6s; }

    @keyframes floatOrb {
      0%, 100% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(20px, -20px) scale(1.05); }
      66% { transform: translate(-15px, 15px) scale(0.95); }
    }

    .cp-card {
      background: rgba(22, 27, 34, 0.9);
      backdrop-filter: blur(30px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 2.5rem;
      width: min(480px, 100%);
      box-shadow: 0 40px 80px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.04);
      position: relative;
      z-index: 1;
      animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes slideUp {
      from { transform: translateY(30px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    .card-icon {
      width: 60px;
      height: 60px;
      border-radius: 16px;
      background: linear-gradient(135deg, rgba(255, 122, 108, 0.2), rgba(255, 184, 108, 0.15));
      border: 1px solid rgba(255, 122, 108, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.5rem;
    }
    .card-icon svg { width: 28px; height: 28px; color: #ff7a6c; }

    .card-header { margin-bottom: 1.5rem; }
    .card-header h1 { font-size: 1.6rem; font-weight: 800; color: white; margin: 0 0 0.5rem; }
    .card-header p { font-size: 0.9rem; color: rgba(255,255,255,0.6); margin: 0; line-height: 1.6; }

    .alert-banner {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.85rem 1rem;
      border-radius: 12px;
      background: rgba(234, 179, 8, 0.1);
      border: 1px solid rgba(234, 179, 8, 0.25);
      color: rgba(253, 224, 71, 0.9);
      font-size: 0.85rem;
      margin-bottom: 1.75rem;
    }
    .alert-banner svg { flex-shrink: 0; }

    .cp-form { display: flex; flex-direction: column; gap: 1.25rem; }

    .field { display: flex; flex-direction: column; gap: 0.45rem; }
    .field label { font-size: 0.85rem; font-weight: 600; color: rgba(255,255,255,0.75); }

    .input-wrapper { position: relative; display: flex; align-items: center; }

    .input-icon {
      position: absolute; left: 0.875rem;
      width: 17px; height: 17px;
      color: rgba(255,255,255,0.35);
      pointer-events: none;
    }

    .input-wrapper input {
      width: 100%;
      padding: 0.875rem 3rem 0.875rem 2.6rem;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      color: white;
      font-size: 0.95rem;
      outline: none;
      transition: border 0.25s, box-shadow 0.25s, background 0.25s;
      font-family: inherit;
    }

    .input-wrapper input:focus {
      border-color: rgba(255, 122, 108, 0.5);
      box-shadow: 0 0 0 3px rgba(255, 122, 108, 0.1);
      background: rgba(255,255,255,0.07);
    }

    .input-wrapper input.invalid { border-color: rgba(239, 68, 68, 0.6); }
    .input-wrapper input::placeholder { color: rgba(255,255,255,0.25); }

    .toggle-pw {
      position: absolute; right: 0.75rem;
      background: none; border: none;
      color: rgba(255,255,255,0.4); cursor: pointer;
      padding: 0.25rem; display: flex; align-items: center;
      transition: color 0.2s;
    }
    .toggle-pw:hover { color: rgba(255,255,255,0.8); }

    .field-error { color: #fc8181; font-size: 0.8rem; }

    /* Strength bar */
    .strength-bar {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-top: 0.25rem;
    }
    .strength-track {
      flex: 1;
      height: 4px;
      border-radius: 4px;
      background: rgba(255,255,255,0.1);
      overflow: hidden;
    }
    .strength-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.3s ease, background 0.3s ease;
    }
    .strength-fill.weak { background: #ef4444; }
    .strength-fill.fair { background: #f97316; }
    .strength-fill.good { background: #eab308; }
    .strength-fill.strong { background: #22c55e; }

    .strength-label { font-size: 0.75rem; font-weight: 600; }
    .strength-label.weak { color: #ef4444; }
    .strength-label.fair { color: #f97316; }
    .strength-label.good { color: #eab308; }
    .strength-label.strong { color: #22c55e; }

    .error-msg {
      display: flex; align-items: flex-start; gap: 0.5rem;
      padding: 0.75rem 1rem; border-radius: 12px;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.25);
      color: #fc8181; font-size: 0.875rem; line-height: 1.4;
    }
    .error-msg svg { flex-shrink: 0; margin-top: 1px; }

    .success-msg {
      display: flex; align-items: flex-start; gap: 0.5rem;
      padding: 0.75rem 1rem; border-radius: 12px;
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid rgba(34, 197, 94, 0.25);
      color: #86efac; font-size: 0.875rem; line-height: 1.4;
    }
    .success-msg svg { flex-shrink: 0; margin-top: 1px; }

    .submit-btn {
      width: 100%;
      padding: 0.95rem;
      border: none;
      border-radius: 12px;
      background: linear-gradient(135deg, #ff7a6c, #ffb86c);
      color: #1a1a1a;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.18s, box-shadow 0.18s;
      box-shadow: 0 12px 30px rgba(255, 120, 110, 0.25);
      font-family: inherit;
    }

    .submit-btn:not(:disabled):hover {
      transform: translateY(-2px);
      box-shadow: 0 16px 40px rgba(255, 120, 110, 0.35);
    }
    .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

    .spinner {
      width: 20px; height: 20px;
      border: 2.5px solid rgba(26, 26, 26, 0.3);
      border-top-color: #1a1a1a;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class ChangePasswordComponent {
  form: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showCurrent = false;
  showNew = false;
  showConfirm = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Redirect away if mustChangePassword is not set
    if (!this.authService.mustChangePassword()) {
      this.authService.redirectToDashboard();
    }

    this.form = this.fb.group({
      currentPassword: ['', Validators.required],
      passwords: this.fb.group({
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required]
      }, { validators: passwordsMatch })
    });
  }

  get currentPassword() { return this.form.get('currentPassword'); }
  get newPassword() { return this.form.get('passwords.newPassword'); }
  get confirmPassword() { return this.form.get('passwords.confirmPassword'); }

  get strengthPercent(): number {
    const pw = this.newPassword?.value ?? '';
    if (pw.length < 6) return 25;
    if (pw.length < 8) return 50;
    const hasUpper = /[A-Z]/.test(pw);
    const hasNum = /\d/.test(pw);
    const hasSpecial = /[^a-zA-Z0-9]/.test(pw);
    const score = [hasUpper, hasNum, hasSpecial].filter(Boolean).length;
    return score === 3 ? 100 : score === 2 ? 75 : 50;
  }

  get strengthClass(): string {
    const p = this.strengthPercent;
    if (p <= 25) return 'weak';
    if (p <= 50) return 'fair';
    if (p <= 75) return 'good';
    return 'strong';
  }

  get strengthLabel(): string {
    const c = this.strengthClass;
    return { weak: 'Faible', fair: 'Moyen', good: 'Bon', strong: 'Fort' }[c] ?? '';
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const currentPassword = this.currentPassword?.value;
    const newPassword = this.newPassword?.value;

    this.authService.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Mot de passe changé avec succès ! Redirection vers votre tableau de bord...';
        this.authService.clearMustChangePassword();
        setTimeout(() => {
          this.router.navigate(['/tenant/dashboard']);
        }, 1800);
      },
      error: (err) => {
        this.isLoading = false;
        if (err?.status === 401) {
          this.errorMessage = 'Le mot de passe provisoire actuel est incorrect.';
        } else {
          this.errorMessage = err?.error?.message || 'Une erreur est survenue. Veuillez réessayer.';
        }
      }
    });
  }
}
