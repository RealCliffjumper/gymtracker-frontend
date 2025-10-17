import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { WeeklyPlan } from '../../shared/models/weekly-plan';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeeklyPlanService {
    http = inject(HttpClient);
    private apiUrl = 'http://localhost:8080/api/weekly'

    getWeeklyPlan(weeklyPlanId: string): Observable<WeeklyPlan>{
      return this.http.get<WeeklyPlan>(`${this.apiUrl}/${weeklyPlanId}/find`);
    }
  
    getWeeklyPlans(userId: string): Observable<WeeklyPlan[]>{
      return this.http.get<WeeklyPlan[]>(`${this.apiUrl}/${userId}/all`);
    }

    createWeeklyPlan(userId: string, weeklyPlanName: string): Observable<WeeklyPlan>{
      return this.http.post<WeeklyPlan>(`${this.apiUrl}/${userId}/create`, weeklyPlanName);
    }
  
    updateWeeklyPlan(weeklyPlanId: string, weeklyPlanName: string): Observable<WeeklyPlan>{
      return this.http.put<WeeklyPlan>(`${this.apiUrl}/${weeklyPlanId}/update`, {weeklyPlanName})
    }

    changeStatus(weeklyPlanId: string, userId: string, planActive: boolean): Observable<WeeklyPlan>{
      return this.http.put<WeeklyPlan>(`${this.apiUrl}/${weeklyPlanId}/status`, {userId, planActive})
    }

    deletePlan(weeklyPlanId: string): Observable<void>{
      return this.http.delete<void>(`${this.apiUrl}/delete/${weeklyPlanId}`)
    }
}
