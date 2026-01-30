import { TestBed } from '@angular/core/testing';

import { WorkoutExerciseService } from './workout-exercise.service';

describe('WorkoutExerciseService', () => {
  let service: WorkoutExerciseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkoutExerciseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
