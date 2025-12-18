import { ScheduledExerciseUpdate } from "./scheduledexerciseupdate.dto";

export interface ScheduledUpdate{
    workoutNotes: string,
    status: string,
    startedAt: Date | null,
    completedAt: Date | null,
    exercises: ScheduledExerciseUpdate[]
    workoutPoints?: number
}