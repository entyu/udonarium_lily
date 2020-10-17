import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StandSettingComponent } from './stand-setting.component';

describe('StandSettingComponent', () => {
  let component: StandSettingComponent;
  let fixture: ComponentFixture<StandSettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StandSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StandSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
