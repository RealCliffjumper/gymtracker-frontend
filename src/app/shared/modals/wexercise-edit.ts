import { Component, computed, inject, signal } from '@angular/core';
import { EQUIPMENT_TYPE } from '../models/equipment';
import { EQUIPMENT_TYPE_LABELS } from '../models/equipment-dictionary';
import { MUSCLE_GROUPS } from '../models/musclegroups';
import { MUSCLE_GROUP_LABELS } from '../models/musclegroups-dictionary';
import { ExerciseService } from '../../core/services/exercise.service';
import { WorkoutExerciseService } from '../../core/services/workout-exercise.service';
import { NzFormItemComponent, NzFormModule } from 'ng-zorro-antd/form';
import { NzOptionComponent } from 'ng-zorro-antd/select';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NzListModule } from 'ng-zorro-antd/list';
import { Exercise } from '../models/exercise';
import { NZ_MODAL_DATA, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { WorkoutSetDto } from '../models/workout-exercise-set';
import { UserService } from '../../core/services/user.service';
import { WorkoutExerciseDto } from '../models/workout-exercise.dto';
import { NzMessageService } from 'ng-zorro-antd/message';
import { SetLogs } from '../models/setlogs.dto';
import { toDecimal } from 'ng-zorro-antd/core/util';
import { exerciseIdCounter} from '../signals/signals';
import { ScheduledExercise } from '../models/scheduledexercise';
import { NzButtonComponent, NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzColDirective, NzRowDirective } from 'ng-zorro-antd/grid';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-wexercise-edit',
  standalone: true,
  imports: [
    NzFormModule,
    ReactiveFormsModule,
    CommonModule,
    NzListModule,
    NzButtonModule,
    NzInputModule,
    FormsModule,
    NzRowDirective,
    NzColDirective,
    NzDividerModule,
    NzIconModule
  ],
  templateUrl: './wexercise-edit.html',
  styleUrl: './wexercise-edit.css'
})
export class WexerciseEdit {
  readonly nzModalData = inject(NZ_MODAL_DATA);
  
  exerciseId: any
  isScheduled: any
  editing: any
  newOrder: any
  started: any
  UM: any

  exerciseService = inject(ExerciseService)
  workoutExerciseService = inject(WorkoutExerciseService)
  userService = inject(UserService)
  fb = inject(FormBuilder)
  modalRef = inject(NzModalRef)
  modal = inject(NzModalService)
  message = inject(NzMessageService)
  workoutExercise = signal<ScheduledExercise | null>(null)

  exercise = signal<Exercise | null>(null)
  
  wSets = signal<WorkoutSetDto[]>([])
  updatedSets = signal<SetLogs[]>([])

  equip = EQUIPMENT_TYPE
  equip_dic = EQUIPMENT_TYPE_LABELS
  musclegroup = MUSCLE_GROUPS
  musclegroup_dic = MUSCLE_GROUP_LABELS

  isSubmitting=false;

  exerciseForm = this.fb.group({
    sets: this.fb.array([
        this.newSet()
      ])
  });

  ngOnInit(){
    this.workoutExercise.set(this.nzModalData.workoutExerciseInstance)
    this.exerciseId = this.nzModalData.exerciseId
    this.isScheduled = this.nzModalData.isScheduled
    this.editing = this.nzModalData.editing
    this.newOrder = this.nzModalData.length
    this.started = this.nzModalData.started
    const we = this.workoutExercise()
    this.UM = this.userService.currentUser()?.unitPreference
    if(we){ //this largely stays the same
          const setsArray = this.fb.array(
            we.sets.map(s => this.fb.group({
              setLogId: s.setLogId,
              setNumber: s.setNumber,
              reps: s.actualReps,
              weight: s.actualWeight
            }))
          );
          this.exerciseForm.setControl('sets', setsArray);
          this.updatedSets.set(we.sets.map(s=> ({
            setLogId: s.setLogId,
            setNumber: s.setNumber,
            actualReps: s.actualReps,
            actualWeight: s.actualWeight,
            toSkip: s.toSkip,
            toComplete: s.toComplete
          })))

          //this.wSets.set(workoutExercise.sets)

          this.exerciseService.getExercise(this.exerciseId).subscribe({
            next:(data)=>{
              this.exercise.set(data)
            }
          })

    }
    else {
      this.exerciseService.getExercise(this.exerciseId).subscribe({
        next:(data)=>{
          this.exercise.set(data)

          this.exerciseForm.setControl('sets', this.fb.array([
            this.fb.group({ setNumber: 1, reps: 0, weight: 0 })
          ]));
          this.updatedSets.update(sets => [
            {
              setLogId: null,
              setNumber: 1,
              actualReps: 0,
              actualWeight: 0,
              toSkip: false,
              toComplete: false
            },
            ...sets
          ]);
        }
      })
    }
  }

  ngOnClose(){
    this.modal.warning({
          nzTitle: 'Possibly unsaved changes',
          nzContent: 'If you have made any changes they might not be saved',
          nzOkText: 'Save',
          nzOnOk: () => [
            this.save()
          ],
          nzCancelText: 'Close',
          nzOnCancel:() => this.modalRef.close()
      })
  }

