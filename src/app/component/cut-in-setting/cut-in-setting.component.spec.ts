import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CutInSettingComponent } from './cut-in-setting.component';

describe('CutInSettingComponent', () => {
  let component: CutInSettingComponent;
  let fixture: ComponentFixture<CutInSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CutInSettingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CutInSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
