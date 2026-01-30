import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { WeeklyPlanEntry } from '../../shared/models/weekly-plan.entry';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeeklyPlanEntryService {
  http = inject(HttpClient)
  private apiUrl = 'http://localhost:8080/api/weekly/entry'

  getEntries(weeklyPLanId: string): Observable<WeeklyPlanEntry[]>{
    return this.http.get<WeeklyPlanEntry[]>(`${this.apiUrl}/${weeklyPLanId}/all`);
  }

  addEntry(weeklyPlanId: string, workoutId: string, dow: string){
    return this.http.post<WeeklyPlanEntry>(`${this.apiUrl}/${weeklyPlanId}/add`, {workoutId, dow});
  }

  updateEntry(weeklyEntryId: string, workoutId: string): Observable<WeeklyPlanEntry>{
    return this.http.put<WeeklyPlanEntry>(`${this.apiUrl}/${weeklyEntryId}/update`, {workoutId});
  }

  deleteEntry(weeklyPlanEntryId: string): Observable<void>{
    return this.http.delete<void>(`${this.apiUrl}/delete/${weeklyPlanEntryId}`)
  }
}
