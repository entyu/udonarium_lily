import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ControllerInputComponent } from './controller-input.component';

describe('ControllerInputComponent', () => {
  let component: ControllerInputComponent;
  let fixture: ComponentFixture<ControllerInputComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ControllerInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ControllerInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
