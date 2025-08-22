import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzCalendarModule, NzCalendarMode } from 'ng-zorro-antd/calendar';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    FormsModule,
    NzCalendarModule
  ],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css'
})
export class Calendar {

  date = new Date(2025, 7, 1);
  mode: NzCalendarMode = 'month';

  panelChange(change: { date: Date; mode: string }): void {
    console.log(change.date, change.mode);
  }
}
