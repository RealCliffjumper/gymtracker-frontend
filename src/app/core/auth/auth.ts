import { Component } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { UserDto } from '../../shared/models/user.dto';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-auth',
  standalone:true,
  imports: [
    FormsModule,
    NzTabsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzTypographyModule,
    NzModalModule,
    ReactiveFormsModule
],
  templateUrl: './auth.html',
  styleUrl: './auth.css'
})


export class Auth {

  userDto: UserDto = {
    userLoginId: '',
    userFirstName: '',
    userLastName: '',
    password: '',
    unitPreference: 'KG'
  };

  userLoginId = '';
  password = '';
  confirmPassword: string = '';

  selectedIndex = 0;

  switchTab(index: number): void {
    this.selectedIndex = index;
  }

  checkPasswordsMatch(): boolean {
    return this.userDto.password === this.confirmPassword;
  }

  constructor(private authService: AuthService, private route: Router, private userService: UserService, private modal: NzModalService, private message: NzMessageService) {}
  
  onLogin() {

    this.authService.login({ userLoginId: this.userLoginId, password: this.password }).subscribe({
      next: (res) => {
        localStorage.setItem('jwtToken', res.token);
          this.userService.setUser(res.user);
          this.route.navigate(['/home']);
      },

      error: () => {    
        this.message.error('Invalid credentials',{
          nzDuration: 4000
        })
      }
    });
  }

  onRegister() {

  if (!this.checkPasswordsMatch()) {
      this.message.error('Passwords do not match',{
          nzDuration: 4000
        })
    return;
  }

  this.authService.register(this.userDto).subscribe({
    next: (res) => {
      //console.log('Registration successful');
      localStorage.setItem('jwtToken', res.token);

      //this.userService.currentUserSubject.next(res.user);
      this.userService.setUser(res.user);
      this.route.navigate(["/home"]);
    },

    error: (err) => {
      if (err.status === 409) {
        this.message.error('Username already exists', {
          nzDuration: 4000
        });
        return;

      } else {
        const backendMessage = err.error?.message || 'Something went wrong. Please try again later';
        this.message.error(backendMessage, { nzDuration: 4000 });
      }
    }
  });
}
}