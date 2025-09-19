import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Exercise } from '../../models/exercise';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { MUSCLE_GROUP_LABELS } from '../../models/musclegroups-dictionary';
import { MUSCLE_GROUPS } from '../../models/musclegroups';
import { NzCardComponent, NzCardModule } from "ng-zorro-antd/card";
import { ExerciseService } from '../../../core/services/exercise.service';
import { UserService } from '../../../core/services/user.service';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { EQUIPMENT_TYPE } from '../../models/equipment';
import { EQUIPMENT_TYPE_LABELS } from '../../models/equipment-dictionary';
import { ExerciseDto } from '../../models/exercise.dto';

@Component({
  selector: 'app-exercise-form',
  standalone: true,
  imports: [
    NzSelectModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzFormModule,
    NzCardModule
],
  templateUrl: './exercise-form.html',
  styleUrl: './exercise-form.css'
})
export class ExerciseForm {
  @Input() initialExercise: Exercise | null = null;
  @Output() save = new EventEmitter<Exercise>();

  exerciseService = inject(ExerciseService)
  userService = inject(UserService)
  modal = inject(NzModalRef)
  fb = inject(FormBuilder);

  muscleGroupLabels = MUSCLE_GROUP_LABELS;
  availableMuscleGroups = MUSCLE_GROUPS;

  equipmentTypes = EQUIPMENT_TYPE;
  equipmentDic = EQUIPMENT_TYPE_LABELS;

  constructor() {
  }

  exerciseForm = this.fb.group({
      exerciseName: ['', Validators.required],
      exerciseDescription: [''],
      muscleGroup: ['', Validators.required],
      equipmentType: [''],
  });

  ngOnInit(): void {
    if (this.initialExercise) {
      this.exerciseForm.patchValue(this.initialExercise);
    }
  }

  submit(): void {
    if (this.exerciseForm.invalid) {
      return;
    }
    const user = this.userService.currentUser();

    if(user){
      const dto: ExerciseDto = {
      exerciseName: this.exerciseForm.value.exerciseName ?? '',
      exerciseDescription: this.exerciseForm.value.exerciseDescription ?? '',
      muscleGroup: this.exerciseForm.value.muscleGroup ?? '',
      equipmentType: this.exerciseForm.value.equipmentType ?? '',
    };
    
      this.exerciseService.createExercise(user.userId, dto).subscribe({
      next: (createdExercise) => {
        this.modal.close(createdExercise);
      },
      error: () => {
        this.modal.destroy();
      }
    });
  }
  }
}
