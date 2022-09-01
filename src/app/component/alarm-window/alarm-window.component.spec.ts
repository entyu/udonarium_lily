import { ComponentFixture, TestBed ,waitForAsync } from '@angular/core/testing';

import { AlarmWindowComponent } from './alarm-window.component';

describe('AlarmWindowComponent', () => {
  let component: AlarmWindowComponent;
  let fixture: ComponentFixture<AlarmWindowComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AlarmWindowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlarmWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
