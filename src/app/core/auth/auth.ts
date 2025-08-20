import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
    NzModalModule],
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
  
    constructor(private authService: AuthService, private route: Router, private userService: UserService, private modal: NzModalService) {}
  
    onLogin() {
      this.authService.login({ userLoginId: this.userLoginId, password: this.password }).subscribe({
        next: (res) => {
          console.log('Login successful', res); //response body needs to be removed from console
          localStorage.setItem('jwtToken', res.token);
          this.userService.setUser(res.user);
          this.route.navigate(["/home"]);
        },
        error: () => {    //handle errors via backend
          this.modal.error({
          nzTitle: 'Invalid credentials',
          nzContent: 'Check your password or email',
          nzOkText: 'OK',
    });
        }
      });
    }

    onRegister() {
    this.authService.register(this.userDto).subscribe({
      next: (res) => {
        console.log('Registration successful', res); //response body needs to be removed from console
        localStorage.setItem('jwtToken', res.token);
        this.userService.currentUserSubject.next(res.user);
        this.route.navigate(["/home"]);
      },
      error: (err) => {
        console.error('Registration failed', err);
      }
    });
}
}