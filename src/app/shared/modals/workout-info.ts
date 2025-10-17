import { Component, inject, Input, signal } from '@angular/core';
import { BaseModal } from './base-modal';
import { WorkoutExerciseDto } from '../models/workout-exercise.dto';
import { WorkoutExerciseService } from '../../core/services/workout-exercise.service';
import { NzListModule } from 'ng-zorro-antd/list';
import { CommonModule } from '@angular/common';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { Workout } from '../models/workout';
import { WorkoutService } from '../../core/services/workout.service';
import { Router } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  selector: 'app-workout-info',
  imports: [
    NzListModule,
    CommonModule,
    NzButtonModule
  ],
  templateUrl: './workout-info.html',
  styleUrl: './workout-info.css'
})
export class WorkoutInfo {
  
  readonly nzModalData = inject(NZ_MODAL_DATA);
  workoutId: any
  visible: any

  workoutExerciseService = inject(WorkoutExerciseService)
  workoutService = inject(WorkoutService)
  modalRef = inject(NzModalRef<WorkoutInfo>)
  router = inject(Router)

  workout = signal<Workout | null>(null)
  workoutExercises = signal<WorkoutExerciseDto[]>([])

  supersetColors: string[] = [
  '#4caf50', // green
  '#ffeb3b', // yellow
  '#f44336', // red
  '#2196f3', // blue
  '#9c27b0', // purple
  '#ff9800', // orange
  '#00bcd4', // cyan
  '#8bc34a', // light green
  '#e91e63', // pink
  '#795548', // brown
];


  ngOnInit(){
   
    this.workoutId = this.nzModalData.InputData

    this.workoutService.getWorkout(this.workoutId).subscribe({
      next:(data)=> {
        this.workout.set(data)
      }
    })
    this.workoutExerciseService.getAllWorkoutExercises(this.workoutId).subscribe({
      next: (ex)=> this.workoutExercises.set(ex)
    })

  }

  goToWorkout(workoutId: string){
    this.closeModal()
    this.router.navigate(['/workout',  workoutId])
  }

  closeModal(){
    this.modalRef.close()
  }

  getSupersetColor(groupId: string | null): string {
  if (!groupId) return 'transparent';

  const hash = Array.from(groupId)
    .map(c => c.charCodeAt(0))
    .reduce((acc, val) => acc + val, 0);

  return this.supersetColors[hash % this.supersetColors.length];
}
}
