import { WorkoutExerciseDto } from "./workout-exercise.dto";

export interface Workout {
    workoutId: string;
    userId: string;
    workoutName: string;
    workoutDescription: string;
    muscleGroups: string[];
    createdAt: Date;
    updatedAt: Date;
    exercises: WorkoutExerciseDto[];
}
