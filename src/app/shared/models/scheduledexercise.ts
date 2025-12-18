import { SetLogs } from "./setlogs.dto";

export interface ScheduledExercise{
    scheduledWorkoutExerciseId: string,
    tempExId?: string,
    scheduledWorkoutId: string,
    workoutExerciseId: string | null,
    exerciseName: string,
    exerciseId: string,
    exerciseOrder: number,
    skipped: boolean,
    completed: boolean,
    isStarted?: boolean,
    supersetGroupId: string | null,
    exercisePoints?: number,
    sets: SetLogs[]
}