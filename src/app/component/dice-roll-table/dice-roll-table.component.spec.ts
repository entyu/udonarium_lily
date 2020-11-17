import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiceRollTableComponent } from './dice-roll-table.component';

describe('DiceRollTableComponent', () => {
  let component: DiceRollTableComponent;
  let fixture: ComponentFixture<DiceRollTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DiceRollTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DiceRollTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
