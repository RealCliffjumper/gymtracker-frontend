import { Component, EventEmitter, inject, Input, Optional, Output } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Exercise } from '../../models/exercise';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { MUSCLE_GROUP_LABELS } from '../../models/musclegroups-dictionary';
import { MUSCLE_GROUPS } from '../../models/musclegroups';
import { NzCardModule } from "ng-zorro-antd/card";
import { ExerciseService } from '../../../core/services/exercise.service';
import { UserService } from '../../../core/services/user.service';
import { NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { EQUIPMENT_TYPE } from '../../models/equipment';
import { EQUIPMENT_TYPE_LABELS } from '../../models/equipment-dictionary';
import { ExerciseDto } from '../../models/exercise.dto';
import { ActivatedRoute, Router } from '@angular/router';
import {  NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-exercise-form',
  standalone: true,
  imports: [
    NzSelectModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzFormModule,
    NzCardModule,
    NzModalModule
],
  templateUrl: './exercise-form.html',
  styleUrl: './exercise-form.css'
})
export class ExerciseForm {
  @Input() initialExercise: Exercise | null = null;
  @Output() save = new EventEmitter<Exercise>();

  exerciseService = inject(ExerciseService)
  userService = inject(UserService)
  modalRef = inject(NzModalRef, {optional: true})
  modal = inject(NzModalService)
  fb = inject(FormBuilder);
  route = inject(ActivatedRoute)
  message = inject(NzMessageService)
  router = inject(Router)

  muscleGroupLabels = MUSCLE_GROUP_LABELS;
  availableMuscleGroups = MUSCLE_GROUPS;

  equipmentTypes = EQUIPMENT_TYPE;
  equipmentDic = EQUIPMENT_TYPE_LABELS;

  constructor() { }

  isUpdatable = false;
  exerciseId = '';

  exercise: Exercise | null = null;

  exerciseForm = this.fb.group({
      exerciseName: ['', Validators.required],
      exerciseDescription: [''],
      muscleGroup: ['', Validators.required],
      equipment: ['', Validators.required],
  });

  ngOnInit(): void {
    
    if (this.initialExercise) {
      this.exerciseForm.patchValue(this.initialExercise);
      this.isUpdatable = false
    }

    this.exerciseId = this.route.snapshot.queryParamMap.get('exid')!;
    if(this.exerciseId){
      this.exerciseService.getExercise(this.exerciseId).subscribe({
        next: (fetchedExercise)=> {
          this.exercise = fetchedExercise;
          this.exerciseForm.patchValue(fetchedExercise)
          this.isUpdatable = true;
        }
      })
    }
  }

  submit(): void {
    if (this.exerciseForm.invalid) {
      return;
    }
    const user = this.userService.currentUser();

    if(user && !this.isUpdatable){
      const dto: ExerciseDto = {
        exerciseName: this.exerciseForm.value.exerciseName ?? '',
        exerciseDescription: this.exerciseForm.value.exerciseDescription ?? '',
        muscleGroup: this.exerciseForm.value.muscleGroup ?? '',
        equipment: this.exerciseForm.value.equipment ?? '',
    };
    
      this.exerciseService.createExercise(user.userId, dto).subscribe({
      next: (createdExercise) => {
        if(this.modalRef){
          this.modalRef.close(createdExercise);
        }
        
      },
      error: () => {
        if(this.modalRef){
          this.modalRef.destroy();
        }
      }
    });
  }
    if(this.isUpdatable){
      this.updateExercise()
    }
  }

  updateExercise(){
    const formValue = this.exerciseForm.value;
  
    const updatedExercise: ExerciseDto = {
        exerciseName: formValue.exerciseName!,
        exerciseDescription: formValue.exerciseDescription!,
        muscleGroup: formValue.muscleGroup!,
        equipment: formValue.equipment!
    };
  
    this.exerciseService.updateExercise(this.exerciseId, updatedExercise).subscribe({
        next: () =>{
            this.message.success('Applied changes to exercise')
        },
      });
  }

  deleteExercise(){
    if(this.modal){
      this.modal.confirm({
        nzTitle: '<i>Delete exercise</i>',
        nzContent: '<b>Are you sure you want to delete this exercise?</b>',
        nzOkText: 'Yes',
        nzOnOk: () => 
          [
            this.exerciseService.deleteExercise(this.exerciseId).subscribe({
              next: () => this.router.navigate(['/profile'])
            })
          ]
      });
    }
  }
}
