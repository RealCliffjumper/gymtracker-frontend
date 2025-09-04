import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutPage } from './workout-page';

describe('WorkoutPage', () => {
  let component: WorkoutPage;
  let fixture: ComponentFixture<WorkoutPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkoutPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkoutPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
