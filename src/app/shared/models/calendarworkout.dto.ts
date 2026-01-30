import { ScheduledExercise } from "./scheduledexercise";

export interface CalendarWorkoutDto {
    scheduledWorkoutId: string;
    workoutId: string;
    workoutName: string;
    workoutDescription: string;
    workoutScheduledDate: Date;
    scheduledWorkoutExerciseIds: string[];
    muscleGroups: string[];
    startedAt?: number[];
    completedAt?: number[];
    exercises: ScheduledExercise[];
    workoutPoints?: number;
    isVirtual: boolean;
    status: string
    isSkipped?: boolean
    timeSpent?: Duration
}