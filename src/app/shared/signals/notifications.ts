import { computed, effect } from "@angular/core";
import { isWorkoutPaused, notifications, workoutInProgress, workoutPlanned } from "./signals";

export const dynamicNotifications = computed(() => {
  const list: string[] = [];

  const wip = workoutInProgress();
  const wpaused = isWorkoutPaused()
  const wplanned = workoutPlanned()
  if (wip) {
    if(wpaused){
        list.push(`You have an unfinished workout! ${wip.workoutName}`)
    }
    else list.push(`You have an active workout: ${wip.workoutName}`);
  }
  
  if(!wip && wplanned){
    list.push(`You have a workout scheduled for today`)
  }
  
  return list;
});
