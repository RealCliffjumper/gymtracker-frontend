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


@Component({
  selector: 'app-auth',
  standalone:true,
  imports: [
    FormsModule,
    NzTabsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzTypographyModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css'
})


export class Auth {
  condition: 'login' | 'register' = 'login';

  switchTab(tab: 'login' | 'register') {
    this.condition = tab;
  }

  userDto: UserDto = {
    userLoginId: '',
    userFirstName: '',
    userLastName: '',
    password: ''
  };

  
  userLoginId = '';
  password = '';
  
    constructor(private authService: AuthService, private route: Router, private userService: UserService) {}
  
    onLogin() {
      this.authService.login({ userLoginId: this.userLoginId, password: this.password }).subscribe({
        next: (res) => {
          console.log('Login successful', res); //response body needs to be removed from console
          localStorage.setItem('jwtToken', res.token);
          this.userService.setUser(res.user);
          this.route.navigate(["/home"]);
        },
        error: (err) => {
          console.error('Login failed', err);
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