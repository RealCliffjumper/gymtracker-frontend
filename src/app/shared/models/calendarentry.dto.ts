export interface CalendarEntry{
    scheduledWorkoutId: string;
    workoutId: string;
    workoutName: string;
    workoutScheduledDate: Date;
    isVirtual: boolean;
    status: string
    isSkipped?: boolean
}