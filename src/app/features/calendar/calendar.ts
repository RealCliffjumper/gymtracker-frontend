import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { startOfISOWeek, startOfWeek, endOfWeek, format, addWeeks, eachDayOfInterval, getISOWeek } from 'date-fns';
import {} from 'ng-zorro-antd/calendar';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { DAYS_OF_WEEK } from '../../shared/models/dow';
import { DOW_LABELS } from '../../shared/models/dow-dictionary';
import { WeeklyPlanService } from '../../core/services/weeklyplan.service';
import { UserService } from '../../core/services/user.service';
import { WeeklyPlan } from '../../shared/models/weekly-plan';
import { WeeklyPlanEntry } from '../../shared/models/weekly-plan.entry';
import { WeeklyPlanEntryService } from '../../core/services/weeklyplan.entry.service';
import { ScheduledworkoutService } from '../../core/services/scheduledworkout-service';
import { CalendarWorkoutDto } from '../../shared/models/calendarworkout.dto';
import { CommonModule } from '@angular/common';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { Workout } from '../../shared/models/workout';
import { WorkoutService } from '../../core/services/workout.service';
import { Router } from '@angular/router';
import { NzOptionComponent, NzSelectModule } from 'ng-zorro-antd/select';
import { ScheduledWorkout } from '../../shared/modals/scheduled-workout';
import { WorkoutInfo } from '../../shared/modals/workout-info';
import { ScheduledInfo } from '../../shared/modals/scheduled-info';
import { CalendarEntry } from '../../shared/models/calendarentry.dto';
import { WORKOUT_STATUS } from '../../shared/models/workoutstatus';
import { exerciseIdCounter, isWorkoutFinished, isWorkoutStarted, percent, workoutPlanned } from '../../shared/signals/signals';
import { ParseDatesPipe } from "../../shared/pipes/parse-dates-pipe";
import { NzDatePickerComponent } from 'ng-zorro-antd/date-picker';
import { NzProgressModule } from 'ng-zorro-antd/progress';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    FormsModule,
    NzIconModule,
    NzCardModule,
    NzButtonModule,
    CommonModule,
    NzModalModule,
    NzOptionComponent,
    NzSelectModule,
    ParseDatesPipe,
    NzDatePickerComponent,
    NzProgressModule
],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css'
})
export class Calendar {

  dow = DAYS_OF_WEEK;
  dow_labels = DOW_LABELS;
  date: any;
  _percent = percent

  weeklyPlanService = inject(WeeklyPlanService)
  weeklyPlanEntryService = inject(WeeklyPlanEntryService)
  userService = inject(UserService)
  scheduledWorkoutService = inject(ScheduledworkoutService)
  workoutService = inject(WorkoutService)
  router = inject(Router)
  modal = inject(NzModalService)

