import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NZ_MODAL_DATA, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { ScheduledworkoutService } from '../../core/services/scheduledworkout-service';
import { WorkoutExerciseService } from '../../core/services/workout-exercise.service';
import { WorkoutService } from '../../core/services/workout.service';
import { CalendarWorkoutDto } from '../models/calendarworkout.dto';
import { Workout } from '../models/workout';
import { WorkoutExerciseDto } from '../models/workout-exercise.dto';
import { ScheduledWorkout } from './scheduled-workout';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzListModule, NzListItemComponent } from 'ng-zorro-antd/list';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonComponent, NzButtonModule } from 'ng-zorro-antd/button';
import { ParseDatesPipe } from "../pipes/parse-dates-pipe";
import { isWorkoutStarted, workoutStartedAt } from '../signals/signals';
import { TimerService } from '../../core/services/timer.service';
import { ScheduledExercise } from '../models/scheduledexercise';
import { intervalToDuration} from 'date-fns';
import { MUSCLE_GROUPS } from '../models/musclegroups';
import { MUSCLE_GROUP_LABELS } from '../models/musclegroups-dictionary';

@Component({
  selector: 'app-scheduled-info',
  standalone: true,
  imports: [
    NzSelectModule,
    NzListModule,
    NzListItemComponent,
    FormsModule,
    CommonModule,
    NzButtonModule,
    ParseDatesPipe
],
  templateUrl: './scheduled-info.html',
  styleUrl: './scheduled-info.css'
})
export class ScheduledInfo {
  readonly nzModalData = inject(NZ_MODAL_DATA);
  scheduledWorkoutId: any
  visible: any

  workoutExerciseService = inject(WorkoutExerciseService)
  workoutService = inject(WorkoutService)
  scheduledWorkoutService = inject(ScheduledworkoutService)
  timerService = inject(TimerService)
  modalRef = inject(NzModalRef<ScheduledWorkout>)
  router = inject(Router)
  message = inject(NzMessageService)
  modal = inject(NzModalService)

  scheduledDate: any
  today = new Date()
  _duration: any

  scheduledWorkout = signal<CalendarWorkoutDto | null>(null)
  workout = signal<Workout | null>(null)
  scheduledExercises = signal<ScheduledExercise[]>([])
  musclegroup = MUSCLE_GROUPS
  musclegroup_dic = MUSCLE_GROUP_LABELS

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
    console.log('scheduled info')
    this.scheduledWorkoutId = this.nzModalData.InputData

    this.scheduledWorkoutService.getScheduledWorkout(this.scheduledWorkoutId).subscribe({
      next:(data)=> {
        this.scheduledWorkout.set(data)
        this.scheduledDate = data.workoutScheduledDate
        this.scheduledExercises.set(data.exercises)
        if(data.startedAt && data.completedAt){
          
          this._duration = intervalToDuration({
            start: this.timerService.localDateTimeArrayToDate(data.startedAt),
            end: this.timerService.localDateTimeArrayToDate(data.completedAt),
          });
        }
      }
    })

  }
  
  sumExercisePoints(i: number){
    const total = this.scheduledExercises()[i].sets
        .reduce((sum, s) => sum + s.setPoints!, 0);
      return total;
  }

  goToWorkout(workoutId: string){
    this.modalRef.close()
    this.router.navigate(['/workout',  workoutId])
  }

  saveAndCloseModal(){
    this.modalRef.close()
  }

  revertScheduled(id: string){
    this.scheduledWorkoutService.deleteScheduledWorkout(id).subscribe({
      next: () => {
        this.modalRef.close('success')
        console.log('deleted')
        
      },
      error: () =>{
        alert('no')
      }
    })
  }

  getSupersetColor(groupId: string | null): string {
    if (!groupId) return 'transparent';

    const hash = Array.from(groupId)
      .map(c => c.charCodeAt(0))
      .reduce((acc, val) => acc + val, 0);

    return this.supersetColors[hash % this.supersetColors.length];
  }

  openScheduledWorkoutModal(id: string, started: boolean){
    isWorkoutStarted.set(started)
    workoutStartedAt.set(new Date())
    this.timerService.timerSetup()

    this.modalRef.afterClose.subscribe(result => {
    if (result === 'success') {
      this.modal.create({
        nzTitle: 'Edit your scheduled workout',
        nzContent: ScheduledWorkout,
        nzData: {
          InputData: id,
          selectedDate: this.scheduledDate,
          started: started
        },
        nzFooter: null
      });
    }
    });

    this.modalRef.close('success');
  }
}
