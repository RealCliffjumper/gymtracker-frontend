import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduledWorkout } from './scheduled-workout';

describe('ScheduledWorkout', () => {
  let component: ScheduledWorkout;
  let fixture: ComponentFixture<ScheduledWorkout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduledWorkout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScheduledWorkout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
