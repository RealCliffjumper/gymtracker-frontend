import { SetLogs } from "./setlogs.dto";

export interface ScheduledExerciseUpdate{
    scheduledWorkoutExerciseId?: string | null,
    tempExId?: string,
    scheduledWorkoutId: string,
    workoutExerciseId?: string | null,
    exerciseId?: string | null,
    exerciseOrder: number,
    supersetGroupId: string | null,
    toDelete?: boolean,
    toSuperset?: boolean,
    toUnlink?: boolean,
    toSkip?: boolean,
    toComplete?: boolean,
    exercisePoints?: number,
    sets: SetLogs[]
}