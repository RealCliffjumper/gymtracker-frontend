import { Component } from '@angular/core';
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
import { HttpClient } from '@angular/common/http';
import { NgClass } from '@angular/common';

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
  NgClass],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile {

  isPasswordModalVisible = false;
  isSubmitting = false;
  passwordForm!: FormGroup;
  
  user: User = {
    userId: '',
    userLoginId: '',
    userFirstName: '',
    userLastName: '',
    unitPreference: 'KG',
    createdAt: new Date,
    enabled: true,
    locked: false,
    roles: []
  };

  constructor(private userService: UserService, private fb: FormBuilder, private message: NzMessageService, private http: HttpClient, private modal: NzModalService) {
    // Load user data on init
    this.userService.currentUser$.subscribe(u => {
      if (u) {
        this.user = { ...u };
      }
    });
    
  }
  
  onSave() {
    this.userService.updateUser(this.user).subscribe({
      next: () => this.modal.success({
      nzTitle: 'Profile changed',
      nzContent: 'Applied profile changes',
      nzOkText: 'OK',
    }),
    
    error: (err) => {
      if(err.status === 304){
        this.message.warning('No changes were made');
        return;
      }
    }
  }
  )}

  //Modal handling

  ngOnInit(): void {
    this.passwordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });
  }

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

  const userId = this.userService.currentUserSubject.value?.userId;

  if (!userId) {
    this.message.error('User not logged in.');
    this.isSubmitting = false;
    return;
  }

  this.userService.changePassword(userId, oldPassword, newPassword).subscribe({
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
}
