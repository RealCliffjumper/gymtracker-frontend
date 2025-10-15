import { Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardComponent } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { User } from '../../shared/models/user';
import { UserService } from '../../core/services/user.service';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzModalComponent, NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NgClass } from '@angular/common';
import { Exercise } from '../../shared/models/exercise';
import { ExerciseService } from '../../core/services/exercise.service';
import { Router } from '@angular/router';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { ExerciseForm } from '../../shared/components/exercise-form/exercise-form';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule,
    NzTabsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzTypographyModule,
    NzCardComponent,
    NzRadioModule,
    ReactiveFormsModule,
    NzModalModule,
    NzModalComponent,
    NgClass,
    NzListModule,
    NzIconModule,
    NzTooltipModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile {

  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private message = inject(NzMessageService);
  private modal = inject(NzModalService);
  private exerciseService = inject(ExerciseService)
  private router = inject(Router)

  // Modal & state
  isPasswordModalVisible = false;
  isSubmitting = false;
  //
  
  user = signal<User>({
    userId: '',
    userLoginId: '',
    userFirstName: '',
    userLastName: '',
    unitPreference: 'KG',
    createdAt: new Date(),
    enabled: true,
    locked: false,
    roles: []
  });

  exercises = signal<Exercise[]>([]);

  userForm: FormGroup = this.fb.group({
    userFirstName: ['', Validators.required],
    userLastName: ['', Validators.required],
    userLoginId: ['', [Validators.required, Validators.email]],
    unitPreference: ['KG']
  });

  passwordForm: FormGroup = this.fb.group({
    oldPassword: ['', Validators.required],
    newPassword: ['', Validators.required],
    confirmPassword: ['', Validators.required]
  });

  constructor() {
    effect(() => {
      const currentUser = this.userService.currentUser();
      
      if (currentUser) {
        this.user.set({ ...currentUser });
        this.exerciseService.getUserExercises(this.user().userId).subscribe({
          next: (data) => this.exercises.set(data),
          error: (err) => console.error('Error loading workouts', err)
        });

        this.userForm.patchValue({
          userFirstName: currentUser.userFirstName,
          userLastName: currentUser.userLastName,
          userLoginId: currentUser.userLoginId,
          unitPreference: currentUser.unitPreference
        });
      }
    });
  }

  onSave() {
    const updatedUser: User = {
      ...this.user(),
      ...this.userForm.value
    };

    this.userService.updateUser(updatedUser).subscribe({
      next: () =>
        this.modal.success({
          nzTitle: 'Profile changed',
          nzContent: 'Applied profile changes',
          nzOkText: 'OK'
        }),
      error: (err) => {
        if (err.status === 304) {
          this.message.warning('No changes were made');
          return;
        }
        this.message.error('Failed to update profile');
      }
    });
  }

openCreateExerciseModal(): void {

  this.modal.create({
    nzTitle: 'Create New Exercise',
    nzContent: ExerciseForm,
    nzOnOk: () => {
     this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(
      ['/profile']
    );
  });
    },
    nzFooter: null
  });
  
}

  //Modal handling

  openChangePasswordModal(): void {
    this.isPasswordModalVisible = true;
  }

  handleCancel(): void {
    this.isPasswordModalVisible = false;
    this.passwordForm.reset();
  }

  handleOk(): void {
  if (this.passwordForm.invalid) {
    this.message.error('Please fill all fields correctly.');
    return;
  }

  const { oldPassword, newPassword, confirmPassword } = this.passwordForm.value;

  if (newPassword !== confirmPassword) {
    this.message.error('New passwords do not match.');
    return;
  }

  this.isSubmitting = true;

  const user = this.userService.currentUser();

  if (!user) {
    this.message.error('User not logged in.');
    this.isSubmitting = false;
    return;
  }


  this.userService.changePassword(user.userId, oldPassword, newPassword).subscribe({
    next: () => {
      this.message.success('Password changed successfully!');
      this.handleCancel();
      this.isSubmitting = false;
      this.userService.logout();
    },
    error: (err) => {
      this.message.error(err.error?.message || 'Failed to change password');
      this.isSubmitting = false;
    }
  });
}

  goToExercise(exercise: Exercise) {
    if (exercise) {
      this.router.navigate(['/exercise', exercise.exerciseName], {
        queryParams: { exid: exercise.exerciseId }
      });
    }
  }

  deleteUser(): void{
    this.modal.confirm({
          nzTitle: 'Account termination',
          nzContent: 'This action will delete your user account.',
          nzOkText: 'OK',
          nzOnOk: () => [
            this.userService.deleteUser(this.user().userId).subscribe({
              next:()=>{
                this.userService.logout()
              }
            })           
        ]})
  }
}
