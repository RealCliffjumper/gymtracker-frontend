import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule} from '@angular/forms';
import { NzListItemComponent, NzListModule } from 'ng-zorro-antd/list';
import { NZ_MODAL_DATA, NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import {  NzSelectModule } from 'ng-zorro-antd/select';
import { WorkoutExerciseService } from '../../core/services/workout-exercise.service';
import { WorkoutService } from '../../core/services/workout.service';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CalendarWorkoutDto } from '../models/calendarworkout.dto';
import { ScheduledworkoutService } from '../../core/services/scheduledworkout-service';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import {CdkDragDrop, DragDropModule, moveItemInArray} from '@angular/cdk/drag-drop';
import { SetLogs } from '../models/setlogs.dto';
import { ScheduledUpdate } from '../models/scheduledupdate.dto';
import { Exercise } from '../models/exercise';
import { ExerciseService } from '../../core/services/exercise.service';
import { NzFormModule } from 'ng-zorro-antd/form';
import { UserService } from '../../core/services/user.service';
import { forkJoin } from 'rxjs';
import { WORKOUT_STATUS } from '../models/workoutstatus';
import { isEqual, intervalToDuration} from 'date-fns';
import { exerciseIdCounter, isWorkoutFinished, isWorkoutPaused, isWorkoutStarted, savedNotes, savedScheduledExercises, savedSets, savedVisibleExercises,workoutInProgress, workoutStartedAt } from '../signals/signals';
import { WexerciseEdit } from './wexercise-edit';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { TimerService } from '../../core/services/timer.service';
import { ScheduledExercise } from '../models/scheduledexercise';
import { waitForAsync } from '@angular/core/testing';
import { NzDropdownMenuComponent, NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { MUSCLE_GROUPS } from '../models/musclegroups';
import { MUSCLE_GROUP_LABELS } from '../models/musclegroups-dictionary';


@Component({
  selector: 'app-scheduled-workout',
  standalone: true,
  imports: [
    NzSelectModule,
    NzListModule,
    NzListItemComponent,
    FormsModule,
    CommonModule,
    NzInputModule,
    NzIconModule,
    NzButtonModule,
    NzTooltipModule,
    DragDropModule,
    NzModalModule,
    NzFormModule,
    ReactiveFormsModule,
    NzCheckboxModule,
    NzDropDownModule
  ],
  templateUrl: './scheduled-workout.html',
  styleUrl: './scheduled-workout.css'
})

export class ScheduledWorkout {
  readonly nzModalData = inject(NZ_MODAL_DATA);
  scheduledWorkoutId: any
  visible: any
  selectedDate: any
  started = false;
  eligibleForInteraction: any
  completedAt: any
  exStarted: any
  today = new Date()
  todayAtMidnight = new Date(this.today.setHours(0,0,0,0))

  _duration: any
  _isWorkoutPaused = isWorkoutPaused
  _isWorkoutFinished = isWorkoutFinished
  _timerDisplay = computed(() => this.timerService.timerDisplay())

  workoutExerciseService = inject(WorkoutExerciseService)
  workoutService = inject(WorkoutService)
  scheduledWorkoutService = inject(ScheduledworkoutService)
  exerciseService = inject(ExerciseService)
  userService = inject(UserService)
  timerService = inject(TimerService)
  modalRef = inject(NzModalRef<ScheduledWorkout>)
  router = inject(Router)
  message = inject(NzMessageService)
  modal = inject(NzModalService)
  fb = inject(FormBuilder)
  


  scheduledWorkout = signal<CalendarWorkoutDto | null>(null)
  scheduledExercises = signal<ScheduledExercise[]>([])
  exercises = signal<Exercise[]>([])
  updatedWorkout = signal<ScheduledUpdate | null>(null)
  updatedExercises = computed(() =>
    this.scheduledExercises().map((ex, idx) => ({ ...ex, exerciseOrder: idx }))
  );
  visibleExercises = signal<ScheduledExercise[]>([])
  musclegroup = MUSCLE_GROUPS
  musclegroup_dic = MUSCLE_GROUP_LABELS

  updatedSets = signal<SetLogs[]>([])

  exerciseFlags = signal<Record<string, { toDelete?: boolean, toSuperset?: boolean, toUnlink?: boolean, toSkip?: boolean, toStart?:boolean, toComplete?: boolean }>>({});
  muscleFilters = signal<string[]>([])
  searchTerm = signal('')
  selectedExercise = signal<string | null>(null)
  loadAll = signal(true);
  usersChecked = signal(false);
  muscleChecked = signal(false);

  filteredExercises = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const filters = this.muscleFilters();
    if(this.muscleChecked()){
      return this.exercises().filter(ex =>
      (filters.length === 0 || filters.includes(ex.muscleGroup)) &&
      (term === '' || ex.exerciseName.toLowerCase().includes(term))
      );
    }
    else{
      return this.exercises()
    }
  });

  searchBarPlaceholder = computed(() =>{
    if(this.muscleChecked()){
      return 'Search all exercises filtered by muscle group'
    }
    else if(this.usersChecked()){
      return 'Search only your exercises'
    }
    else return 'Search all exercises'
  })

  supersetCounter = signal(0)
  status = WORKOUT_STATUS // 0 'STARTED', 1 'COMPLETED', 2 'SKIPPED', 3 'PAUSED', 4 'SCHEDULED'
  workoutNotes = ''

  selectedForSuperset = signal<{ key: string, order: number }[]>([]);
  checkLookUp = signal<string[]>([])
  supersetColors: string[] = [
  '#4caf50', // green
  '#ffeb3b', // yellow
  '#f44336', // red
  '#2196f3', // blue
  '#9c27b0', // purple
  '#ff9800', // orange
  '#00bcd4', // cyan
  '#8bc34a', // light green
  '#c7728eff', // pink
  '#795548', // brown
];

  ngOnInit(){
    console.log('scheduled edit')
    this.scheduledWorkoutId = this.nzModalData.InputData
    this.started = this.nzModalData.started
    this.selectedDate = this.nzModalData.selectedDate
    

    if(this.started){
      this.scheduledWorkoutService.updateStatus(this.scheduledWorkoutId, this.status[0]).subscribe({
        next:()=>{
          this.loadScheduled(this.todayAtMidnight)
          console.log(this.scheduledExercises())
        }
      })
    }
    else{
      this.loadScheduled(this.todayAtMidnight)
      
    }
  }

  ngOnDestroy(){
    this.generateInProgress()
  }

  loadScheduled(midnight: Date){
    if(workoutInProgress()){
      this.started = true
      this.eligibleForInteraction = true
      this.scheduledWorkout.set(workoutInProgress())
      this.scheduledExercises.set(savedScheduledExercises());
      this.visibleExercises.set(savedVisibleExercises())
      this.updatedSets.set(savedSets())
      console.log(this.scheduledExercises())
      console.log(savedSets())
      console.log(this.updatedSets())
      const sn = savedNotes()
      if(sn){
        this.workoutNotes = sn
      }
      
      this.muscleFilters.set(workoutInProgress()!.muscleGroups)
    }
    else{
      this.scheduledWorkoutService.getScheduledWorkout(this.scheduledWorkoutId).subscribe({
        next:(data)=> {
          this.scheduledWorkout.set(data)
          this.scheduledExercises.set(data.exercises);
          this.visibleExercises.set(data.exercises)
          this.workoutNotes = data.workoutDescription
          if(data.startedAt && data.completedAt){
            this._duration = intervalToDuration({
              start: this.timerService.localDateTimeArrayToDate(data.startedAt),
              end: this.timerService.localDateTimeArrayToDate(data.completedAt),
            });
          }
          const scheduledFor = new Date(this.selectedDate);

          if(data.status === this.status[1] || !isEqual(scheduledFor, midnight)){
            this.eligibleForInteraction = false 
          }
          else{this.eligibleForInteraction = true}

          if(data.status === this.status[0] || data.status === this.status[3]){
            this.started = true
            }
          else{this.started = false}

          /* console.log('data status: ' + data.status)
          console.log('started: ' + this.started)
          console.log('eligible: ' + this.eligibleForInteraction) */
          this.muscleFilters.set(data.muscleGroups)
          //console.log(this.scheduledExercises())   
        }
      })
    }
  }

  goToWorkout(workoutId: string){
    this.modalRef.close()
    this.router.navigate(['/workout',  workoutId])
  }

  saveAndCloseModal(){
    if(this.scheduledWorkout()?.status === this.status[1]){
      this.modal.warning({
          nzTitle: 'Saving changes',
          nzContent: 'This is a finished workout. Are you sure you want to apply changes?',
          nzOkText: 'Yes',
          nzCancelText: 'No',
          nzOnOk: () => [
            exerciseIdCounter.set(0),
            this.saveChanges(this.scheduledWorkout()!.status),
            this.modalRef.close()
          ]
        })
    }
    else{
      this.modal.warning({
        nzTitle: 'Saving changes',
        nzContent: 'These changes will only be applied for this date. To modify this and future workouts for chosen day go to template.',
        nzOkText: 'I understand',
        nzCancelText: 'Go back',
        nzOnOk: () => [
          exerciseIdCounter.set(0),
          this.saveChanges(this.scheduledWorkout()!.status),
          this.modalRef.close()
        ]
      })
    }
  }

  saveChanges(st: string){

    switch(st){
      case this.status[0]: //started
        isWorkoutStarted.set(true)
        isWorkoutPaused.set(false)
        workoutStartedAt.set(new Date())
        this.timerService.timerSetup()
        this.started = true;
        this.scheduledWorkoutService.updateStatus(this.scheduledWorkout()!.scheduledWorkoutId, this.status[0]).subscribe()
        return;
      case this.status[1]: //completed
        this.started = false;
        isWorkoutStarted.set(false)
        isWorkoutFinished.set(true)
        this.eligibleForInteraction = false;
        this.timerService.timerSetup()
        this.completedAt = new Date()
        localStorage.removeItem('savedScheduledExercises');
        localStorage.removeItem('savedVisibleExercises');
        localStorage.removeItem('workoutInProgress');
        localStorage.removeItem('savedNotes');
        localStorage.removeItem('timerDisplay')
        localStorage.removeItem('savedSets')
        
        break;
      case this.status[3]: //paused
        this.started = true;
        isWorkoutPaused.set(true)
        this.timerService.timerSetup()
        return;
      case 'continued':
        isWorkoutStarted.set(true)
        isWorkoutPaused.set(false)
        this.timerService.timerSetup()
        return;
      default: this.started = false;
    }

    this.scheduledWorkoutService.updateScheduledWorkout(this.scheduledWorkoutId, this.buildScheduledUpdate(st)).subscribe({
      next:()=> {
        workoutInProgress.set(null)
        savedNotes.set('')
        savedScheduledExercises.set([])
        workoutStartedAt.set(null)
        savedVisibleExercises.set([])
        this.timerService.timerDisplay.set('00:00:00')
      },
      error:(err)=>console.log(err)
    })
  }

  private buildScheduledUpdate(status: string): ScheduledUpdate{
    console.log(this.updatedSets())
    const flags = this.exerciseFlags();
    return {
      workoutNotes: this.workoutNotes ?? this.scheduledWorkout()?.workoutDescription,
      status: status,
      startedAt: workoutStartedAt() ?? null,
      completedAt: this.completedAt ?? null ,
      workoutPoints: (status === this.status[1]) ? Math.round(this.setPoints()) : 0,
      exercises: this.scheduledExercises().map((ex, idx) => ({
        scheduledWorkoutExerciseId: ex.scheduledWorkoutExerciseId,
        scheduledWorkoutId: this.scheduledWorkoutId,
        workoutExerciseId: ex.workoutExerciseId ?? null,
        exerciseId: ex.exerciseId,
        exerciseName: ex.exerciseName,
        exerciseOrder: ex.exerciseOrder!,
        supersetGroupId: ex.supersetGroupId,
        toSuperset: flags[ex.scheduledWorkoutExerciseId ?? ex.tempExId]?.toSuperset ?? false,
        toDelete: flags[ex.scheduledWorkoutExerciseId]?.toDelete ?? false,
        toUnlink: flags[ex.scheduledWorkoutExerciseId]?.toUnlink ?? false,
        toSkip: flags[ex.scheduledWorkoutExerciseId ?? ex.tempExId]?.toSkip ?? (status !== this.status[4] &&(!ex.isStarted && !ex.completed) || ex.skipped),
        toComplete: flags[ex.scheduledWorkoutExerciseId ?? ex.tempExId]?.toComplete ?? (status !== this.status[4] && (ex.isStarted && !ex.skipped) || ex.completed),
        sets: (ex.skipped) 
        ? this.scheduledExercises()[idx].sets
          .map(s => ({
            setLogId: s.setLogId ?? null,
            setNumber: s.setNumber,
            actualReps: s.actualReps,
            actualWeight: s.actualWeight,
            toDelete:  true,
            setPoints: s.setPoints
          }))
        : this.scheduledExercises()[idx].sets
          //.filter(s => (s.scheduledWorkoutExerciseId && s.scheduledWorkoutExerciseId === ex.scheduledWorkoutExerciseId) || (!s.scheduledWorkoutExerciseId && s.tempExId === ex.tempExId))
          .map(s => ({
            setLogId: s.setLogId ?? null,
            setNumber: s.setNumber,
            actualReps: s.actualReps,
            actualWeight: s.actualWeight,
            toDelete: s.toDelete ?? false,
            toComplete: s.toComplete ?? false,
            toSkip: s.toSkip ?? false,
            setPoints: s.setPoints
          }))
      })
    )
    };
  }

  generateInProgress(){
    if(isWorkoutStarted() || isWorkoutPaused()){

      workoutInProgress.set(this.scheduledWorkout())
      savedNotes.set(this.workoutNotes)
      savedScheduledExercises.set(this.scheduledExercises())
      savedVisibleExercises.set(this.visibleExercises())
      savedSets.set(this.visibleExercises().flatMap(ex=>ex.sets))
      localStorage.setItem(
          'savedScheduledExercises',
          JSON.stringify(savedScheduledExercises())
        );
      localStorage.setItem(
        'savedVisibleExercises',
        JSON.stringify(savedVisibleExercises())
      );
      localStorage.setItem(
        'workoutInProgress',
        JSON.stringify(workoutInProgress())
      );
      localStorage.setItem(
        'savedNotes',
        this.workoutNotes
      );
      localStorage.setItem(
        'savedSets',
        JSON.stringify(this.visibleExercises().flatMap(ex => ex.sets))
      )
      //console.log(savedVisibleExercises())   
  }
  }

  setPoints = computed(() =>
    this.updatedSets().reduce((sum, s) => sum + s.setPoints!, 0)
  );

  sumExercisePoints(i: number){
    const total = this.scheduledExercises()[i].sets
        .reduce((sum, s) => sum + s.setPoints!, 0);
    if(total){
      return total;
    }
    else return 0;
  }

  drop(event: CdkDragDrop<any[]>) {
    const visible = [...this.visibleExercises()];

    moveItemInArray(visible, event.previousIndex, event.currentIndex);
    visible.forEach((ex, idx) => ex.exerciseOrder = idx);

    this.visibleExercises.set(visible);
    //console.log(visible)

    console.log(this.scheduledExercises())
  }

  flagExercise(scheduledWorkoutExerciseId: string, tempExId: string | undefined, type: string, supersetId?: string | null) {
    const currentFlags = this.exerciseFlags();
    const key = tempExId ?? scheduledWorkoutExerciseId;
    const current = currentFlags[key] ?? { toDelete: false, toSuperset: false, toUnlink: false };

    if(type === 'remove'){
      this.modal.confirm({
          nzTitle: 'Remove exercise',
          nzContent: 'This will remove the exercise and all of its data from the workout.',
          nzOkText: 'OK',
          nzOnOk: ()=>{
            this.exerciseFlags.set({
              ...currentFlags,
              [key]: { toDelete: !current.toDelete }
            });

            this.visibleExercises.update(current =>
              current.filter(ex => ex.scheduledWorkoutExerciseId !== scheduledWorkoutExerciseId || ex.tempExId !== tempExId)
            );
            if(tempExId != undefined){
              this.scheduledExercises.update(current=>
              current.filter(ex => ex.tempExId !== tempExId)
            );
        }
    }})
      

     console.log(this.visibleExercises())
     console.log(this.scheduledExercises())
    }

    else if(type === 'superset'){
      this.exerciseFlags.set({
        ...currentFlags,
        [key]: { toSuperset: true }
      });
    }

    else if(type === 'unlink'){
      this.exerciseFlags.set({
        ...currentFlags,
        [key]: { toUnlink: true }
      });
    }

    else if(type === 'skip'){
      if(!isWorkoutStarted() && !isWorkoutPaused()){
        this.saveChanges(this.status[0])
      }
      this.exerciseFlags.set({
        ...currentFlags,
        [key]: { toSkip: true }
      });
      
      this.visibleExercises.update(current =>
        current.map(ex => {
          if(ex.scheduledWorkoutExerciseId === key || ex.tempExId === key){
            return{
              ...ex,
              skipped: !ex.skipped,
            }
          }
          return ex;
        })
      );
      this.scheduledExercises.update(current =>
        current.map(ex => {
          if(ex.scheduledWorkoutExerciseId === key || ex.tempExId === key){
            return{
              ...ex,
              skipped: !ex.skipped,
            }
          }
          return ex;
        })
      );
    }

    else if(type === 'start'){
      if(!isWorkoutStarted() && !isWorkoutPaused()){
        this.saveChanges(this.status[0])
      }
      this.exerciseFlags.set({
        ...currentFlags,
        [key]: { toStart: true }
      });
      
      this.visibleExercises.update(current =>
        current.map(ex => {
          const isSameExercise =
            ex.scheduledWorkoutExerciseId === key ||
            ex.tempExId === key;

          const isSameSuperset =
            !!supersetId &&
            !!ex.supersetGroupId &&
            ex.supersetGroupId === supersetId;
            
          //console.log('yes')
          if(isSameExercise || isSameSuperset){
            return{
              ...ex,
              isStarted: true,
            }
          }
            
          return ex;
        })
      );
      this.scheduledExercises.update(current =>
        current.map(ex => {
          if(ex.scheduledWorkoutExerciseId === key || ex.tempExId === key){
            return{
              ...ex,
              isStarted: true,
            }
          }
          return ex;
        })
      );
      //console.log(this.visibleExercises())
    }

    else if(type === 'complete'){
      this.exerciseFlags.set({
        ...currentFlags,
        [key]: { toComplete: !current.toComplete }
      });
      this.visibleExercises.update(current =>
        current.map(ex => {
          if(ex.scheduledWorkoutExerciseId === key || ex.tempExId === key){
            return{
              ...ex,
              isStarted: false,
              completed: !ex.completed,
            }
          }
          return ex;
        })
      );
      this.scheduledExercises.update(current =>
        current.map(ex => {
          if(ex.scheduledWorkoutExerciseId === key || ex.tempExId === key){
            return{
              ...ex,
              isStarted: false,
              completed: !ex.completed,
            }
          }
          return ex;
        })
      );
      //this.visibleExercises().map( ex =>)
    }
    this.generateInProgress()
  }

  toggleSuperset(scheduledWorkoutExerciseId: string, tempExId: string | undefined, order: number) {
    const key = tempExId ?? scheduledWorkoutExerciseId;
    const current = this.selectedForSuperset();

    if (current.some(s => s.key === key)) {
      this.selectedForSuperset.set(current.filter(s => s.key !== key));
      this.checkLookUp.set([]);

      return;
    }

    if (current.length === 0) {
      this.selectedForSuperset.set([{ key, order }]);

      this.checkLookUp.set([key])

      return;
    }

    if (current.length === 1) {
      const [{ key: firstKey, order: firstOrder }] = current;

      this.checkLookUp.set([firstKey, key])

      this.selectedForSuperset.set([
        { key: firstKey, order: firstOrder },
        { key, order }
      ]);

      this.applySuperset(firstKey, key);
      this.clearSupersetSelection()
    }
  }
  
  private applySuperset(firstKey: string, secondKey: string) {
    const dummyId = `TEMP-${this.supersetCounter()}`;

    const getId = (ex: any) =>
      ex.tempExId ?? ex.scheduledWorkoutExerciseId;

    const ex1 = this.scheduledExercises().find(e => getId(e) === firstKey);
    const ex2 = this.scheduledExercises().find(e => getId(e) === secondKey);

    if (!ex1 || !ex2) {
      return;
    }

    const setId1 = ex1.supersetGroupId;
    const setId2 = ex2.supersetGroupId;

    if (setId1 && setId2 && setId1 === setId2) {
      this.scheduledExercises.update(list =>
        list.map(e => {
          const id = getId(e);
          if (id === firstKey || id === secondKey) {
            this.flagExercise(id, undefined, "unlink");
            return { ...e, supersetGroupId: null };
          }
          return e;
        })
      );

      this.visibleExercises.update(list =>
        list.map(e => {
          const id = getId(e);
          if (id === firstKey || id === secondKey) {
            return { ...e, supersetGroupId: null };
          }
          return e;
        })
      );

      this.message.success("Superset relation removed.");
      return;
    }

    this.scheduledExercises.update(list =>
      list.map(e => {
        const id = getId(e);

        if (id === firstKey || id === secondKey) {
          this.flagExercise(id, undefined, "superset");
          return { ...e, supersetGroupId: dummyId };
        }

        return e;
      })
    );

    this.visibleExercises.update(list =>
      list.map(e => {
        const id = getId(e);

        if (id === firstKey || id === secondKey) {
          return { ...e, supersetGroupId: dummyId };
        }

        return e;
      })
    );

    this.supersetCounter.update(v => v + 1);
    this.message.success("Superset linked!");
  }

  clearSupersetSelection() {
    setTimeout(() => {
      this.selectedForSuperset.set([]);
      this.checkLookUp.set([])
    });
  }

  isCheckboxDisabled(order: number): boolean {
  const selected = this.selectedForSuperset();

  if (selected.length === 0) return false;

  if (selected.length === 2) {
    return !selected.some(s => s.order === order);
  }

  if (selected.length === 1) {
    const firstOrder = selected[0].order;
    return order !== firstOrder && order !== firstOrder + 1 && order !== firstOrder - 1;
  }

  return false;
}

  getSupersetColor(groupId: string | null): string {
    if (!groupId) return 'transparent';

    const hash = Array.from(groupId)
      .map(c => c.charCodeAt(0))
      .reduce((acc, val) => acc + val, 0);

    return this.supersetColors[hash % this.supersetColors.length];
  }

  onAllChecked(checked: boolean){
    this.muscleChecked.set(false);
    this.usersChecked.set(false);
    this.loadAll.set(checked);

  }

  onUsersChecked(checked:boolean){
    this.loadAll.set(!checked);
    this.muscleChecked.set(false);
    this.usersChecked.set(checked);
  }

  onMuscleChecked(checked:boolean){
    this.loadAll.set(!checked);
    this.usersChecked.set(false);
    this.muscleChecked.set(checked);
    console.log(this.muscleChecked)
    console.log(this.loadAll)
    console.log(this.searchBarPlaceholder())
  }

  loadExercises(): void{
    const user = this.userService.currentUser();
    if (!user) return;

    if(this.loadAll() || this.muscleChecked()){
      forkJoin({
      user: this.exerciseService.getUserExercises(user.userId),
      all: this.exerciseService.getAllExercises()
  
      }).subscribe({
        next: ({ user, all}) => {
          const merged = [ ...user, ...all];
    
          this.exercises.set(merged);
        },
        error: (err) => console.error("Failed to load exercises", err)
      });
    }

    else if(this.usersChecked() && !this.loadAll()){
      this.exerciseService.getUserExercises(user.userId).subscribe({
        next: (data) => this.exercises.set(data)
      })
    }
  }

  onSearch(search: string){
    this.searchTerm.set(search);
  }

  onDropdownOpen(open: boolean){
    if (open && this.exercises.length === 0) {
      this.loadExercises()
    }
  }

  onExerciseSelected(id: string){
    this.selectedExercise.set(id);
  }

  openWorkoutExerciseModal(editing: boolean, key: string | undefined, order?: number): void {
    var exId
    var toEdit: ScheduledExercise | null | undefined
    const i = order
    if(key != undefined && editing){
      toEdit = this.visibleExercises().find(s=> s.tempExId === key || s.scheduledWorkoutExerciseId === key)
      //console.log(toEdit!.exerciseId)
    }
    
    if(toEdit && toEdit.skipped){
      this.message.warning('This exercise was marked as skipped and its sets are no longer accessible')
      return;
    }
    
    if(!this.selectedExercise() && !editing){
      return;
    }
    if(editing && toEdit){
      exId = toEdit.exerciseId
    }
    else {
      exId = this.selectedExercise()
    }

    const modalRef = this.modal.create({
      nzTitle: (editing) ? 'Edit exercise in workout' : 'Add exercise to workout',
      nzContent: WexerciseEdit,
      nzData:{
        workoutExerciseInstance: (toEdit) ? toEdit : null,
        exerciseId: exId,
        editing: editing,
        length: this.visibleExercises().length,
        isScheduled: true,
        started: this.started
      },
      nzFooter: null
    })

    if(editing){
      modalRef.afterClose.subscribe((result) => {
      console.log(result)
      if (!result) return;
      if (result && Array.isArray(result)) {

        this.visibleExercises.update(current =>
          current.map((ex) => {
            if (ex.scheduledWorkoutExerciseId === key || ex.tempExId === key) {
              return {
                ...ex,
                sets: result.filter(s => !s.toDelete)
              };
            }
            return ex;
          })
        );
        this.scheduledExercises.update(current =>
          current.map((ex) => {
            if (ex.scheduledWorkoutExerciseId === key || ex.tempExId === key) {
              return {
                ...ex,
                sets: result
              };
            }
            return ex;
          })
        );
        //console.log(this.visibleExercises())
        //const scheduledId = key;
        //console.log('key ' + key)
        //console.log(!scheduledId)

        //if (!scheduledId) {
        //  console.log('no scheduledWorkoutExerciseId for order', order);
        //  return;
        //}

        const cleanResults = result
          .filter((s: any): s is any => !!s)
          .map((s: any) => ({
            ...s,
          }));

        this.updatedSets.update(values => [
          ...values.filter((v: any) => 
                v.scheduledWorkoutExerciseId !== key &&
                v.tempExId !== key
              ),
          ...cleanResults
        ]);
        const exSpecificSets = this.updatedSets().filter((s:any) => (s.scheduledWorkoutExerciseId === key || s.tempExId === key) && s.toComplete)
        
        if(i!== undefined && i !== null && exSpecificSets.length === this.visibleExercises()[i].sets.length){
          console.log('yes')
            this.flagExercise(toEdit!.scheduledWorkoutExerciseId, toEdit!.tempExId, 'complete')
        }
      }
      })
    }

    else {
      modalRef.afterClose.subscribe((result) => {
        if (!result) return;
        if(result){
          //console.log(result)
          const exSpecificSets = result.sets.filter((s:any) => (s.scheduledWorkoutExerciseId === key || s.tempExId === key) && s.toComplete)

          result.sets = result.sets.map((s: any) => ({
            ...s,
            tempExId: result.tempExId
          }));

          this.updatedSets.update(values => [
            ...values,
            ...result.sets
          ]);
          this.scheduledExercises.update(values => [...values, result]);
          this.visibleExercises.update(values => [...values, result]);
          
          if(exSpecificSets.length === this.visibleExercises()[this.visibleExercises().length-1].sets.length){
            this.flagExercise(result.scheduledWorkoutExerciseId, result.tempExId, 'complete')
          }
        }
        
        this.selectedExercise.set('')
        console.log(this.updatedSets())
        //console.log(this.visibleExercises())
      })
    }
  }
  
}
