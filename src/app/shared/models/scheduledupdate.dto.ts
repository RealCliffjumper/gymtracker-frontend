import { NonNullableFormBuilder } from "@angular/forms";
import { ScheduledExercise } from "./scheduledexercise.dto";

export interface ScheduledUpdate{
    workoutNotes: string,
    status: string,
    startedAt: Date | null,
    completedAt: Date | null,
    exercises: ScheduledExercise[]
}