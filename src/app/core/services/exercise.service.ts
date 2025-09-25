import { inject, Injectable } from '@angular/core';
import { Exercise } from '../../shared/models/exercise';
import { ExerciseDto } from '../../shared/models/exercise.dto';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExerciseService {
  private apiUrl = 'http://localhost:8080/api/exercise';

  http = inject(HttpClient)


  createExercise(userId: string, exerciseDto: ExerciseDto): Observable<Exercise>{
    return this.http.post<Exercise>(`${this.apiUrl}/${userId}/create`, exerciseDto);
  }
  
  getAllExercises(): Observable<Exercise[]>{
    return this.http.get<Exercise[]>(`${this.apiUrl}/all`);
  }

  updateExercise(exerciseId: string, exerciseDto: ExerciseDto): Observable<Exercise>{
    return this.http.put<Exercise>(`${this.apiUrl}/${exerciseId}/update`, exerciseDto)
  }
  
  getExercise(exerciseId: string): Observable<Exercise>{
    return this.http.get<Exercise>(`${this.apiUrl}/${exerciseId}/find`);
  }
  
  getUserExercises(userId: string): Observable<Exercise[]>{
    return this.http.get<Exercise[]>(`${this.apiUrl}/${userId}/all`);
  }
  
  deleteExercise(exerciseId: string): Observable<void>{
    return this.http.delete<void>(`${this.apiUrl}/delete/${exerciseId}`);
  }
}
