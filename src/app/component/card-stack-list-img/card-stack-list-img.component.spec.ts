import { ComponentFixture, TestBed ,waitForAsync} from '@angular/core/testing';

import { CardStackListImageComponent } from './card-stack-list-img.component';

describe('CardStackListImageComponent', () => {
  let component: CardStackListImageComponent;
  let fixture: ComponentFixture<CardStackListImageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CardStackListImageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardStackListImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
