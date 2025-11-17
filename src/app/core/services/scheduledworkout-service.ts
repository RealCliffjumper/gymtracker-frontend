import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, ObservedValueOf } from 'rxjs';
import { CalendarWorkoutDto } from '../../shared/models/calendarworkout.dto';
import { ScheduledUpdate } from '../../shared/models/scheduledupdate.dto';
import { CalendarEntry } from '../../shared/models/calendarentry.dto';

@Injectable({
  providedIn: 'root'
})
export class ScheduledworkoutService {
  http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/scheduled'
  
  
  getScheduledWorkouts(userId: string, from: string, to: string): Observable<CalendarEntry[]> {
    return this.http.get<CalendarEntry[]>(`${this.apiUrl}/${userId}/all?&from=${from}&to=${to}`);
  }

  getScheduledWorkout(scheduledWorkoutId: string): Observable<CalendarWorkoutDto>{
    return this.http.get<CalendarWorkoutDto>(`${this.apiUrl}/get/${scheduledWorkoutId}`);
  }

  updateScheduledWorkout(scheduledWorkoutId: string, updatedScheduledWorkout: ScheduledUpdate): Observable<void>{
    return this.http.put<void>(`${this.apiUrl}/${scheduledWorkoutId}/update`, updatedScheduledWorkout)
  }
  
  updateStatus(scheduledWorkoutId: string, status: string): Observable<void>{
    return this.http.put<void>(`${this.apiUrl}/${scheduledWorkoutId}/status`, `"${status}"`,
       { headers: { 'Content-Type': 'application/json' } }
    )
  }

  refreshStatuses(userId: string): Observable<void>{
    return this.http.put<void>(`${this.apiUrl}/${userId}/refresh`, {});
  }

  generateScheduledWorkout(userId: string, workoutId: string, workoutScheduledDate: string, workoutStatus: string): Observable<CalendarWorkoutDto>{
    return this.http.post<CalendarWorkoutDto>(`${this.apiUrl}/${userId}/add`, {workoutId, workoutScheduledDate, workoutStatus})
  }

  deleteScheduledWorkout(scheduledWorkoutId: string): Observable<void>{
    return this.http.delete<void>(`${this.apiUrl}/${scheduledWorkoutId}/delete`)
  }
}
