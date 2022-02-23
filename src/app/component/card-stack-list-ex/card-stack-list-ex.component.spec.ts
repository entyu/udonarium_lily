import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CardStackListComponentEx } from './card-stack-list-ex.component';

describe('CardStackListComponentEx', () => {
  let component: CardStackListComponentEx;
  let fixture: ComponentFixture<CardStackListComponentEx>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CardStackListComponentEx ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardStackListComponentEx);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
