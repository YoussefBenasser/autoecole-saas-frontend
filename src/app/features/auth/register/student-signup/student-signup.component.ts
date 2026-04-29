import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-student-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="signup-page">
      <div class="signup-card">
        <a routerLink="/register" class="back-button" aria-label="Retour au choix du compte">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Retour aux choix
        </a>
        <div class="signup-header">
          <h1>Inscrivez-vous en tant qu'élève</h1>
          <p>Créez votre compte pour commencer à suivre vos leçons</p>
        </div>

        <form [formGroup]="signupForm" (ngSubmit)="onSubmit()" class="signup-form">
          <div class="field">
            <label for="firstName">Prénom</label>
            <input
              id="firstName"
              type="text"
              formControlName="firstName"
              placeholder="Votre prénom"
              [class.invalid]="firstName?.invalid && (firstName?.dirty || firstName?.touched)"
            />
            <div class="field-error" *ngIf="firstName?.invalid && (firstName?.dirty || firstName?.touched)">
              <span *ngIf="firstName?.errors?.['required']">Le prénom est requis.</span>
            </div>
          </div>

          <div class="field">
            <label for="lastName">Nom</label>
            <input
              id="lastName"
              type="text"
              formControlName="lastName"
              placeholder="Votre nom"
              [class.invalid]="lastName?.invalid && (lastName?.dirty || lastName?.touched)"
            />
            <div class="field-error" *ngIf="lastName?.invalid && (lastName?.dirty || lastName?.touched)">
              <span *ngIf="lastName?.errors?.['required']">Le nom est requis.</span>
            </div>
          </div>

          <div class="field">
            <label for="email">Adresse e-mail</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="votre@email.com"
              [class.invalid]="email?.invalid && (email?.dirty || email?.touched)"
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
              />
              <button type="button" class="toggle-password" (click)="togglePassword()">
                {{ showPassword ? 'Masquer' : 'Afficher' }}
              </button>
            </div>
            <div class="field-error" *ngIf="password?.invalid && (password?.dirty || password?.touched)">
              <span *ngIf="password?.errors?.['required']">Le mot de passe est requis.</span>
              <span *ngIf="password?.errors?.['minlength']">Minimum 6 caractères.</span>
            </div>
          </div>

          <div class="field">
            <label for="level">Niveau de permis</label>
            <select id="level" formControlName="level" [class.invalid]="level?.invalid && (level?.dirty || level?.touched)">
              <option value="" disabled>Sélectionnez un niveau</option>
              <option value="B">Permis B (VP)</option>
              <option value="A">Permis A (Moto)</option>
              <option value="A2">Permis A2 (Moto)</option>
              <option value="BE">Permis BE (Remorque)</option>
            </select>
            <div class="field-error" *ngIf="level?.invalid && (level?.dirty || level?.touched)">
              <span *ngIf="level?.errors?.['required']">Le niveau est requis.</span>
            </div>
          </div>

          <div class="field">
            <label for="telephone">Téléphone</label>
            <input
              id="telephone"
              type="tel"
              formControlName="telephone"
              placeholder="06 12 34 56 78"
            />
          </div>

          <div class="error-message" *ngIf="errorMessage">{{ errorMessage }}</div>

          <button class="submit" type="submit" [disabled]="isLoading || signupForm.invalid">
            <span *ngIf="!isLoading">S'inscrire</span>
            <span *ngIf="isLoading" class="spinner" aria-label="Chargement"></span>
          </button>
        </form>

        <div class="footer">
          <span>Vous avez un compte? <a routerLink="/login" class="link">Se connecter</a></span>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        color: #ffffff;
      }

      .signup-page {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
      }

      .signup-card {
        width: min(480px, 100%);
        padding: 1rem 0;
      }

      .back-button {
        position: relative;
        z-index: 10;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        color: rgba(255, 255, 255, 0.6);
        text-decoration: none;
        font-weight: 600;
        font-size: 0.95rem;
        margin-bottom: 1.5rem;
        transition: color 0.2s, transform 0.2s;
        cursor: pointer;
      }

      .back-button svg {
        width: 20px;
        height: 20px;
      }

      .back-button:hover {
        color: #ffffff;
        transform: translateX(-3px);
      }

      .signup-header {
        margin-bottom: 1.75rem;
      }

      .signup-header h1 {
        font-size: 2.25rem;
        margin: 0 0 0.5rem;
        letter-spacing: 0.02em;
      }

      .signup-header p {
        margin: 0;
        opacity: 0.85;
        line-height: 1.5;
      }

      .signup-form {
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

      input,
      select {
        padding: 0.9rem 1rem;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.35);
        background: rgba(0, 0, 0, 0.35);
        color: #ffffff;
        outline: none;
        font-size: 1rem;
        transition: border 0.2s ease, box-shadow 0.2s ease;
      }

      input:focus,
      select:focus {
        border-color: rgba(255, 255, 255, 0.75);
        box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.18);
      }

      input.invalid,
      select.invalid {
        border-color: rgba(255, 100, 100, 0.9);
      }

      select option {
        background: #1a1a1a;
        color: #ffffff;
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

      .error-message {
        padding: 0.75rem 1rem;
        border-radius: 12px;
        background: rgba(255, 80, 80, 0.18);
        border: 1px solid rgba(255, 80, 80, 0.35);
        color: rgba(255, 255, 255, 0.9);
        font-size: 0.95rem;
      }

      .submit {
        width: 100%;
        padding: 0.95rem 1rem;
        border: none;
        border-radius: 12px;
        background: linear-gradient(135deg, #818cf8 0%, #06b6d4 100%);
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

      .link {
        color: #ff7a6c;
        text-decoration: none;
        font-weight: 700;
        transition: color 0.2s;
      }

      .link:hover {
        color: #ffb86c;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      @media (max-width: 480px) {
        .signup-card {
          padding: 1.75rem 1.5rem;
        }

        .signup-header h1 {
          font-size: 1.9rem;
        }
      }
    `
  ]
})
export class StudentSignupComponent {
  signupForm: FormGroup;
  isLoading = false;
  showPassword = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      level: ['', Validators.required],
      telephone: ['']
    });
  }

  get firstName() { return this.signupForm.get('firstName'); }
  get lastName() { return this.signupForm.get('lastName'); }
  get email() { return this.signupForm.get('email'); }
  get password() { return this.signupForm.get('password'); }
  get level() { return this.signupForm.get('level'); }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.signupForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    // Map Angular form fields to backend expected fields
    const payload = {
      email: this.signupForm.value.email,
      password: this.signupForm.value.password,
      nom: this.signupForm.value.lastName,       // backend expects 'nom'
      prenom: this.signupForm.value.firstName    // backend expects 'prenom'
    };

    this.http.post(`${environment.apiUrl}/auth/student/register`, payload, { responseType: 'text' }).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Erreur lors de l\'inscription. Veuillez réessayer.';
      }
    });
  }
}
