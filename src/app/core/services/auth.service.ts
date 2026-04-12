import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, UserRole } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly TOKEN_KEY = 'auth_token';
  private readonly ROLE_KEY = 'auth_role';
  private readonly EMAIL_KEY = 'auth_email';
  private readonly TENANT_KEY = 'auth_tenant';

  constructor(private http: HttpClient, private router: Router) { }

  /**
   * POST /api/auth/login — backend returns a raw JWT string (not JSON).
   * We decode the payload to extract role, email, and tenantId.
   */
  login(request: LoginRequest): Observable<string> {
    return this.http.post(`${environment.apiUrl}/auth/login`, request, { responseType: 'text' }).pipe(
      tap((token: string) => {
        localStorage.setItem(this.TOKEN_KEY, token);

        // Decode JWT payload (base64url)
        try {
          const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));

          let rawRole: unknown = payload.role ?? '';

          if (!rawRole && Array.isArray(payload.roles) && payload.roles.length > 0) {
            rawRole = payload.roles[0];
          }

          if (!rawRole && Array.isArray(payload.authorities) && payload.authorities.length > 0) {
            const authority = payload.authorities[0];
            if (typeof authority === 'string') {
              rawRole = authority;
            } else if (authority?.authority) {
              rawRole = authority.authority;
            } else if (authority?.role) {
              rawRole = authority.role;
            }
          }

          const role = this.normalizeRole(rawRole);
          const email = payload.sub ?? payload.email ?? '';

          // Store tenantId from JWT (null if student has no tenant yet)
          const tenantId = payload.tenantId ?? payload.tenant_id ?? null;

          localStorage.setItem(this.ROLE_KEY, role);
          localStorage.setItem(this.EMAIL_KEY, email);

          if (tenantId) {
            localStorage.setItem(this.TENANT_KEY, tenantId);
          } else {
            localStorage.removeItem(this.TENANT_KEY);
          }

        } catch (e) {
          console.error('Failed to decode JWT payload', e);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.ROLE_KEY);
    localStorage.removeItem(this.EMAIL_KEY);
    localStorage.removeItem(this.TENANT_KEY);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  resendSetupLink(email: string) {
    return this.http.post(`${environment.apiUrl}/auth/resend-setup-link`, { email }, { responseType: 'text' });
  }

  getRole(): UserRole | null {
    return localStorage.getItem(this.ROLE_KEY) as UserRole | null;
  }

  getTenantId(): string | null {
    return localStorage.getItem(this.TENANT_KEY);
  }

  hasTenant(): boolean {
    return !!localStorage.getItem(this.TENANT_KEY);
  }

  private normalizeRole(rawRole: unknown): string {
    if (!rawRole) {
      return '';
    }

    let role = String(rawRole).toUpperCase().trim();
    if (role.startsWith('ROLE_')) {
      role = role.replace(/^ROLE_/, '');
    }

    // Map any common tenant role variants to TENANT_ADMIN
    if (role === 'TENANT' || role === 'TENANT_ADMIN' || role === 'ADMIN_TENANT' || role === 'ADMIN') {
      return 'TENANT_ADMIN';
    }

    // Map ELEVE to STUDENT so it matches route guards and dashboard redirect
    if (role === 'ELEVE') {
      return 'STUDENT';
    }

    if (role === 'SUPER_ADMIN' || role === 'MONITOR' || role === 'STUDENT') {
      return role;
    }

    return role;
  }

  getEmail(): string | null {
    return localStorage.getItem(this.EMAIL_KEY);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      // Check expiry
      if (payload.exp && Date.now() / 1000 > payload.exp) {
        this.logout();
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  redirectToDashboard(): void {
      const role = this.getRole();
      if (role === 'SUPER_ADMIN') {
        this.router.navigate(['/super-admin/dashboard']);
      } else if (role === 'TENANT_ADMIN') {
        this.router.navigate(['/tenant/dashboard']);
      } else if (role === 'STUDENT') {
        // If student has no tenant yet, send them to choose a school
        const hasTenant = this.getTenantId() !== null;
        if (hasTenant) {
          this.router.navigate(['/student/dashboard']);
        } else {
          this.router.navigate(['/student/choose-school']);
        }
      } else if (role === 'MONITOR') {
        this.router.navigate(['/monitor/dashboard']);
      } else {
        this.router.navigate(['/login']);
      }
    }
  }
