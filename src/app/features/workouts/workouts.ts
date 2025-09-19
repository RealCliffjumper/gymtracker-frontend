import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzColDirective, NzRowDirective } from 'ng-zorro-antd/grid';
import { WorkoutService } from '../../core/services/workout.service';
import { Workout } from '../../shared/models/workout';
import { UserService } from '../../core/services/user.service';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  selector: 'app-workouts',
  standalone:true,
  imports: [
    NzCardModule,
    NzRowDirective,
    NzColDirective,
    CommonModule,
    NzButtonModule
  ],
  templateUrl: './workouts.html',
  styleUrl: './workouts.css'
})
export class Workouts {

  router = inject(Router);
  workoutService = inject(WorkoutService);
  userService = inject(UserService);
  workouts = signal<Workout[]>([]);
  
  constructor(){}

  ngOnInit(): void{
    this.loadWorkouts();
  }

  loadWorkouts(): void {
   const user = this.userService.currentUser();
   if(user){
   this.workoutService.getUserWorkouts(user.userId).subscribe({
     next: (data) => this.workouts.set(data),
     error: (err) => console.error('Error loading workouts', err)
   });
  }
  }

  goToWorkout(workout?: Workout) {
  if (workout) {
    this.router.navigate(['/workout', workout.workoutName || 'workout'], {
      queryParams: { id: workout.workoutId }
    });
  } else {
    this.router.navigate(['/workout', 'new-workout']);
  }
}
}
