import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const premiumGuard: CanActivateFn = () => {
  const router = inject(Router);

  if (typeof window === 'undefined') return false;

  const user = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
  const isPremium = user?.isPremium;

  if (!isPremium) {
    router.navigate(['/']);
    return false;
  }

  return true;
};
