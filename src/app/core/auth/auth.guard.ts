import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  
  
  const userService = inject(UserService);
  const router = inject(Router);

  return userService.isAuthenticated.pipe(

    map(isAuth => {

      if (!isAuth) {
        router.navigate(['/auth']); // redirect to auth page if not
        return false;
      }
      return true;

    })
  );
};