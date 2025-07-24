import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);

  const isBrowser = typeof window !== 'undefined';
  const isLoggedIn = isBrowser && !!localStorage.getItem('loggedInUser');

  if (!isLoggedIn) {
    router.navigate(['/']);
    return false;
  }

  return true;
};
