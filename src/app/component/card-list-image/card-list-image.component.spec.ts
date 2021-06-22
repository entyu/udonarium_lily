import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardListImageComponent } from './card-list-image.component';

describe('CardListImageComponent', () => {
  let component: CardListImageComponent;
  let fixture: ComponentFixture<CardListImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardListImageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CardListImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
