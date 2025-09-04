import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule} from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { WorkoutService } from '../../core/services/workout.service';
import { WorkoutDto } from '../../shared/models/workout.dto';
import { UserService } from '../../core/services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Workout } from '../../shared/models/workout';
import { ParseDatesPipe } from '../../shared/pipes/parse-dates-pipe';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-workout-page',
  standalone: true,
  imports: [
    NzFormModule,
    NzSelectModule,
    NzCardModule,
    ReactiveFormsModule,
    NzListModule,
    NzInputModule,
    ParseDatesPipe,
    CommonModule,
    NzButtonModule,
    NzModalModule,
  ],
  templateUrl: './workout-page.html',
  styleUrl: './workout-page.css'
})
export class WorkoutPage {

fb = inject(FormBuilder)
workoutService = inject(WorkoutService)
userService = inject(UserService)
router = inject(Router)
route = inject(ActivatedRoute)
modal = inject(NzModalService)
message = inject(NzMessageService)

workoutDto = signal<WorkoutDto>({
  workoutName: '',
  workoutDescription: '',
  createdAt: new Date()
})
workoutName = ''
workoutId = ''
workout: Workout | null = null;

createdAt = new Date();
updatedAt = new Date();

workoutForm = this.fb.group({
  workoutName: [''],
  workoutDescription: [''],
});

constructor() {
}

ngOnInit() {
    this.workoutName = this.route.snapshot.paramMap.get('workoutName')!;
    this.workoutId = this.route.snapshot.queryParamMap.get('id')!;

    if (this.workoutId) {
      this.workoutService.getWorkout(this.workoutId).subscribe(data => {
        this.workout = data;

        this.workoutForm.controls['workoutName'].setValue(this.workout.workoutName)
        this.workoutForm.controls['workoutDescription'].setValue(this.workout.workoutDescription)
        this.createdAt = this.workout.createdAt
        this.updatedAt = this.workout.updatedAt

        if (this.workoutName !== data.workoutName) {
          this.router.navigate(
            ['/workout', data.workoutName],
            {
              queryParams: { id: this.workoutId },
              replaceUrl: true
            }
          );
        }
      });
    } else {
      this.workoutForm.controls['workoutName'].setValue('New Workout')
      this.workoutForm.controls['workoutDescription'].setValue('')
    }
  }

onSave() {
  if(this.workout){
    this.updateWorkout()
  } else{
    this.createWorkout()
  }
}

createWorkout(){
  const user = this.userService.currentUser();
  if(user){
    const formValue = this.workoutForm.value;

    const updatedWorkoutDto: WorkoutDto = {
      createdAt: this.createdAt,
      workoutName: formValue.workoutName ?? '',
      workoutDescription: formValue.workoutDescription ?? ''
    };

    this.workoutService.createWorkout(user.userId, updatedWorkoutDto).subscribe({
        next: (createdWorkout) => {
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this.router.navigate(
              ['/workout', createdWorkout.workoutName || 'workout'],
              { queryParams: { id: createdWorkout.workoutId } }
            );
          });
        },
        error: (err) => {
          console.error('Failed to create workout:', err);
        }
    })
  }
}

updateWorkout(){
  const formValue = this.workoutForm.value;

  const updatedWorkout: WorkoutDto = {
     createdAt: this.createdAt,
     workoutName: formValue.workoutName ?? '',
     workoutDescription: formValue.workoutDescription ?? ''
   };

  this.workoutService.updateWorkout(this.workout!.workoutId,updatedWorkout).subscribe({
      next: () =>
        this.modal.success({
          nzTitle: 'Workout changed',
          nzContent: 'Applied changes to workout',
          nzOkText: 'OK'
        }),
      error: (err) => {
        if (err.status === 304) {
          this.message.warning('No changes were made');
          return;
        }
        this.message.error('Failed to workout');
      }
    });
}

deleteWorkout(){
  this.modal.confirm({
      nzTitle: '<i>Delete workout</i>',
      nzContent: '<b>Are you sure you want to delete this workout?</b>',
      nzOkText: 'Yes',
      nzOnOk: () => 
        [
          this.workoutService.deleteWorkout(this.workout!.workoutId).subscribe({
            next: () => this.router.navigate(['/workouts'])
          })
        ]
  });
  
}
}
