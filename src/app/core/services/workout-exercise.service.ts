import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { WorkoutExerciseDto } from '../../shared/models/workout-exercise.dto';
import { Observable } from 'rxjs';
import { WorkoutSetDto } from '../../shared/models/workout-exercise-set';

@Injectable({
  providedIn: 'root'
})
export class WorkoutExerciseService {
  private apiUrl = 'http://localhost:8080/api/workout_exercise'

  http = inject(HttpClient)

  getWorkoutExercise(workoutId: string): Observable<WorkoutExerciseDto>{
    return this.http.get<WorkoutExerciseDto>(`${this.apiUrl}/${workoutId}/find`);
  }
  
  getAllWorkoutExercises(workoutId: string): Observable<WorkoutExerciseDto[]>{
    return this.http.get<WorkoutExerciseDto[]>(`${this.apiUrl}/${workoutId}/all`);
  }

  addWorkoutExercise(workoutId: string, workoutExerciseBodyDto: WorkoutExerciseDto): Observable<WorkoutExerciseDto>{
    return this.http.post<WorkoutExerciseDto>(`${this.apiUrl}/${workoutId}/create`, workoutExerciseBodyDto);
  }
  
  updateWorkoutExercise(workoutExerciseId: string, updatedSets: WorkoutSetDto[]): Observable<WorkoutExerciseDto>{
    return this.http.put<WorkoutExerciseDto>(`${this.apiUrl}/${workoutExerciseId}/update`, updatedSets)
  }
  
  updateWorkoutExerciseOrder(workoutId: string, newOrder: { workoutExerciseId: string; exerciseOrder: number }[]): Observable<void>{
    return this.http.put<void>(`${this.apiUrl}/${workoutId}/reorder`, newOrder)
  }

  supersetWorkoutExercise(workoutExerciseId1: string, workoutExerciseId2: string){
    return this.http.put(`${this.apiUrl}/superset`, {workoutExerciseId1, workoutExerciseId2})
  }
  
  deleteWorkoutExercise(workoutExerciseId: string): Observable<void>{
    return this.http.delete<void>(`${this.apiUrl}/delete/${workoutExerciseId}`);
  }
}
