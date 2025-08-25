import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { UserService } from "../services/user.service";
import { map } from "rxjs";

export const authRedirectGuard: CanActivateFn = () => {
  const userService = inject(UserService);
  const router = inject(Router);

  return userService.isAuthenticated.pipe(
    map(isAuth => {
      if (isAuth) {
        router.navigate(['/home']);
        return false;
      }
      return true;
    })
  );
};
