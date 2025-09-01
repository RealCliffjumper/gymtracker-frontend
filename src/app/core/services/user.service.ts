import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from "rxjs";
import { User } from "../../shared/models/user";
import { map, distinctUntilChanged, tap, shareReplay } from "rxjs/operators";
import { JwtService } from './jwt.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/api/user';

  public currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated = this.currentUser$.pipe(map(user => !!user));

  constructor(private jwtService: JwtService, private router: Router, private http: HttpClient) {
  }

  getUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/get`);  }

  updateUser(user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${user.userId}`, user).pipe(
      tap(updated => this.setUser(updated))
    );
  }
  
  changePassword(userId: string, oldPassword: string, newPassword: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${userId}/password`, {
      oldPassword,
      newPassword
    });
  }

  deleteUser(userId: string): Observable<void>{
    return this.http.delete<void>(`${this.apiUrl}/delete/${userId}`);
  }

  setUser(user: User) :void {
    this.currentUserSubject.next(user);
  }

  logout(): void {
    this.purgeAuth();
    void this.router.navigate(["/auth"]);
  }

  purgeAuth(): void {
    this.jwtService.destroyToken();
    this.currentUserSubject.next(null);
  }
}
