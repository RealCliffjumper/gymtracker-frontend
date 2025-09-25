import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { map } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';

export const authGuard: CanActivateFn = (route, state) => {
  
  
  const userService = inject(UserService);
  const router = inject(Router);
  const message = inject(NzMessageService);

  if (!userService.isAuthenticated()) {
    router.navigate(['/home']);
    router.navigate(['/auth']); // redirect to auth page if not
    message.warning('Please login first');
    return false;
  }
  return true;
};
