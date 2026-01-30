import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduledInfo } from './scheduled-info';

describe('ScheduledInfo', () => {
  let component: ScheduledInfo;
  let fixture: ComponentFixture<ScheduledInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduledInfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScheduledInfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
