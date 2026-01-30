import { TestBed } from '@angular/core/testing';

import { ScheduledworkoutService } from './scheduledworkout-service.js';

describe('ScheduledworkoutServiceTs', () => {
  let service: ScheduledworkoutService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScheduledworkoutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
