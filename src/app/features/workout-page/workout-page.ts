import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, NgControl, ReactiveFormsModule, Validators} from '@angular/forms';
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
import { Exercise } from '../../shared/models/exercise';
import { WorkoutExerciseService } from '../../core/services/workout-exercise.service';
import { ExerciseService } from '../../core/services/exercise.service';
import { WorkoutExerciseDto } from '../../shared/models/workout-exercise.dto';
import { MUSCLE_GROUPS } from '../../shared/models/musclegroups';
import { MUSCLE_GROUP_LABELS } from '../../shared/models/musclegroups-dictionary';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { ExerciseForm } from '../../shared/components/exercise-form/exercise-form';
import { WorkoutSetDto } from '../../shared/models/workout-exercise-set';
import {CdkDragDrop, DragDropModule, moveItemInArray} from '@angular/cdk/drag-drop';

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
    FormsModule,
    NzIconModule,
    NzTooltipModule,
    NzDividerModule,
    DragDropModule
],
  templateUrl: './workout-page.html',
  styleUrl: './workout-page.css'
})
export class WorkoutPage {

//service injections
fb = inject(FormBuilder)
workoutService = inject(WorkoutService)
userService = inject(UserService)
workoutExerciseService = inject(WorkoutExerciseService)
exerciseService = inject(ExerciseService)
router = inject(Router)
route = inject(ActivatedRoute)
modal = inject(NzModalService)
message = inject(NzMessageService)



//workout related stuff
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

//exercise related stuff
exercises = signal<Exercise[]>([]);
workoutExercises = signal<WorkoutExerciseDto[]>([]);
searchTerm = signal('');
muscleFilters = signal<string[]>([]);
selectedExercise = signal<string | null>(null)
availableMuscleGroups = MUSCLE_GROUPS;
muscleGroupLabels = MUSCLE_GROUP_LABELS;

filteredExercises = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const filters = this.muscleFilters();
    return this.exercises().filter(ex =>
      (filters.length === 0 || filters.includes(ex.muscleGroup)) &&
      (term === '' || ex.exerciseName.toLowerCase().includes(term))
  );
});

//modal state
isWorkoutExerciseModalVisible = false;
isSubmitting = false;
isEditMode = false;
editingExerciseId: string | null = null;

//forms
workoutForm = this.fb.group({
  workoutName: [''],
  workoutDescription: [''],
});

exerciseForm = this.fb.group({
  sets: this.fb.array([
      this.newSet()
    ])
});

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
      this.workoutExerciseService.getAllWorkoutExercises(this.workoutId).subscribe(data=>{
      this.workoutExercises.set(data)
      })
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
          this.rebuildPage(createdWorkout);
        },
        error: (err) => {
          console.error('Failed to create workout:', err); // for now console
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

//Exercise section logic
onSearch(term: string): void{
  this.searchTerm.set(term);
}

onExerciseSelected(value: string): void {
  if (value === "__create__") {
    this.selectedExercise.set(null);
    this.openCreateExerciseModal();
    this.rebuildPage(this.workout!)
    return;
  }

  this.selectedExercise.set(value);
}

openCreateExerciseModal(): void {

  this.modal.create({
    nzTitle: 'Create New Exercise',
    nzContent: ExerciseForm,
    nzOnOk: () => {
      // reload exercises after creation
      this.loadExercises();
    },
    nzFooter: null
  });
  
}

onDropdownOpen(open: boolean): void {
    if (open && this.exercises.length === 0) {
      this.loadExercises();
    }
}

loadExercises(): void{
  this.exerciseService.getAllExercises().subscribe({
    next: (data) => this.exercises.set(data),
    error: (err) => console.error("Failed to load exercises", err)
  })
}

removeExercise(exerciseId: string) {
  this.workoutExerciseService.deleteWorkoutExercise(exerciseId).subscribe({
    next: () =>{
      this.rebuildPage(this.workout!);
    },
    error: (err) =>{
      console.error('Failed to create workout: ', err); // for now console
    }
  })
}

linkSuperset() {
  console.log('link')
}

//'Add exercise to workout modal' section
openAddWorkoutExerciseModal(): void {
  if(this.selectedExercise()){
    this.isWorkoutExerciseModalVisible = true;
    this.isEditMode = false;
    this.editingExerciseId = null;

    this.exerciseForm.setControl('sets', this.fb.array([
      this.fb.group({ setNumber: 1, reps: null, weight: null })
    ]));
  }
  else this.message.error('Choose an exercise you want to add first') 
}

openEditWorkoutExerciseModal(exercise: WorkoutExerciseDto): void {
  this.isWorkoutExerciseModalVisible = true;
  this.isEditMode = true;
  this.editingExerciseId = exercise.workoutExerciseId!;

  const setsArray = this.fb.array(
    exercise.sets.map(s => this.fb.group({
      setNumber: s.setNumber,
      reps: s.reps,
      weight: s.weight
    }))
  );
  this.exerciseForm.setControl('sets', setsArray);
}



handleCancel(): void {
    this.isWorkoutExerciseModalVisible = false;
    this.exerciseForm.reset();
  }

handleOk(): void {

  if (this.exerciseForm.invalid) {
    this.message.error('Please fill all fields correctly.');
  return;
}

  
  const sets: WorkoutSetDto[] = this.exerciseForm.value.sets!.map((s: any, idx: number) => ({
    setNumber: idx + 1,
    reps: s.reps,
    weight: s.weight
  }));


  if(this.isEditMode && this.editingExerciseId){
    
    this.workoutExerciseService.updateWorkoutExercise(this.editingExerciseId, sets)
      .subscribe(() => {
        this.loadExercises();
        this.handleCancel();
        this.rebuildPage(this.workout!);
    })
  }
  else{

    const exerciseId = this.selectedExercise();
    const dto: WorkoutExerciseDto = {
      workoutExerciseId: this.workout!.workoutId,
      exerciseId: exerciseId!,
      sets
    };

    if (exerciseId && this.workoutId) {
    this.workoutExerciseService
      .addWorkoutExercise(this.workoutId, dto)
      .subscribe(() => {
        this.loadExercises();
        this.handleCancel();
        this.rebuildPage(this.workout!);
        this.selectedExercise.set(null);
      });
  }
  }
  
}

// set interaction methods
newSet(): FormGroup {
  return this.fb.group({
    reps: [null, [Validators.required, Validators.min(1)]],
    weight: [null, [Validators.required, Validators.min(0)]],
  });
}

get sets() {
  return this.exerciseForm.get('sets') as FormArray<FormGroup>;
}

addSet(): void {
  this.sets.push(this.newSet());
}

removeSet(index: number): void {
  this.sets.removeAt(index);
}

// drag and drop reordering
drop(event: CdkDragDrop<any[]>): void {
  moveItemInArray(this.workoutExercises(), event.previousIndex, event.currentIndex);

  const newOrder = this.workoutExercises().map((ex, idx) => ({
    workoutExerciseId: ex.workoutExerciseId,
    exerciseOrder: idx
  }));

  this.workoutExerciseService.updateWorkoutExerciseOrder(this.workoutId, newOrder).subscribe();
}

trackById(index: number, item: any): string {
  return item.workoutExerciseId;
}

//page reload so it could load the new data
rebuildPage(w: Workout){
  this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(
      ['/workout', w!.workoutName || 'workout'],
      { queryParams: { id: w!.workoutId } }
    );
  });
}
}