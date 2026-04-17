import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router      = inject(Router);

  return of(authService.isLoggedIn()).pipe(
    map(isLogged => {
      if (isLogged) {
        return true;
      }
      router.navigate(['/login']);
      return false;
    })
  );
};
