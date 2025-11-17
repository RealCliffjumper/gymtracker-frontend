import { SetLogs } from "./setlogs.dto";

export interface ScheduledExercise{
    scheduledWorkoutExerciseId?: string | null,
    scheduledWorkoutId: string,
    workoutExerciseId?: string | null,
    exerciseId?: string | null,
    exerciseOrder: number,
    supersetGroupId: string | null,
    toDelete?: boolean,
    toSuperset?: boolean,
    toUnlikn?: boolean,
    sets: SetLogs[]
}