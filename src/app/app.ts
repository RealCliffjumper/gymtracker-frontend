import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from "./shared/components/navbar/navbar";
import { UserService } from './core/services/user.service';
import { AsyncPipe } from '@angular/common';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, 
    Navbar, 
    AsyncPipe, 
    NzMenuModule,
    NzIconModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('gymtracker-fe');

  
  constructor(){}

  isAuthenticated$ = inject(UserService).isAuthenticated;
  
}
