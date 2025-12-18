import { Injectable, signal } from '@angular/core';
import {intervalToDuration} from 'date-fns';
import { isWorkoutFinished, isWorkoutPaused, isWorkoutStarted, workoutInProgress, workoutStartedAt } from '../../shared/signals/signals';

@Injectable({
  providedIn: 'root'
})
export class TimerService {
    private intervalId: any = null;
    private pausedAt: any = null;
    private accumulatedPauseMs: any = null;
    timerDisplay = signal<string>(localStorage.getItem("timerDisplay") ?? "00:00:00");
    
    formatDurationHMS(d: Duration): string {
      const hours = String(d.hours ?? 0).padStart(2, '0'); 
      const minutes = String(d.minutes ?? 0).padStart(2, '0'); 
      const seconds = String(d.seconds ?? 0).padStart(2, '0'); 
      
      return `${hours}:${minutes}:${seconds}`;
    }

    localDateTimeArrayToDate(arr: number[]): Date {
      const [year, month, day, hour, minute, second, nanos] = arr;
      return new Date(
        year,
        month - 1,
        day,
        hour,
        minute,
        second,
        Math.floor(nanos / 1_000_000)
      );
    }
  
    timerSetup(){
      const startedAt = workoutStartedAt();
      const started = isWorkoutStarted();
      const paused = isWorkoutPaused();
      const finished = isWorkoutFinished();
  
      if (!startedAt) {
        console.log('yes')
        this.timerDisplay.set('00:00:00');
        return;
      }

      if(workoutInProgress() && startedAt && !paused){
        this.timerDisplay.set(localStorage.getItem("timerDisplay") ?? "00:00:00")
      }

      if (!started || finished) {
        if (this.intervalId) clearInterval(this.intervalId);
          this.intervalId = null;
          this.pausedAt = null;
        return;
      }

      if (paused) {
        if (!this.pausedAt) this.pausedAt = new Date();
        if (this.intervalId) clearInterval(this.intervalId);
        this.intervalId = null;
        return;
      } 
  
      if (!paused && this.pausedAt) {
        const now = new Date();
        this.accumulatedPauseMs += now.getTime() - this.pausedAt.getTime();
        this.pausedAt = null;
      }

      if (!this.intervalId) {
        //console.log('yes3')
        //console.log(this.pausedAt)
        this.intervalId = setInterval(() => {
          const now = new Date();
          const effectiveStart = new Date(
            startedAt.getTime() + this.accumulatedPauseMs
          );

          const duration = intervalToDuration({
            start: effectiveStart,
            end: now,
          });
  
          this.timerDisplay.set(
            this.formatDurationHMS(duration)
          );
        }, 1000);
      }
    }
}
