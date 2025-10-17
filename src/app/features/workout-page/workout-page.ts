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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
import { EMPTY, forkJoin } from 'rxjs';

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
    DragDropModule,
    RouterLink
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
selectedForSuperset = signal<string[]>([]);
selectedForSupersetRemoval = false;

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
    this.workoutId = this.route.snapshot.paramMap.get('workoutId')!;
    

    if (this.workoutId) {
        this.workoutService.getWorkout(this.workoutId).subscribe(data => {
        this.workout = data;

        this.workoutForm.controls['workoutName'].setValue(this.workout.workoutName)
        this.workoutForm.controls['workoutDescription'].setValue(this.workout.workoutDescription)
        this.createdAt = this.workout.createdAt
        this.updatedAt = this.workout.updatedAt

/*         if (this.workoutName !== data.workoutName) {
          this.router.navigate(
            ['/workout', data.workoutName],
            {
              queryParams: { id: this.workoutId },
              replaceUrl: true
            }
          );
        } */
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

  this.workoutService.updateWorkout(this.workout!.workoutId, updatedWorkout).subscribe({
      next: () =>
        this.message.success( 'Applied changes to workout'),
      error: (err) => {
        if (err.status === 304) {
          this.message.warning('No changes were made');
          return;
        }
        this.message.error('Failed to update workout');
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
  const user = this.userService.currentUser();
  if (!user) return;

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


toggleSuperset(workoutExerciseId: string, exerciseOrder: number){
  const current = this.selectedForSuperset();

  if (current.includes(workoutExerciseId)) {

    this.selectedForSuperset.set(current.filter(id => id !== workoutExerciseId));
    return;
  }

  if (current.length === 0) {
    this.selectedForSuperset.set([workoutExerciseId]);

  } else if (current.length === 1) {
    const [firstId] = current;
    const firstExercise = this.workoutExercises().find(e => e.workoutExerciseId === firstId);


    if (!firstExercise) return;
    
    const isSequential = Math.abs(firstExercise.exerciseOrder! - exerciseOrder!) === 1;
    
    if(!isSequential) {
      this.message.warning("Supersets must be sequential exercises!");
      this.selectedForSuperset.set([]);
      return;
    }

    this.selectedForSuperset.set([firstId, workoutExerciseId]);

    const setid1 = firstExercise.supersetGroupId
    const setid2 = this.workoutExercises().find(e => e.workoutExerciseId === workoutExerciseId)?.supersetGroupId


    if(setid1 && setid2 && setid1 === setid2){
      this.workoutExerciseService
      .removeSupersetWorkoutExercise(firstId, workoutExerciseId)
      .subscribe(() => {
        this.message.success("Superset relation removed");
        this.loadExercises();
        this.selectedForSuperset.set([]);
        this.rebuildPage(this.workout!)
      });
    }

    else {
      this.workoutExerciseService
      .supersetWorkoutExercise(firstId, workoutExerciseId)
      .subscribe(() => {
        this.message.success("Superset linked!");
        this.loadExercises();
        this.selectedForSuperset.set([]);
        this.rebuildPage(this.workout!)
      });
    }}
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
      ['/workout', w!.workoutId]
    );
  });
}

getSupersetColor(groupId: string | null): string {
  if (!groupId) return 'transparent';

  const hash = Array.from(groupId)
    .map(c => c.charCodeAt(0))
    .reduce((acc, val) => acc + val, 0);

  return this.supersetColors[hash % this.supersetColors.length];
}
}