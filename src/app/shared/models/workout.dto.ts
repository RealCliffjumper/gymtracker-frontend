export interface WorkoutDto {
    workoutName: string;
    workoutDescription: string | null;
    muscleGroups: string[];
    createdAt: Date;
}
