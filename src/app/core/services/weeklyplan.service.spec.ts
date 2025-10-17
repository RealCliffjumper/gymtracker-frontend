import { TestBed } from '@angular/core/testing';

import { WeeklyPlanService } from './weeklyplan.service';

describe('WeeklyplanService', () => {
  let service: WeeklyPlanService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WeeklyPlanService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
