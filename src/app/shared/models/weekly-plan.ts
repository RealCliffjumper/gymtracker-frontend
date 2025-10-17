import { WeeklyPlanEntry } from "./weekly-plan.entry";

export interface WeeklyPlan{
    weeklyPlanId: string;
    userId: string;
    weeklyPlanName: string;
    createdAt: Date;
    updatedAt: Date;
    planActive: boolean;
    entries: WeeklyPlanEntry[];
}