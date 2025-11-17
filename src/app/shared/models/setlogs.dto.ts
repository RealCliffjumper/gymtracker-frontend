export interface SetLogs{
    scheduledWorkoutExerciseId?: string
    setLogId?: string | null,
    setNumber: number,
    actualReps: number,
    actualWeight: number,
    toDelete?: boolean
}