import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FileSelecterComponent } from './range-docking-character.component';

describe('RangeDockingCharacterComponent', () => {
  let component: ChatColorSettingComponent;
  let fixture: ComponentFixture<RangeDockingCharacterComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RangeDockingCharacterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RangeDockingCharacterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
