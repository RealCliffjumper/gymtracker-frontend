import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptors } from '@angular/common/http';
import 'zone.js'
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { jwtInterceptor } from './app/core/interceptors/jwt.interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { FormsModule } from '@angular/forms';
import { EnvironmentInjector, importProvidersFrom, inject, Injector, provideAppInitializer, runInInjectionContext } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { UserService } from './app/core/services/user.service';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { tap } from 'rxjs/internal/operators/tap';
import { catchError } from 'rxjs/internal/operators/catchError';
import { of } from 'rxjs/internal/observable/of';

export function appInitializer(injector: Injector) {
  return () => {
    return runInInjectionContext(injector, () => {
      const userService = inject(UserService);
      const token = localStorage.getItem('jwtToken');

      if (token) {
        return firstValueFrom(
          userService.getUser().pipe(
            tap(user => userService.setUser(user)),
            catchError(() => of(null)) // prevent bootstrap failure
          )
        );
      }

      return Promise.resolve();
    });
  };
}

registerLocaleData(en);


bootstrapApplication(App, {
 providers:[
  provideHttpClient(withInterceptors([jwtInterceptor])),
  provideRouter(routes),
  provideAnimations(), provideNzI18n(en_US), importProvidersFrom(FormsModule), provideAnimationsAsync(), provideHttpClient(),
  provideAppInitializer(() => appInitializer(inject(EnvironmentInjector))())
 ] 
})  
  .catch((err) => console.error(err));

