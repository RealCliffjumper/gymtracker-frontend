import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable} from 'rxjs';
import { UserDto } from '../../shared/models/user.dto';
import { User } from '../../shared/models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) {}

  register(userDto: UserDto): Observable<{ user: User; token: string  }> {
    return this.http.post<{user:User; token :string }>(`${this.apiUrl}/registration`, userDto);
  }

  login(credentials: { userLoginId: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }
}
