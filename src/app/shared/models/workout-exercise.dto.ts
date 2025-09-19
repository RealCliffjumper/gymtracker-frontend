import { WorkoutSetDto } from "./workout-exercise-set";

export interface WorkoutExerciseDto {
  workoutExerciseId: string;
  exerciseId: string;
  exerciseOrder?: number;
  exerciseName?: string;
  sets: WorkoutSetDto[];
}
