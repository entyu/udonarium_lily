import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GameTableScratchMaskComponent } from './game-table-scratch-mask.component';

describe('GameTableScratchMaskComponent', () => {
  let component: GameTableScratchMaskComponent;
  let fixture: ComponentFixture<GameTableScratchMaskComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GameTableScratchMaskComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameTableScratchMaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
