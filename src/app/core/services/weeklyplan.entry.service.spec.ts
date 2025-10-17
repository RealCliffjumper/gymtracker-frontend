import { TestBed } from '@angular/core/testing';

import { WeeklyPlanEntryService } from './weeklyplan.entry.service';

describe('WeeklyplanEntryService', () => {
  let service: WeeklyPlanEntryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WeeklyPlanEntryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