  save(){
    if (this.exerciseForm.invalid) {
        this.message.error('Please fill all fields correctly.');
      return;
    }

    if(this.editing){
      const formSets = this.sets.value.map((s: any, idx: number) => ({
        setNumber: idx + 1,
        actualReps: s.reps ?? 0,
        actualWeight: s.weight ?? 0,
      }));

      this.updatedSets.update(currentSets => //this should be changed to normal sets or straight up dto object
        currentSets.map(existingSet => {
          const matchingFormSet = formSets.find(fs => fs.setNumber === existingSet.setNumber);
          if (matchingFormSet) {
            return {
              ...existingSet,
              scheduledWorkoutExerciseId: this.workoutExercise()?.scheduledWorkoutExerciseId,
              tempExId: this.workoutExercise()?.tempExId,
              actualReps: matchingFormSet.actualReps,
              actualWeight: matchingFormSet.actualWeight
            };
          }
          return existingSet;
        })
      );

      console.log('merged updated:', this.updatedSets());
      this.modalRef.close(this.updatedSets())
    }

    else {

      const sets = this.exerciseForm.value.sets!.map((s: any, idx: number) => ({
        setLogId: this.wSets()?.[idx]?.setLogId ?? null,
        tempExId: exerciseIdCounter(),
        setNumber: idx + 1,
        actualReps: s.reps,
        actualWeight: s.weight,
        toSkip: s.toSkip,
        toComplete: s.toComplete
      }));
      //console.log(sets)
      this.updatedSets.update(currentSets => //this should be changed to normal sets or straight up dto object
        currentSets.map(existingSet => {
          const matchingFormSet = sets.find(fs => fs.setNumber === existingSet.setNumber);
          if (matchingFormSet) {
            return {
              ...existingSet,
              actualReps: matchingFormSet.actualReps,
              actualWeight: matchingFormSet.actualWeight
            };
          }
          return existingSet;
        })
      );

      if(this.isScheduled){

        const dto = {
          scheduledWorkoutExerciseId: null,
          tempExId: exerciseIdCounter(),
          exerciseId: this.exerciseId,
          exerciseOrder: this.newOrder,
          exerciseName: this.exercise()!.exerciseName,
          supersetGroupId: null,
          sets: this.updatedSets()
      };
      exerciseIdCounter.update(value => value+1)
      //console.log(this.newOrder)
      this.modalRef.close(dto)
      }

      else{

        const dto = {
        workoutExerciseId: '',
        exerciseId: this.exerciseId,
        exerciseName: this.exercise()!.exerciseName,
        supersetGroupId: null,
        sets
      };

      this.modalRef.close(dto)
      }
    }
  }

  close(){
    this.modalRef.close('closed')
  }

  newSet(): FormGroup {
    return this.fb.group({
      setLogId: [null],
      setNumber: [0],
      reps: [0, [Validators.required, Validators.min(1)]],
      weight: [0, [Validators.required, Validators.min(0)]],
      toDelete: [false]
    });
  }

  get sets() {
    return this.exerciseForm.get('sets') as FormArray<FormGroup>;
  }

  addSet(): void {
    const setGroup = this.newSet();
    const newSetNumber = this.sets.length + 1;
    setGroup.patchValue({ setNumber: newSetNumber });

    this.sets.push(setGroup);

    this.updatedSets.update(values => [
      ...values,
      {
        setLogId: null,
        setNumber: newSetNumber,
        actualReps: setGroup.value.reps,
        actualWeight: setGroup.value.weight,
        toDelete: false
      }
    ]);

    setGroup.valueChanges.subscribe(value => {
    this.updatedSets.update(values =>
      values.map(s =>
        s.setNumber === newSetNumber
          ? {
              ...s,
              actualReps: value.reps,
              actualWeight: value.weight
            }
          : s
      )
    );
  });
  }

  removeSet(index: number): void {
    this.sets.removeAt(index);

    this.updatedSets.update(sets =>
      sets.filter(s => !(s.setLogId === null && s.setNumber === index + 1))
      .map(s =>
        s.setLogId !== null && s.setNumber === index + 1
          ? { ...s, toDelete: true }
          : s
      )
    );
    console.log(this.updatedSets())
  }

  skipSet(index: number): void{

    this.updatedSets.update(current =>
      current.map(s =>
        s.setNumber === index + 1
          ? { ...s, toSkip: !s.toSkip, toComplete: false }
          : s
      )
    );
    console.log(this.updatedSets())
  }

  completeSet(index: number): void{
    const setGroup = this.sets;
    this.updatedSets.update(current =>
      current.map(s =>
        s.setNumber === index + 1
          ? { ...s, toComplete: !s.toComplete, toSkip: false, setPoints: (setGroup.value[index].reps*setGroup.value[index].weight)/10 }
          : s
      )
    );
    this.message.success(`Conratulations you have earned: ${this.updatedSets()[index].setPoints} points for this set!`, {nzDuration: 2000})
  }
}
