import { Component, inject, signal } from '@angular/core';
import { WeeklyPlan } from '../../shared/models/weekly-plan';
import { WeeklyPlanService } from '../../core/services/weeklyplan.service';
import { UserService } from '../../core/services/user.service';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzColDirective, NzRowDirective } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';
import { Router } from '@angular/router';
import { NzModalModule,} from 'ng-zorro-antd/modal';
import { CommonModule } from '@angular/common';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  selector: 'app-plans',
  standalone: true,
  imports: [
    NzIconModule,
    NzColDirective,
    NzRowDirective,
    NzCardModule,
    NzModalModule,
    CommonModule,
    NzInputModule,
    FormsModule,
    NzButtonModule
  ],
  templateUrl: './plans.html',
  styleUrl: './plans.css'
})
export class Plans {
  userService = inject(UserService)
  weeklyPlanService = inject(WeeklyPlanService)
  router = inject(Router)
  planName = ''

  weeklyPlans = signal<WeeklyPlan[]>([]);
  isModalVisible = false;
  isSubmitting = false;

  ngOnInit(){
    const user = this.userService.currentUser();

    if(user){
      this.weeklyPlanService.getWeeklyPlans(user.userId).subscribe({
        next: (data) => {
          this.weeklyPlans.set(data)
        },
        error: () =>{
          console.log('noting')
        }
      })
    }
  }

  openAddPlanModal(){
    this.isModalVisible = true;
  }

  handleOk(){
    this.isSubmitting = true;
    this.addPlan(this.planName);
    this.isModalVisible = false;
  }

  handleCancel(){
    this.isModalVisible = false;
  }

  addPlan(name: string){
    const user = this.userService.currentUser()
    if(user){
      this.weeklyPlanService.createWeeklyPlan(user.userId, name).subscribe({
        next: (data) => {
          this.router.navigate(['/plan', data.weeklyPlanId])
        },
        error: (err) => {
          console.error('Failed to create plan:', err);
        }
    })
    }
  }

  goToPlan(plan: WeeklyPlan){
    this.router.navigate(["/plan", plan.weeklyPlanId])
  }
}
