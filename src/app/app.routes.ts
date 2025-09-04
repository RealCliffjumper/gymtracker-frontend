import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { authRedirectGuard } from './core/auth/auth.redirect.guard';
export const routes: Routes = [
    
    {
      path: '',
      redirectTo: 'home', pathMatch: 'full'
    },

    {
      path: 'home',
      loadComponent:() => import("./features/calendar/calendar").then(m => m.Calendar),
      canActivate: [authGuard],
    },

    {
      path: "auth",
      loadComponent:() => import("./core/auth/auth").then(m => m.Auth),
      canActivate: [authRedirectGuard],
    },
    
    {
      path: "profile",
      loadComponent:() => import("./features/profile/profile").then(m=> m.Profile),
      canActivate:[authGuard]
    },

    {
      path: "workouts",
      loadComponent:() => import("./features/workouts/workouts").then(m=> m.Workouts),
      canActivate:[authGuard]
    },

    {
      path: "workout/:workoutName",
      loadComponent:() => import("./features/workout-page/workout-page").then(m => m.WorkoutPage),
      canActivate:[authGuard]
    },
    
    {
      path: "plans",
      loadComponent:() => import("./features/plans/plans").then(m=> m.Plans),
      canActivate:[authGuard]
    },

    {
      path: 'not-found',
      loadComponent: () => import('./features/not-found/not-found').then(m => m.NotFound)
    },

    {
      path: '**',
      redirectTo: '/not-found'
    }
];
