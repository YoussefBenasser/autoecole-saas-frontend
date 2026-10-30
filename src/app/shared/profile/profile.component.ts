import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-wrapper">
      <!-- Header -->
      <div class="page-header">
        <div class="header-icon">👤</div>
        <div>
          <h1 class="page-title">Mon Profil</h1>
          <p class="page-subtitle">Gérez vos informations personnelles</p>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Chargement du profil...</p>
      </div>

      <div *ngIf="!isLoading" class="profile-grid">
        <!-- Profile Card -->
        <div class="profile-card">
          <div class="avatar-section">
            <!-- Avatar with picture support -->
            <div class="avatar-wrapper">
              <div class="avatar-circle" *ngIf="!profile?.profilePictureUrl">
                {{ getInitials() }}
              </div>
              <img *ngIf="profile?.profilePictureUrl"
                   [src]="profile.profilePictureUrl"
                   alt="Photo de profil"
                   class="avatar-img"
                   (error)="onAvatarError($event)" />
              <!-- Upload button overlay -->
              <label class="avatar-upload-btn" for="avatar-upload" title="Changer la photo de profil">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </label>
              <input id="avatar-upload" type="file" accept="image/jpeg,image/png,image/webp"
                     (change)="onFileSelected($event)" style="display:none" />
            </div>
            <div class="avatar-info">
              <h2 class="avatar-name">{{ form.firstName }} {{ form.lastName }}</h2>
              <span class="role-badge">{{ getRoleLabel() }}</span>
            </div>
          </div>

          <!-- Picture preview + upload actions -->
          <div *ngIf="previewUrl" class="picture-preview-section">
            <div class="preview-label">Aperçu de la nouvelle photo :</div>
            <div class="preview-wrapper">
              <img [src]="previewUrl" alt="Aperçu" class="preview-img" />
              <div class="preview-actions">
                <button type="button" (click)="uploadPicture()" class="btn-upload-confirm" [disabled]="isUploadingPicture">
                  <span *ngIf="!isUploadingPicture">✅ Enregistrer</span>
                  <span *ngIf="isUploadingPicture" class="saving-spinner">
                    <span class="mini-spinner"></span> Upload...
                  </span>
                </button>
                <button type="button" (click)="cancelPreview()" class="btn-cancel-preview" [disabled]="isUploadingPicture">
                  ✕ Annuler
                </button>
              </div>
            </div>
          </div>

          <!-- Success/Error messages -->
          <div *ngIf="successMsg" class="success-banner">
            ✅ {{ successMsg }}
          </div>
          <div *ngIf="errorMsg" class="error-banner">
            ❌ {{ errorMsg }}
          </div>

          <!-- Personal Info Form -->
          <form (ngSubmit)="saveProfile()" #profileForm="ngForm">
            <div class="form-section">
              <h3 class="section-label">Informations personnelles</h3>

              <div class="form-row">
                <div class="form-group">
                  <label>Prénom</label>
                  <input type="text" [(ngModel)]="form.firstName" name="firstName" placeholder="Prénom" class="form-input" />
                </div>
                <div class="form-group">
                  <label>Nom</label>
                  <input type="text" [(ngModel)]="form.lastName" name="lastName" placeholder="Nom" class="form-input" />
                </div>
              </div>

              <div class="form-group">
                <label>Email</label>
                <input type="email" [(ngModel)]="form.email" name="email" placeholder="Email" class="form-input" />
              </div>

              <div class="form-group">
                <label>Téléphone</label>
                <input type="tel" [(ngModel)]="form.telephone" name="telephone" placeholder="Ex: 0550123456" class="form-input" />
              </div>
            </div>

            <!-- Password Change Section -->
            <div class="form-section">
              <h3 class="section-label">Changer le mot de passe <span class="optional">(optionnel)</span></h3>

              <div class="form-group">
                <label>Mot de passe actuel</label>
                <input type="password" [(ngModel)]="form.currentPassword" name="currentPassword" placeholder="Mot de passe actuel" class="form-input" />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Nouveau mot de passe</label>
                  <input type="password" [(ngModel)]="form.newPassword" name="newPassword" placeholder="Nouveau mot de passe" class="form-input" />
                </div>
                <div class="form-group">
                  <label>Confirmer</label>
                  <input type="password" [(ngModel)]="form.confirmPassword" name="confirmPassword" placeholder="Confirmer" class="form-input" />
                </div>
              </div>

              <div *ngIf="form.newPassword && form.newPassword !== form.confirmPassword" class="password-mismatch">
                ⚠️ Les mots de passe ne correspondent pas
              </div>
            </div>

            <div class="form-actions">
              <button type="button" (click)="resetForm()" class="btn-secondary">
                Annuler
              </button>
              <button
                type="submit"
                class="btn-primary"
                [disabled]="isSaving || (form.newPassword && form.newPassword !== form.confirmPassword)"
              >
                <span *ngIf="!isSaving">💾 Enregistrer</span>
                <span *ngIf="isSaving" class="saving-spinner">
                  <span class="mini-spinner"></span> Enregistrement...
                </span>
              </button>
            </div>
          </form>
        </div>

        <!-- Info Panel -->
        <div class="info-panel">
          <div class="info-card">
            <h3 class="info-title">📊 Récapitulatif</h3>
            <div class="info-row">
              <span class="info-label">Rôle</span>
              <span class="info-value role-text">{{ getRoleLabel() }}</span>
            </div>
            <div class="info-row" *ngIf="profile?.schoolName">
              <span class="info-label">École</span>
              <span class="info-value">{{ profile.schoolName }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email</span>
              <span class="info-value">{{ form.email }}</span>
            </div>
            <div class="info-row" *ngIf="form.telephone">
              <span class="info-label">Téléphone</span>
              <span class="info-value">{{ form.telephone }}</span>
            </div>
            <div class="info-row" *ngIf="profile?.profilePictureUrl">
              <span class="info-label">Photo de profil</span>
              <span class="info-value" style="color: #4ade80;">✓ Configurée</span>
            </div>
            <div class="info-row" *ngIf="!profile?.profilePictureUrl">
              <span class="info-label">Photo de profil</span>
              <span class="info-value" style="color: #94a3b8;">Non configurée</span>
            </div>
          </div>

          <div class="tips-card">
            <h3 class="info-title">💡 Conseils</h3>
            <ul class="tips-list">
              <li>Formats acceptés : JPEG, PNG, WebP (max 5 Mo)</li>
              <li>Utilisez un mot de passe fort (8+ caractères)</li>
              <li>Mettez à jour votre numéro de téléphone pour être contacté</li>
              <li>Votre email sert pour la connexion, changez-le avec précaution</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .page-wrapper { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

    .page-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; }
    .header-icon { font-size: 2rem; }
    .page-title {
      font-size: 1.75rem; font-weight: 800; margin: 0;
      background: linear-gradient(135deg, #fff 0%, #c7d2fe 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .page-subtitle { margin: 0.2rem 0 0; color: rgba(255,255,255,0.55); font-size: 0.875rem; }

    .loading-state {
      display: flex; flex-direction: column; align-items: center; gap: 1rem;
      padding: 4rem; color: rgba(255,255,255,0.5);
    }
    .spinner {
      width: 36px; height: 36px;
      border: 3px solid rgba(255,255,255,0.1); border-top-color: #6366f1;
      border-radius: 50%; animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .profile-grid {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 1.5rem;
    }

    .profile-card {
      background: rgba(255,255,255,0.04);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px;
      padding: 2rem;
    }

    .avatar-section {
      display: flex; align-items: center; gap: 1.25rem;
      margin-bottom: 2rem; padding-bottom: 1.5rem;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }

    /* Avatar wrapper with relative positioning for upload overlay */
    .avatar-wrapper {
      position: relative;
      width: 80px; height: 80px;
      flex-shrink: 0;
    }

    .avatar-circle {
      width: 80px; height: 80px; border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem; font-weight: 800; color: white;
      box-shadow: 0 8px 24px rgba(99,102,241,0.35);
    }

    .avatar-img {
      width: 80px; height: 80px; border-radius: 50%;
      object-fit: cover;
      border: 2px solid rgba(99,102,241,0.4);
      box-shadow: 0 8px 24px rgba(99,102,241,0.25);
    }

    .avatar-upload-btn {
      position: absolute;
      bottom: -4px; right: -4px;
      width: 28px; height: 28px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      transition: transform 0.2s ease;
      border: 2px solid #0f172a;
    }
    .avatar-upload-btn:hover { transform: scale(1.1); }
    .avatar-upload-btn svg { width: 14px; height: 14px; color: white; }

    /* Picture preview section */
    .picture-preview-section {
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: rgba(99,102,241,0.08);
      border: 1px solid rgba(99,102,241,0.2);
      border-radius: 12px;
    }

    .preview-label {
      font-size: 0.83rem; font-weight: 600; color: rgba(255,255,255,0.6);
      margin-bottom: 0.75rem;
    }

    .preview-wrapper {
      display: flex; align-items: center; gap: 1rem;
    }

    .preview-img {
      width: 72px; height: 72px; border-radius: 50%;
      object-fit: cover; border: 2px solid rgba(99,102,241,0.4);
    }

    .preview-actions {
      display: flex; flex-direction: column; gap: 0.5rem;
    }

    .btn-upload-confirm {
      padding: 0.5rem 1rem; border-radius: 10px;
      background: linear-gradient(135deg, #4ade80, #16a34a); color: white;
      border: none; font-size: 0.85rem; font-weight: 700;
      cursor: pointer; transition: all 0.2s; font-family: inherit;
    }
    .btn-upload-confirm:hover:not(:disabled) { transform: translateY(-1px); }
    .btn-upload-confirm:disabled { opacity: 0.55; cursor: not-allowed; }

    .btn-cancel-preview {
      padding: 0.5rem 1rem; border-radius: 10px;
      background: rgba(239,68,68,0.1); color: #f87171;
      border: 1px solid rgba(239,68,68,0.2); font-size: 0.85rem; font-weight: 600;
      cursor: pointer; transition: all 0.2s; font-family: inherit;
    }
    .btn-cancel-preview:hover:not(:disabled) { background: rgba(239,68,68,0.2); }

    .avatar-name { font-size: 1.2rem; font-weight: 700; color: white; margin: 0 0 0.4rem; }

    .role-badge {
      display: inline-block; padding: 0.25rem 0.75rem; border-radius: 20px;
      font-size: 0.78rem; font-weight: 600;
      background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.3); color: #a5b4fc;
    }

    .success-banner {
      padding: 0.85rem 1.25rem; border-radius: 12px; margin-bottom: 1.5rem;
      background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); color: #6ee7b7;
      font-size: 0.9rem;
    }

    .error-banner {
      padding: 0.85rem 1.25rem; border-radius: 12px; margin-bottom: 1.5rem;
      background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25); color: #fca5a5;
      font-size: 0.9rem;
    }

    .form-section { margin-bottom: 1.75rem; }

    .section-label {
      font-size: 0.875rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.06em; color: rgba(255,255,255,0.5);
      margin: 0 0 1rem;
    }

    .optional { font-weight: 400; color: rgba(255,255,255,0.35); text-transform: none; letter-spacing: 0; }

    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

    .form-group { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1rem; }

    .form-group label {
      font-size: 0.83rem; font-weight: 600; color: rgba(255,255,255,0.6);
    }

    .form-input {
      padding: 0.75rem 1rem;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 12px; color: white;
      font-size: 0.9rem; outline: none;
      transition: border 0.2s, box-shadow 0.2s;
      font-family: inherit;
    }

    .form-input:focus {
      border-color: rgba(99,102,241,0.5);
      box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
    }

    .form-input::placeholder { color: rgba(255,255,255,0.3); }

    .password-mismatch {
      font-size: 0.83rem; color: #fca5a5; padding: 0.5rem 0;
    }

    .form-actions {
      display: flex; gap: 0.75rem; justify-content: flex-end;
      margin-top: 1.5rem; padding-top: 1.5rem;
      border-top: 1px solid rgba(255,255,255,0.08);
    }

    .btn-secondary {
      padding: 0.75rem 1.5rem; border-radius: 12px;
      background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15);
      color: rgba(255,255,255,0.7); font-size: 0.9rem; font-weight: 600;
      cursor: pointer; transition: all 0.2s; font-family: inherit;
    }
    .btn-secondary:hover { background: rgba(255,255,255,0.1); color: white; }

    .btn-primary {
      padding: 0.75rem 1.75rem; border-radius: 12px;
      background: linear-gradient(135deg, #6366f1, #4f46e5); color: white;
      border: none; font-size: 0.9rem; font-weight: 700;
      cursor: pointer; transition: all 0.2s; font-family: inherit;
      box-shadow: 0 4px 14px rgba(99,102,241,0.3);
    }
    .btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(99,102,241,0.4); }
    .btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }

    .saving-spinner { display: flex; align-items: center; gap: 0.5rem; }
    .mini-spinner {
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.3); border-top-color: white;
      border-radius: 50%; animation: spin 0.8s linear infinite;
    }

    /* Info Panel */
    .info-panel { display: flex; flex-direction: column; gap: 1rem; }

    .info-card, .tips-card {
      background: rgba(255,255,255,0.04);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px; padding: 1.5rem;
    }

    .info-title { font-size: 0.9rem; font-weight: 700; color: rgba(255,255,255,0.8); margin: 0 0 1rem; }

    .info-row {
      display: flex; justify-content: space-between; align-items: flex-start;
      padding: 0.6rem 0; border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .info-row:last-child { border-bottom: none; }

    .info-label { font-size: 0.82rem; color: rgba(255,255,255,0.45); }
    .info-value { font-size: 0.85rem; font-weight: 600; color: rgba(255,255,255,0.85); text-align: right; max-width: 55%; word-break: break-all; }
    .role-text { color: #a5b4fc; }

    .tips-list { margin: 0; padding: 0 0 0 1.2rem; color: rgba(255,255,255,0.55); font-size: 0.83rem; line-height: 1.8; }

    @media (max-width: 900px) {
      .profile-grid { grid-template-columns: 1fr; }
      .form-row { grid-template-columns: 1fr; }
    }
  `]
})
export class ProfileComponent implements OnInit {
  profile: any = null;
  isLoading = true;
  isSaving = false;
  isUploadingPicture = false;
  successMsg = '';
  errorMsg = '';
  previewUrl: string | null = null;
  selectedFile: File | null = null;

  form = {
    firstName: '',
    lastName: '',
    email: '',
    telephone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  private originalForm: any = {};

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.http.get<any>(`${environment.apiUrl}/profile/me`).subscribe({
      next: (data) => {
        this.profile = data;
        this.form.firstName = data.firstName || '';
        this.form.lastName = data.lastName || '';
        this.form.email = data.email || '';
        this.form.telephone = data.telephone || '';
        this.originalForm = { ...this.form };
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      this.errorMsg = 'Format non autorisé. Utilisez JPEG, PNG ou WebP.';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.errorMsg = 'Le fichier dépasse 5 Mo.';
      return;
    }

    this.errorMsg = '';
    this.selectedFile = file;

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be reselected
    input.value = '';
  }

  cancelPreview(): void {
    this.previewUrl = null;
    this.selectedFile = null;
  }

  uploadPicture(): void {
    if (!this.selectedFile) return;

    this.isUploadingPicture = true;
    this.successMsg = '';
    this.errorMsg = '';

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.http.post<any>(`${environment.apiUrl}/profile/me/picture`, formData).subscribe({
      next: (res) => {
        this.isUploadingPicture = false;
        if (this.profile) {
          this.profile.profilePictureUrl = res.profilePictureUrl;
        }
        this.previewUrl = null;
        this.selectedFile = null;
        this.successMsg = res.message || 'Photo de profil mise à jour avec succès.';
        setTimeout(() => this.successMsg = '', 4000);
      },
      error: (err) => {
        this.isUploadingPicture = false;
        this.errorMsg = err?.error?.error || err?.error?.message || 'Erreur lors de l\'envoi de la photo.';
      }
    });
  }

  onAvatarError(event: Event): void {
    // If image fails to load, remove the url and show initials
    if (this.profile) {
      this.profile.profilePictureUrl = null;
    }
  }

  saveProfile(): void {
    if (this.form.newPassword && this.form.newPassword !== this.form.confirmPassword) {
      this.errorMsg = 'Les mots de passe ne correspondent pas.';
      return;
    }

    this.isSaving = true;
    this.successMsg = '';
    this.errorMsg = '';

    const payload: any = {
      firstName: this.form.firstName,
      lastName: this.form.lastName,
      email: this.form.email,
      telephone: this.form.telephone,
    };

    if (this.form.currentPassword && this.form.newPassword) {
      payload.currentPassword = this.form.currentPassword;
      payload.newPassword = this.form.newPassword;
    }

    this.http.put<any>(`${environment.apiUrl}/profile/me`, payload).subscribe({
      next: (res) => {
        this.isSaving = false;
        this.successMsg = res.message || 'Profil mis à jour avec succès.';
        this.form.currentPassword = '';
        this.form.newPassword = '';
        this.form.confirmPassword = '';
        this.originalForm = { ...this.form };
        // Auto-clear success message
        setTimeout(() => this.successMsg = '', 4000);
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMsg = err?.error?.error || err?.error?.message || 'Erreur lors de la mise à jour.';
      }
    });
  }

  resetForm(): void {
    this.form = { ...this.originalForm, currentPassword: '', newPassword: '', confirmPassword: '' };
    this.successMsg = '';
    this.errorMsg = '';
  }

  getInitials(): string {
    const first = this.form.firstName?.[0] || '';
    const last = this.form.lastName?.[0] || '';
    return (first + last).toUpperCase() || '?';
  }

  getRoleLabel(): string {
    const labels: Record<string, string> = {
      'STUDENT': 'Élève',
      'MONITOR': 'Moniteur',
      'ADMIN': 'Admin École',
      'TENANT_ADMIN': 'Admin École',
      'SUPER_ADMIN': 'Super Administrateur',
    };
    return labels[this.profile?.role] || this.profile?.role || 'Utilisateur';
  }
}
