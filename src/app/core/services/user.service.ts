import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from "rxjs";
import { User } from "../../shared/models/user";
import { map, distinctUntilChanged, tap, shareReplay } from "rxjs/operators";
import { JwtService } from './jwt.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  public currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser = this.currentUserSubject
    .asObservable()
    .pipe(distinctUntilChanged());

  public isAuthenticated = this.currentUser.pipe(map((user) => !!user));

  constructor(private jwtService: JwtService, private router: Router) {}

  logout(): void {
    this.purgeAuth();
    void this.router.navigate(["/"]);
  }

  purgeAuth(): void {
    this.jwtService.destroyToken();
    this.currentUserSubject.next(null);
  }
}
