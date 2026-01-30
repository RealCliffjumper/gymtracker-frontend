import { Component, inject, Input, signal } from '@angular/core';
import { WorkoutExerciseDto } from '../models/workout-exercise.dto';
import { WorkoutExerciseService } from '../../core/services/workout-exercise.service';
import { NzListModule } from 'ng-zorro-antd/list';
import { CommonModule } from '@angular/common';
import { NZ_MODAL_DATA, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { Workout } from '../models/workout';
import { WorkoutService } from '../../core/services/workout.service';
import { Router } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { ScheduledInfo } from './scheduled-info';
import { ScheduledWorkout } from './scheduled-workout';
import { ScheduledworkoutService } from '../../core/services/scheduledworkout-service';
import { UserService } from '../../core/services/user.service';
import { WORKOUT_STATUS } from '../models/workoutstatus';
import { isEqual } from 'date-fns';
import { isWorkoutStarted, workoutStartedAt } from '../signals/signals';
import { TimerService } from '../../core/services/timer.service';
import { MUSCLE_GROUPS } from '../models/musclegroups';
import { MUSCLE_GROUP_LABELS } from '../models/musclegroups-dictionary';

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
  selectedDate: any
  inPlan: any
  isSkipped: any

  today = new Date()
  todayAtMidnight = new Date(this.today.setHours(0,0,0,0))
  scheduledFor = new Date()
  isScheduledForToday = false;

  workoutExerciseService = inject(WorkoutExerciseService)
  workoutService = inject(WorkoutService)
  userService = inject(UserService)
  timerService = inject(TimerService)
  scheduledService = inject(ScheduledworkoutService)
  modalRef = inject(NzModalRef<WorkoutInfo>)
  router = inject(Router)
  modal = inject(NzModalService)

  workout = signal<Workout | null>(null)
  status = WORKOUT_STATUS
  workoutExercises = signal<WorkoutExerciseDto[]>([])
  scheduledId = '';
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
    console.log('workout info')

    this.workoutId = this.nzModalData.InputData
    this.isSkipped = this.nzModalData.isSkipped
    this.inPlan = this.nzModalData.inPlan
    this.selectedDate = this.nzModalData.workoutDate
    this.scheduledFor = new Date(this.selectedDate)
    this.isScheduledForToday = isEqual(this.scheduledFor, this.todayAtMidnight)

    
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

  editScheduled(id: string, started: boolean){
    isWorkoutStarted.set(started)
    workoutStartedAt.set(new Date())
    this.timerService.timerSetup()
    
    const userId = this.userService.currentUser()!.userId
    var status = '';
    
    (started) ? status = this.status[0] : status = this.status[4]

    this.scheduledService.generateScheduledWorkout(userId, id, this.selectedDate, status).subscribe({
      next:(data)=> {
        this.scheduledId = data.scheduledWorkoutId,
        this.modalRef.afterClose.subscribe(result => {
          if (result === 'scheduled') {
            this.modal.create({
              nzTitle: 'Edit your scheduled workout',
              nzContent: ScheduledWorkout,
              nzData:{
                InputData: this.scheduledId,
                selectedDate: this.selectedDate,
                started: started
              },
              nzFooter: null
            })
      }})
        this.modalRef.close('scheduled')
      }
    })
   
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
