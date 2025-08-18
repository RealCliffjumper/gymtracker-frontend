import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import 'zone.js'
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { jwtInterceptor } from './app/core/interceptors/jwt.interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';

bootstrapApplication(App, {
 providers:[
  provideHttpClient(
    withInterceptors([jwtInterceptor])
  ),
  provideRouter(routes),
  provideAnimations()
 ] 
})
  .catch((err) => console.error(err));
