import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-tenant-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="signup-page">
      <div class="signup-card">
        <a routerLink="/register" class="back-button" aria-label="Retour au choix du compte">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Retour aux choix
        </a>
        <div class="signup-header">
          <h1>Créez votre école de conduite</h1>
          <p>Inscrivez votre auto-école pour gérer votre plateforme</p>
        </div>

        <form [formGroup]="signupForm" (ngSubmit)="onSubmit()" class="signup-form">
          <div class="field">
            <label for="name">Nom de l'école</label>
            <input
              id="name"
              type="text"
              formControlName="name"
              placeholder="Auto-école ABC"
              [class.invalid]="name?.invalid && (name?.dirty || name?.touched)"
            />
            <div class="field-error" *ngIf="name?.invalid && (name?.dirty || name?.touched)">
              <span *ngIf="name?.errors?.['required']">Le nom est requis.</span>
            </div>
          </div>

          <div class="field">
            <label for="email">Adresse e-mail</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="contact@autoecole.com"
              [class.invalid]="email?.invalid && (email?.dirty || email?.touched)"
            />
            <div class="field-error" *ngIf="email?.invalid && (email?.dirty || email?.touched)">
              <span *ngIf="email?.errors?.['required']">L'e-mail est requis.</span>
              <span *ngIf="email?.errors?.['email']">Veuillez saisir un e-mail valide.</span>
            </div>
          </div>

          <div class="field">
            <label for="governorate">Gouvernorat</label>
            <select
              id="governorate"
              formControlName="governorate"
              [class.invalid]="governorate?.invalid && (governorate?.dirty || governorate?.touched)"
            >
              <option value="">Sélectionnez un gouvernorat</option>
              <option *ngFor="let g of governorates" [value]="g">{{ g }}</option>
            </select>
            <div class="field-error" *ngIf="governorate?.invalid && (governorate?.dirty || governorate?.touched)">
              <span *ngIf="governorate?.errors?.['required']">Le gouvernorat est requis.</span>
            </div>
          </div>

          <div class="field">
            <label for="address">Adresse</label>
            <input
              id="address"
              type="text"
              formControlName="address"
              placeholder="Rue, Quartier, Point de repère"
              [class.invalid]="address?.invalid && (address?.dirty || address?.touched)"
            />
            <div class="field-error" *ngIf="address?.invalid && (address?.dirty || address?.touched)">
              <span *ngIf="address?.errors?.['required']">L'adresse est requise.</span>
            </div>
          </div>

          <div class="error-message" *ngIf="errorMessage">{{ errorMessage }}</div>

          <button class="submit" type="submit" [disabled]="isLoading || signupForm.invalid">
            <span *ngIf="!isLoading">Créer l'école</span>
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
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        color: rgba(255, 255, 255, 0.6);
        text-decoration: none;
        font-weight: 600;
        font-size: 0.9rem;
        margin-bottom: 1.5rem;
        transition: color 0.2s, transform 0.2s;
      }

      .back-button svg {
        width: 16px;
        height: 16px;
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

      select {
        padding: 0.9rem 1rem;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.35);
        background: rgba(0, 0, 0, 0.35);
        color: #ffffff;
        outline: none;
        font-size: 1rem;
        transition: border 0.2s ease, box-shadow 0.2s ease;
        cursor: pointer;
        appearance: none;
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
        background-position: right 0.5rem center;
        background-repeat: no-repeat;
        background-size: 1.5em 1.5em;
        padding-right: 2.5rem;
      }

      select:focus {
        border-color: rgba(255, 255, 255, 0.75);
        box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.18);
      }

      select option {
        background: rgba(0, 0, 0, 0.9);
        color: #ffffff;
        padding: 0.5rem;
      }

      select.invalid {
        border-color: rgba(255, 100, 100, 0.9);
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
        background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
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
export class TenantSignupComponent {
  signupForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  governorates = [
    'Tunis',
    'Ariana',
    'Ben Arous',
    'Manouba',
    'Nabeul',
    'Zaghouan',
    'Bizerte',
    'Béja',
    'Jendouba',
    'Kef',
    'Siliana',
    'Kairouan',
    'Kasserine',
    'Sidi Bouzid',
    'Sfax',
    'Monastir',
    'Mahdia',
    'Sousse',
    'Kébili',
    'Gabès',
    'Medenine',
    'Tataouine',
    'Gafsa',
    'Tozeur'
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      governorate: ['', Validators.required],
      address: ['', Validators.required]
    });
  }

  get name() {
    return this.signupForm.get('name');
  }

  get email() {
    return this.signupForm.get('email');
  }

  get governorate() {
    return this.signupForm.get('governorate');
  }

  get address() {
    return this.signupForm.get('address');
  }

  onSubmit(): void {
    if (this.signupForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const formValue = this.signupForm.value;
    const fullAddress = `${formValue.governorate} - ${formValue.address}`;

    const payload = {
      name: formValue.name,
      email: formValue.email,
      address: fullAddress
    };

    this.http.post(`${environment.apiUrl}/tenants/register`, payload).subscribe({
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
