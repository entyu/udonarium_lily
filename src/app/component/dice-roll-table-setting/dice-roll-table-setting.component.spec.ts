import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiceRollTableSettingComponent } from './dice-roll-table-setting.component';

describe('DiceRollTableSettingComponent', () => {
  let component: DiceRollTableSettingComponent;
  let fixture: ComponentFixture<DiceRollTableSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DiceRollTableSettingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DiceRollTableSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
