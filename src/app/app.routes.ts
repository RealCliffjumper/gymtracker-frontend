import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { UserService } from './core/services/user.service';
import { map } from 'rxjs';
import { authGuard } from './core/auth/auth.guard';
export const routes: Routes = [
    
    {
      path: '',
      loadComponent:() => import("./features/calendar/calendar").then(m => m.Calendar),
      canActivate: [authGuard],
    },
    {
      path: "auth",
      loadComponent:() => import("./core/auth/auth").then(m => m.Auth),
      canActivate: [
      () => inject(UserService).isAuthenticated.pipe(map((isAuth) => !isAuth)),
      ],
    }
];
