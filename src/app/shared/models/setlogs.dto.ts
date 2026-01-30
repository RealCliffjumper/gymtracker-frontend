export interface SetLogs{
    scheduledWorkoutExerciseId?: string
    tempExId?: string,
    setLogId?: string | null,
    setNumber: number,
    actualReps: number,
    actualWeight: number,
    setPoints?: number,
    toSkip?: boolean,
    toComplete?: boolean,
    toDelete?: boolean
}