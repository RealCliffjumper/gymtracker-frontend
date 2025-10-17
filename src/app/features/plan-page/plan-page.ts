import { Component, inject,signal } from '@angular/core';
import { WeeklyPlan } from '../../shared/models/weekly-plan';
import { ActivatedRoute, Router, RouterLinkActive } from '@angular/router';
import { WeeklyPlanService } from '../../core/services/weeklyplan.service';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { DAYS_OF_WEEK } from '../../shared/models/dow';
import { DOW_LABELS } from '../../shared/models/dow-dictionary';
import { NzListModule } from 'ng-zorro-antd/list';
import { WeeklyPlanEntryService } from '../../core/services/weeklyplan.entry.service';
import { NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { FormsModule } from '@angular/forms';
import { WeeklyPlanEntry } from '../../shared/models/weekly-plan.entry';
import { NzOptionComponent, NzSelectModule } from 'ng-zorro-antd/select';
import { Workout } from '../../shared/models/workout';
import { UserService } from '../../core/services/user.service';
import { WorkoutService } from '../../core/services/workout.service';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { CommonModule } from '@angular/common';
import { NzMessageService } from 'ng-zorro-antd/message';
import { WorkoutInfo } from "../../shared/modals/workout-info";
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';

@Component({
  selector: 'app-plan-page',
  standalone: true,
  imports: [
    NzIconModule,
    NzListModule,
    NzModalModule,
    NzInputModule,
    FormsModule,
    NzOptionComponent,
    NzSelectModule,
    NzButtonModule,
    CommonModule,
    NzCardModule,
    NzTooltipModule
],
  templateUrl: './plan-page.html',
  styleUrl: './plan-page.css'
})
export class PlanPage {
  route = inject(ActivatedRoute)
  router = inject(Router)
  weeklyPlanService = inject(WeeklyPlanService)
  weeklyPlanEntryService = inject(WeeklyPlanEntryService)
  userService = inject(UserService)
  workoutService = inject(WorkoutService)
  message = inject(NzMessageService)
  modal = inject(NzModalService)

  weeklyPlan = signal<WeeklyPlan| null>(null)
  weeklyPlanEntries = signal<WeeklyPlanEntry[]>([])
  workouts = signal<Workout[] | null>(null)

  selectedWorkout = signal<string | null>(null)
  searchTerm = signal('');

  isModalVisible = false;
  isSubmitting = false;
  isEditing = false;
  showInfoModal = false;
  editablePlanName = ''
  selectedDay: string | null = null;
  selectedEntryId: string | null = null;
  modalMode = signal<'add' | 'edit'>('add')
  dow = DAYS_OF_WEEK
  dow_labels = DOW_LABELS

  ngOnInit(){

    const weeklyPlanId = this.route.snapshot.paramMap.get('weeklyPlanId')!;

    if(weeklyPlanId){
      this.weeklyPlanService.getWeeklyPlan(weeklyPlanId).subscribe({
        next:(data) => this.weeklyPlan.set(data),
        error: (err) => console.log("Something went wrong ", err)
      })
      this.weeklyPlanEntryService.getEntries(weeklyPlanId).subscribe({
        next:(entries) => this.weeklyPlanEntries.set(entries)
      })
    }
  }

  getEntryForDay(day: string): WeeklyPlanEntry | null{
    return this.weeklyPlanEntries().find(e=> e.dayOfWeek === day) || null;
  }

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

  editName(){
    if(!this.isEditing){
      this.isEditing = true;
      this.editablePlanName = this.weeklyPlan()?.weeklyPlanName ?? ''
    }
    else this.isEditing = false;
  }

  saveChanges(){
    this.weeklyPlanService.updateWeeklyPlan(this.weeklyPlan()!.weeklyPlanId, this.editablePlanName).subscribe({
      next:()=> 
        {
          this.isEditing = false
          this.editablePlanName = ''
          this.rebuildPage(this.weeklyPlan()!)
        }
    })
    
  }

  changePlanStatus(){
    const current = this.weeklyPlan()!;
    const toggled = !current.planActive;

    this.weeklyPlan.update(plan => ({ ...plan!, planActive: toggled })); //actually using signal features for once

    this.weeklyPlanService.changeStatus(current.weeklyPlanId, current.userId, toggled).subscribe({
      error: () => {
      this.weeklyPlan.update(plan => ({ ...plan!, planActive: !toggled }));
      }
    });
  }

  deletePlan(){
    this.modal.confirm({
      nzTitle: "<i>Delete plan?</i>",
      nzContent: "<b>Warning: this action will deactivate and delete selected plan</b>",
      nzOkDanger: true,
      nzOkText: 'Yes',
      nzOnOk: () => {
        this.weeklyPlanService.deletePlan(this.weeklyPlan()!.weeklyPlanId).subscribe({
          next: () =>this.router.navigate(['/plans'])
        })
      }
    })
  }

  updateEntry(entryId: string, workoutId: string){
    this.weeklyPlanEntryService.updateEntry(entryId, workoutId).subscribe()
  }

  workoutWindow(workoutId: string){
    this.selectedWorkout.set(workoutId)
    this.modal.create({
      nzContent: WorkoutInfo,
      nzData: {
        InputData: this.selectedWorkout(),
        visible: true
      },
      nzFooter: null
    })
  }

  goToWorkout(workoutId: string){
    this.router.navigate(['/workout', workoutId])
  }

  removeEntry(entryId: string){
    this.weeklyPlanEntryService.deleteEntry(entryId).subscribe({
      next: () => {
        this.message.success('Entry removed')
        this.rebuildPage(this.weeklyPlan()!)
      },
      error: ()=> this.message.error('Something went wrong')
    })
  }

  //Entry modal section
  openAddEntryModal(day: string){
    this.modalMode.set('add')
    this.isModalVisible = true;
    this.isSubmitting = true;
    this.selectedDay = day;
    this.selectedEntryId = null
    this.selectedWorkout.set(null)
    
  }

  openEditEntryModal(entry: WeeklyPlanEntry): void{
    this.modalMode.set('edit')
    this.isModalVisible = true;
    this.isSubmitting = true;
    this.selectedDay = entry.dayOfWeek
    this.selectedEntryId = entry.weeklyEntryId
    this.selectedWorkout.set(entry.workoutId)
  }


  handleOk(){
    const workout = this.selectedWorkout();
    const plan = this.weeklyPlan();
    const day = this.selectedDay;
    this.isModalVisible = false;

    if(this.modalMode() === 'add'){
      if(workout && plan && day){
      this.weeklyPlanEntryService.addEntry(workout, plan.weeklyPlanId, day).subscribe({
        next: () => 
          {
            this.finishModal()
            this.rebuildPage(plan)
          }
      })
    }
    }
    else if(this.modalMode() === 'edit' && this.selectedEntryId){
      this.weeklyPlanEntryService.updateEntry(this.selectedEntryId, workout!).subscribe({
        next:()=>{
          this.finishModal()
          this.rebuildPage(plan!)
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
  rebuildPage(plan: WeeklyPlan){
  this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(
      ["/plan", plan.weeklyPlanId]
    );
  });
  }

  finishModal(): void {
    this.isSubmitting = false;
    this.isModalVisible = false;
    this.selectedWorkout.set(null);
    this.selectedEntryId = null;
  }
}
