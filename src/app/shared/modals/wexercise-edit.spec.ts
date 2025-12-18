import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WexerciseEdit } from './wexercise-edit';

describe('WexerciseEdit', () => {
  let component: WexerciseEdit;
  let fixture: ComponentFixture<WexerciseEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WexerciseEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WexerciseEdit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
