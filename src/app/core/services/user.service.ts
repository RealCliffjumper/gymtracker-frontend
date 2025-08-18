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

  public currentUserSubject :BehaviorSubject<User | null>
  public currentUser : Observable<User | null>
  public isAuthenticated: Observable<boolean>

  constructor(private jwtService: JwtService, private router: Router) {
    const storedUser = localStorage.getItem('user');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );

    this.currentUser = this.currentUserSubject
      .asObservable()
      .pipe(distinctUntilChanged());

    this.isAuthenticated = this.currentUser.pipe(map(user => !!user));}


  setUser(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  logout(): void {
    this.purgeAuth();
    void this.router.navigate(["/"]);
  }

  purgeAuth(): void {
    this.jwtService.destroyToken();
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }
}
