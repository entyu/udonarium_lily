import { ComponentFixture, TestBed ,waitForAsync} from '@angular/core/testing';

import { GameCharacterBuffViewComponent } from './game-character-buff-view.component';

describe('GameCharacterBuffViewComponent', () => {
  let component: GameCharacterBuffViewComponent;
  let fixture: ComponentFixture<GameCharacterBuffViewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GameCharacterBuffViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameCharacterBuffViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
