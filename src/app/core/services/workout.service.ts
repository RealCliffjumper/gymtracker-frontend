import { Injectable } from '@angular/core';
import { WorkoutDto } from '../../shared/models/workout.dto';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Workout } from '../../shared/models/workout';

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  private apiUrl = 'http://localhost:8080/api/workout'

  constructor(private http: HttpClient){}


  createWorkout(userId: string, workoutDto: WorkoutDto): Observable<Workout>{
    return this.http.post<Workout>(`${this.apiUrl}/${userId}/create`, workoutDto);
  }

  updateWorkout(workoutId: string, workoutDto: WorkoutDto): Observable<Workout>{
    return this.http.put<Workout>(`${this.apiUrl}/${workoutId}/update`, workoutDto)
  }

  getWorkout(workoutId: string): Observable<Workout>{
    return this.http.get<Workout>(`${this.apiUrl}/${workoutId}/find`);
  }

  getUserWorkouts(userId: string): Observable<Workout[]>{
    return this.http.get<Workout[]>(`${this.apiUrl}/${userId}/all`);
  }

  deleteWorkout(workoutId: string): Observable<void>{
    return this.http.delete<void>(`${this.apiUrl}/delete/${workoutId}`);
  }
}
