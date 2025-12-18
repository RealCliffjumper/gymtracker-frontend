import { Component, inject, signal } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalComponent, NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { ExerciseService } from '../../core/services/exercise.service';
import { UserService } from '../../core/services/user.service';
import { Exercise } from '../../shared/models/exercise';
import { ExerciseForm } from '../../shared/components/exercise-form/exercise-form';
import { NzCardModule } from 'ng-zorro-antd/card';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzRowDirective, NzColDirective } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-exercises',
  standalone:true,
  imports: [
    NzCardModule,
    NzRowDirective,
    NzColDirective,
    CommonModule,
    NzButtonModule,
    NzIconModule,
    NzModalModule
  ],
  templateUrl: './exercises.html',
  styleUrl: './exercises.css'
})
export class Exercises {
  private userService = inject(UserService);
  private modal = inject(NzModalService);
  private exerciseService = inject(ExerciseService)
  private router = inject(Router)

  exercises = signal<Exercise[]>([]);
  loadingExercises = false;

  ngOnInit(){
    this.loadExercises()
  }

  loadExercises(): void {
    this.loadingExercises = true;
    const user = this.userService.currentUser();
    if(user){
      this.exerciseService.getUserExercises(user.userId).subscribe({
        next: (data) => {
            this.exercises.set(data);
            this.loadingExercises = false;
        },
        error: (err) => console.error('Error loading workouts', err)
      });
    }
  }

  openCreateExerciseModal(): void {
  
    const modalRef = this.modal.create({
      nzTitle: 'Create New Exercise',
      nzContent: ExerciseForm,
      nzOnOk: () => {
       this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate(
        ['/profile']
      );
      });
      },
      nzFooter: null
    });
    modalRef.afterClose.subscribe((result => {
      if(result){
        this.loadExercises()
      }
    }))
  }

  goToExercise(exercise: Exercise) {
    if (exercise) {
      this.router.navigate(['/exercise', exercise.exerciseName], {
        queryParams: { exid: exercise.exerciseId }
      });
    }
  }
}
