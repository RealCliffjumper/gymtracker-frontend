import { ScheduledExerciseUpdate } from "./scheduledexerciseupdate.dto";

export interface ScheduledUpdate{
    workoutNotes: string,
    status: string,
    startedAt: Date | null,
    completedAt: Date | null,
    muscleGroups: string[],
    exercises: ScheduledExerciseUpdate[]
    workoutPoints?: number
}