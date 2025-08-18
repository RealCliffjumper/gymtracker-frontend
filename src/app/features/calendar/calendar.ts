import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css'
})
export class Calendar {

constructor(private userService: UserService, private route: Router) { }
logout(): void {
    this.userService.purgeAuth();
    this.route.navigate(["auth"])
  }
}

