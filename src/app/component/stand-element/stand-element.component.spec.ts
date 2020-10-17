import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StandElementComponent } from './stand-element.component';

describe('StandElementComponent', () => {
  let component: StandElementComponent;
  let fixture: ComponentFixture<StandElementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StandElementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StandElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
