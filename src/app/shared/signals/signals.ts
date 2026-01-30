import { computed, signal } from '@angular/core';
import { ScheduledExercise } from '../models/scheduledexercise';
import { CalendarWorkoutDto } from '../models/calendarworkout.dto';
import { getPercent } from 'ng-zorro-antd/core/util';
import { SetLogs } from '../models/setlogs.dto';

export const isWorkoutFinished = signal<boolean>(false);
export const isWorkoutStarted = signal<boolean>(false)
export const isWorkoutPaused = signal<boolean>(false);
export const workoutStartedAt = signal<Date | null>(null)
export const workoutPlanned = signal<boolean>(false);
export const exerciseIdCounter = signal<number>(0)
export const percent = computed(() => {
  var p = 0;

  const sve = savedVisibleExercises();
  const completedsve = savedVisibleExercises().filter(ex=> ex.completed || ex.skipped)

  return Math.round(getPercent(0, sve.length, completedsve.length))
})

const savedNotifcations = localStorage.getItem('notifications');
export const notifications = signal<string[]>(
  savedNotifcations ? JSON.parse(savedNotifcations) : []
);

const saved = localStorage.getItem('workoutInProgress');
export const workoutInProgress = signal<CalendarWorkoutDto | null>(
  saved ? JSON.parse(saved) : null
);

export const savedVisibleExercises = signal<ScheduledExercise[]>(JSON.parse(localStorage.getItem('savedVisibleExercises') ?? '[]'))
export const savedSets = signal<SetLogs[]>(JSON.parse(localStorage.getItem('savedSets') ?? '[]'))
export const savedNotes = signal<string | null>(localStorage.getItem('savedNotes'))
export const savedScheduledExercises = signal<ScheduledExercise[]>(JSON.parse(localStorage.getItem('savedScheduledExercises') ?? '[]'))