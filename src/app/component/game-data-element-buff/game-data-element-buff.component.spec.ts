import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GameDataElementBuffComponent } from './game-data-element-buff.component';

describe('GameDataElementBuffComponent', () => {
  let component: GameDataElementBuffComponent;
  let fixture: ComponentFixture<GameDataElementBuffComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GameDataElementBuffComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameDataElementBuffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