  activePlan = signal<WeeklyPlan | null>(null)
  scheduledEntries = signal<CalendarEntry[]>([])
  weekOffset = 0;
  today = new Date()
  todayAtMidnight = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate())


  visible = false;
  loadingEntries = false;
  compareTodayToWeekdaysBefore = false

  //workout modal things
  isModalVisible = false;
  isSubmitting = false;
  isEditing = false;
  showInfoModal = false;

  selectedDate = new Date()
  selectedEntryId: string | null = null;
  modalMode = signal<'add' | 'edit'>('add')
  selectedWorkout = signal<string | null>(null)
  searchTerm = signal('');
  workouts = signal<Workout[]>([])
  datesFrame!: Date[] | [];
  status = WORKOUT_STATUS

  constructor(){
     effect(()=>{
      isWorkoutFinished(); this.loadEntries()
      isWorkoutFinished.set(false)
    })
    effect(()=>{
      isWorkoutStarted(); this.loadEntries()
    })
    
  }

  ngOnInit(){
    this.loadEntries()
  }
  

  loadEntries(){
    this.loadingEntries = true;
    const userId = this.userService.currentUser()!.userId;

    
    const baseDate = addWeeks(this.today, this.weekOffset);

    const from = startOfWeek(baseDate, { weekStartsOn: 1 });
    const to = endOfWeek(baseDate, { weekStartsOn: 1 });

    const fromStr = format(from, 'yyyy-MM-dd');
    const toStr = format(to, 'yyyy-MM-dd'); 

    this.datesFrame = eachDayOfInterval({start: from, end: to})

    this.weeklyPlanService.getActivePlan(userId).subscribe({
      next: (plan) => {
        this.activePlan.set(plan);

        this.scheduledWorkoutService.getScheduledWorkouts(userId, fromStr, toStr)
          .subscribe({
            next: (data) => {
              const updated = data.map(element => ({
                ...element,
                isSkipped: !!(
                    (element.isVirtual && new Date(element.workoutScheduledDate) < this.todayAtMidnight) ||
                    (element.scheduledWorkoutId && element.status === 'SKIPPED' && new Date(element.workoutScheduledDate) < this.todayAtMidnight)
                  )
                })
                
              );
              this.scheduledEntries.set(updated);
              this.loadingEntries = false;
            },
            error: (err) => {
              console.error(err)
              
              this.loadingEntries = false;
            }
          });
      },
      error: (err) => {
        
        console.error(err)
        this.loadingEntries = false;
      }
    });
    
  }

  goLeft(){
    this.weekOffset -= 1
    this.loadEntries()
  }

  goRight(){
    if(this.weekOffset < 0){
      this.weekOffset += 1;
      this.loadEntries()
    }
  }

  jumpWeeks(result: Date){
    const currentyear = this.today.getFullYear()

    if(!result){return;}

    if(result.getFullYear() > currentyear){return;}
    
    const w1 = getISOWeek(this.todayAtMidnight)
    const w2 = getISOWeek(result)

    
    if(w2>w1 || w2===w1 && this.weekOffset === 0){
      this.date = null
      return;
    }
    else{
      this.weekOffset = w2-w1
      this.loadEntries()
    }
  }

  backToPresent(){
    this.weekOffset = 0;
    this.loadEntries()
  }

  goToPlan(planId: string){
    this.router.navigate(['/plan', planId])
  }

  goToPlansPage(){
    this.router.navigate(['/plans'])
  }

  isTodayOrFuture(targetDay: string): boolean {
    const day = this.getDayIndex(targetDay)
    const dayDate = this.datesFrame[day];
    const today = new Date();

    const normalizedDay = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate());
    const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    return normalizedDay >= normalizedToday;
  }

  getEntryForDay(day: string){
    const targetIndex = this.getDayIndex(day);

    return this.scheduledEntries().find(entry => {
      const entryDate = new Date(entry.workoutScheduledDate);
      const jsDay = entryDate.getDay();

      const normalizedDay = (jsDay + 6) % 7;

      return normalizedDay === targetIndex;
    });
  }

  getDayIndex(day: string): number{
    const map: any={
      MONDAY: 0, TUESDAY: 1, WEDNESDAY: 2,
      THURSDAY: 3, FRIDAY: 4, SATURDAY: 5, SUNDAY: 6
    }
    return map[day]
  }

  
  workoutInfoWindow(entry: CalendarEntry, date: Date){

    const modalRef = this.modal.create({
      nzTitle: 'Your scheduled workout',
      nzContent: WorkoutInfo,
      nzData: {
        InputData: entry.workoutId,
        workoutDate: date,
        isSkipped: entry.isSkipped,
        inPlan: false,
        visible: true,
      },
      nzFooter: null
    })

     modalRef.afterClose.subscribe((result) => {
      if (result === 'scheduled' || result?.updated) {
        //console.log('yessss')
        this.loadEntries();
      }
    });
  }

  //scheduled workout modal section
  openScheduledInfoModal(scheduledWorkoutId: string, skip?: boolean){

    const modalRef = this.modal.create({
      nzTitle: 'Your scheduled workout',
      nzContent: ScheduledInfo,
      nzData: {
        InputData: scheduledWorkoutId,
        visible: true,
        skipped: skip,
      },
      nzFooter: null
    })

    modalRef.afterClose.subscribe((result) => {
      if (result === 'success' || result?.updated) {
        this.loadEntries();
      }
    });
  }

  openScheduledWorkoutModal(id: string, date: Date){
    const modalRef = this.modal.create({
      nzTitle: 'Edit your scheduled workout',
      nzContent: ScheduledWorkout,
      nzData:{
        InputData: id,
        selectedDate: date
      },
      nzFooter: null
    })
    modalRef.afterClose.subscribe(() =>
        exerciseIdCounter.set(0)
    )
  }

  //workout modal section. pretty much reusing add/edit entry modal
  onSearch(term: string){
    this.searchTerm.set(term);
  }

  onWorkoutSelected(value: string){
    this.selectedWorkout.set(value);
    this.isSubmitting = false;
  }

  onDropdownOpen(open: boolean){
    if (open && this.workouts.length === 0) {
      this.loadWorkouts();
    }
  }

  loadWorkouts(){
    const userId = this.userService.currentUser()?.userId

    if(userId){
      this.workoutService.getUserWorkouts(userId).subscribe({
        next: (data) => this.workouts.set(data)
      })
    }
  }

  scheduleExtraWorkout(day: string){
    this.modalMode.set('add')
    this.isModalVisible = true;
    this.isSubmitting = true;
    this.selectedDate = this.datesFrame[this.getDayIndex(day)];
    console.log(this.selectedDate)
    this.selectedEntryId = null
    this.selectedWorkout.set(null) 
  }

  openEditEntryModal(entry: CalendarEntry): void{
    this.modalMode.set('edit')
    this.isModalVisible = true;
    this.isSubmitting = true;
    
    this.selectedDate = new Date(entry.workoutScheduledDate)
    console.log(this.selectedDate)
    this.selectedWorkout.set(entry.workoutId)
  }

  handleOk(){
    const userId = this.userService.currentUser()!.userId
    const workout = this.selectedWorkout();
    this.isModalVisible = false;

    if(this.modalMode() === 'add'){
      if(workout){
      this.scheduledWorkoutService.generateScheduledWorkout(userId, workout, format(this.selectedDate, 'yyyy-MM-dd'), this.status[4]).subscribe({
        next: () => 
          {
            this.finishModal()
            this.loadEntries()
          }
      })
    }
    }
    else if(this.modalMode() === 'edit' && workout){
      this.scheduledWorkoutService.generateScheduledWorkout(userId, workout, format(this.selectedDate, 'yyyy-MM-dd'), this.status[4]).subscribe({
        next:()=>{
          
          this.finishModal()
          this.loadEntries()
        },
        error: ()=> {
          console.log(workout)
        }
      })
    }
  }

  handleCancel(){
    this.isModalVisible = false;
    this.selectedWorkout.set(null)
  }

  //handy methods section

  finishModal(): void {
    this.isSubmitting = false;
    this.isModalVisible = false;
    this.selectedWorkout.set(null);
    this.selectedEntryId = null;
  }
}
