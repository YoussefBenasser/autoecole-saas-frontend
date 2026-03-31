import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService    = inject(AuthService);
  const router         = inject(Router);
  const allowedRoles   = route.data['roles'] as UserRole[];
  const userRole       = authService.getRole();

  if (userRole && allowedRoles.includes(userRole)) {
    return true;
  }

  // Redirect to correct dashboard based on role
  authService.redirectToDashboard();
  return false;
};
