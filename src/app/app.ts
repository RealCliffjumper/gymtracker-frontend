import { Component, effect, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from "./shared/components/navbar/navbar";
import { UserService } from './core/services/user.service';
import { AsyncPipe } from '@angular/common';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { ScheduledworkoutService } from './core/services/scheduledworkout-service';
import { isBefore } from 'date-fns';
import { TimerService } from './core/services/timer.service';
import { notifications, workoutStartedAt } from './shared/signals/signals';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, 
    Navbar, 
    NzMenuModule,
    NzIconModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('gymtracker-fe');

  
  constructor(private userService: UserService, scheduledWorkoutService: ScheduledworkoutService, timerService: TimerService){
    effect(()=>{
        timerService.timerDisplay(),
        localStorage.setItem("timerDisplay", timerService.timerDisplay()),
        notifications,
        localStorage.setItem(
                'notifications',
                JSON.stringify(notifications())
              );
        })
    const token = localStorage.getItem('jwtToken');
    if (token) {
    this.userService.getUser().subscribe(user => {
      this.userService.setUser(user);
      
      const lastLogin = new Date(user.lastLoggedIn)
      console.log(lastLogin)  
      const today = new Date()
      const todayAtMidnight = new Date(today.setHours(0,0,0,0))

      //if (isBefore(lastLogin, todayAtMidnight)) {
        scheduledWorkoutService.refreshStatuses(user.userId).subscribe({
          next: () => console.log('Statuses refreshed'),
          error: (err) => console.error('Failed to refresh statuses', err)
        });
      //}
      
    });
}
}

  isAuthenticated = inject(UserService).isAuthenticated;
  
}
